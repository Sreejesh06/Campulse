const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                 req.header('x-auth-token') ||
                 req.cookies?.token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is valid but user not found' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'User account is deactivated' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = authorize('admin');

// Student only middleware  
const studentOnly = authorize('student');

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                 req.header('x-auth-token') ||
                 req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Middleware to check if user owns resource or is admin
const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user owns the resource
  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
  if (resourceUserId && req.user._id.toString() === resourceUserId) {
    return next();
  }

  return res.status(403).json({ 
    success: false, 
    message: 'Access denied. You can only access your own resources.' 
  });
};

// Middleware to validate user department access
const departmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Admin can access all departments
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user has access to the requested department
  const requestedDepartment = req.params.department || req.body.department || req.query.department;
  if (requestedDepartment && req.user.department !== requestedDepartment) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access your department resources.' 
    });
  }

  next();
};

// Middleware to validate hostel access
const hostelAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Admin can access all hostels
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user has access to the requested hostel
  const requestedHostel = req.params.hostelBlock || req.body.hostelBlock || req.query.hostelBlock;
  if (requestedHostel && req.user.hostelInfo?.block !== requestedHostel) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access your hostel resources.' 
    });
  }

  next();
};

// Rate limiting middleware for sensitive operations
const sensitiveOpLimit = (req, res, next) => {
  // This would typically use Redis or a rate limiting library
  // For now, we'll implement a basic in-memory rate limiter
  
  const key = `${req.ip}-${req.user?.id || 'anonymous'}-sensitive`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  // In production, use Redis for this
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const attempts = global.rateLimitStore.get(key) || [];
  const recentAttempts = attempts.filter(time => now - time < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({ 
      success: false, 
      message: 'Too many attempts. Please try again later.',
      retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
    });
  }

  recentAttempts.push(now);
  global.rateLimitStore.set(key, recentAttempts);

  next();
};

// Middleware to log user activities
const activityLogger = (action) => {
  return (req, res, next) => {
    // Store activity info in request for later logging
    req.activityLog = {
      action,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };
    
    // Continue to next middleware
    next();
  };
};

module.exports = {
  auth,
  authorize,
  adminOnly,
  studentOnly,
  optionalAuth,
  ownerOrAdmin,
  departmentAccess,
  hostelAccess,
  sensitiveOpLimit,
  activityLogger
};
