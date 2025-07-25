const express = require('express');
const {
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
} = require('../controllers/authController');

const { auth, sensitiveOpLimit } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', sensitiveOpLimit, login);
router.post('/forgotpassword', sensitiveOpLimit, forgotPassword);
router.put('/resetpassword/:resettoken', sensitiveOpLimit, resetPassword);
router.get('/verify/:token', verifyEmail);

// Protected routes
router.get('/logout', auth, logout);
router.get('/me', auth, getMe);
router.put('/updatedetails', auth, updateDetails);
router.put('/updatepassword', auth, sensitiveOpLimit, updatePassword);
router.post('/resend-verification', auth, resendVerification);
router.put('/deactivate', auth, sensitiveOpLimit, deactivateAccount);
router.post('/refresh', auth, refreshToken);

module.exports = router;
