const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService');

class AuthService {
  // User signup with OTP
  async signup(userData) {
    const { name, email, password } = userData;

    // Validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!name) {
      throw new Error('Name is required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but not verified, allow resending OTP
      if (!existingUser.isVerified) {
        // Generate new OTP
        const otp = existingUser.generateOTP();
        await existingUser.save();

        // Send OTP email
        try {
          await emailService.sendOTPEmail(existingUser, otp);
        } catch (emailError) {
          console.error('Failed to send OTP email:', emailError);
          throw new Error('Failed to send verification email. Please try again.');
        }

        return {
          status: true,
          message: 'User already exists but not verified. New OTP sent to your email.',
          data: {
            id: existingUser._id,
            email: existingUser.email,
            isVerified: false
          }
        };
      }
      throw new Error('User already exists and is verified. Please login.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with isVerified=false
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false
    });

    // Generate 6-digit OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await emailService.sendOTPEmail(user, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Delete user if email fails
      await User.findByIdAndDelete(user._id);
      throw new Error('Failed to send verification email. Please try again.');
    }

    return {
      status: true,
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: false
      }
    };
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    // Validation
    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      throw new Error('Email already verified. Please login.');
    }

    // Verify OTP
    const isValid = user.verifyOTP(otp);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't throw error, verification is successful
    }

    return {
      status: true,
      message: 'Email verified successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
        token
      }
    };
  }

  // Resend OTP
  async resendOTP(email) {
    // Validation
    if (!email) {
      throw new Error('Email is required');
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      throw new Error('Email already verified. Please login.');
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await emailService.sendOTPEmail(user, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      throw new Error('Failed to send verification email. Please try again.');
    }

    return {
      status: true,
      message: 'OTP sent successfully to your email'
    };
  }

  // User login (updated to check email verification)
  async login(credentials) {
    const { email, password } = credentials;

    // Validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new Error('Please verify your email before logging in. Check your inbox for the OTP.');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      status: true,
      message: 'User login successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token
      }
    };
  }

  // Verify token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();
