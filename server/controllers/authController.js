const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const { asyncHandler } = require('../middleware/errorHandler');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from output
  const userResponse = user.toObject();
  delete userResponse.password;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userResponse
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const {
    studentId,
    email,
    password,
    firstName,
    lastName,
    role,
    department,
    year,
    hostelInfo,
    phoneNumber
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email },
      ...(studentId ? [{ studentId }] : [])
    ]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === email 
        ? 'User with this email already exists'
        : 'User with this student ID already exists'
    });
  }

  // Create user
  const user = await User.create({
    studentId,
    email,
    password,
    firstName,
    lastName,
    role: role || 'student',
    department,
    year,
    hostelInfo,
    phoneNumber,
    profile: {
      bio: `${role === 'admin' ? 'Administrator' : 'Student'} at ${department || 'the university'}`
    }
  });

  // Send welcome email
  if (process.env.NODE_ENV !== 'development') {
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail registration if email fails
    }
  }

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact admin.'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('preferences.notifications')
    .select('-password');

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    department: req.body.department,
    year: req.body.year,
    hostelInfo: req.body.hostelInfo,
    profile: req.body.profile,
    preferences: req.body.preferences
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new password'
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email address'
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found with that email address'
    });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Send email
  try {
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Email send error:', error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a new password'
    });
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const verifyToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: verifyToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }

  // Mark email as verified
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.emailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate verification token
  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    // This would use emailService to send verification email
    // await emailService.sendVerificationEmail(user, verifyToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
});

// @desc    Deactivate account
// @route   PUT /api/auth/deactivate
// @access  Private
const deactivateAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your password to confirm deactivation'
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  // Verify password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password'
    });
  }

  // Deactivate account
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  sendTokenResponse(user, 200, res);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  deactivateAccount,
  refreshToken
};
