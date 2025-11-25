const router = require('express').Router();
const { 
  signup, 
  login, 
  verifyOTP, 
  resendOTP, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');

// Authentication routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
