const router = require('express').Router();
const { 
  signup, 
  login, 
  verifyOTP, 
  resendOTP, 
  forgotPassword, 
  resetPassword,
  googleAuth,
  forgotPasswordOTP,
  verifyResetOTP,
  resetPasswordWithOTP
} = require('../controllers/authController');

// Authentication routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/google', googleAuth);

// OTP-based password reset routes
router.post('/forgot-password-otp', forgotPasswordOTP);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password-with-otp', resetPasswordWithOTP);

module.exports = router;
