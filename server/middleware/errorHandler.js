// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Extract field name from error
    const field = Object.keys(err.keyValue)[0];
    if (field) {
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
    
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files',
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected file field',
      statusCode: 400
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

// Async handler to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: message
      });
    }

    next();
  };
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove potential XSS
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  
  next();
};

// CORS headers middleware
const corsHandler = (req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
  
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log response time on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// File upload validation middleware
const validateFileUpload = (options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    maxSize = 5 * 1024 * 1024, // 5MB
    required = false
  } = options;

  return (req, res, next) => {
    if (!req.files && !req.file) {
      if (required) {
        return res.status(400).json({
          success: false,
          message: 'File upload is required'
        });
      }
      return next();
    }

    const files = req.files || [req.file];
    
    for (let file of files) {
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
        });
      }
    }

    next();
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  validateRequest,
  sanitizeInput,
  corsHandler,
  securityHeaders,
  requestLogger,
  validateFileUpload
};
