const authService = require('../services/authService');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');

// Helper function for strong password validation
const validateStrongPassword = (password) => {
  if (!password) {
    throw new Error('Password is required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    throw new Error('Password must contain at least one special character');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    throw new Error('Password must contain at least one letter');
  }
  
  return true;
};

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
    await emailService.sendPasswordResetEmail(user, resetToken);

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

  try {
    validateStrongPassword(password);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
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

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error('Google token is required');
  }

  try {
    // Initialize Google OAuth client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      res.status(400);
      throw new Error('Email not provided by Google');
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
        isEmailVerified: true, // Google emails are pre-verified
        password: crypto.randomBytes(32).toString('hex'), // Random password for Google users
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: jwtToken,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400);
    throw new Error('Invalid Google token');
  }
});

// @desc    Forgot password with OTP
// @route   POST /api/auth/forgot-password-otp
// @access  Public
const forgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(404);
    throw new Error('User not found with this email address');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiration (10 minutes)
  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  try {
    // Send OTP email
    await emailService.sendPasswordResetOTP(user, otp);

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });
  } catch (error) {
    console.error('Email send error:', error);
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Verify reset password OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordOTP: otp,
    resetPasswordOTPExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // Mark OTP as verified but don't clear it yet (needed for password reset)
  user.resetPasswordOTPVerified = true;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'OTP verified successfully'
  });
});

// @desc    Reset password with verified OTP
// @route   POST /api/auth/reset-password-with-otp
// @access  Public
const resetPasswordWithOTP = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  try {
    validateStrongPassword(password);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordOTPVerified: true,
    resetPasswordOTPExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('OTP not verified or expired. Please start the process again.');
  }

  // Set new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  
  // Clear all reset fields
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpire = undefined;
  user.resetPasswordOTPVerified = undefined;
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
  resetPassword,
  googleAuth,
  forgotPasswordOTP,
  verifyResetOTP,
  resetPasswordWithOTP
};
