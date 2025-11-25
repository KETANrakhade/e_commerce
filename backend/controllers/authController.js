const authService = require('../services/authService');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

// @desc    User signup with OTP
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ 
      status: false,
      msg: err.message || 'Server error' 
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP(email, otp);
    return res.status(200).json(result);
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(400).json({ 
      status: false,
      msg: err.message || 'Server error' 
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.resendOTP(email);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(400).json({ 
      status: false,
      msg: err.message || 'Server error' 
    });
  }
};

// @desc    User login (updated with email verification check)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ 
      status: false,
      msg: err.message || 'Server error' 
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;

  try {
    await emailService.sendPasswordResetEmail(user.email, resetUrl);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Email send error:', error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Hash token to compare with stored hash
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  // Set new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

module.exports = { 
  signup, 
  login, 
  verifyOTP, 
  resendOTP, 
  forgotPassword, 
  resetPassword 
};
