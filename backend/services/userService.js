const User = require('../models/userModel');
const Order = require('../models/orderModel');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const emailService = require('./emailService');

class UserService {
  // Register new user
  async registerUser(userData) {
    const { name, email, password, phone, address } = userData;

    // Validation
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    };
  }

  // Login user
  async loginUser(email, password) {
    // Validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    };
  }

  // Get user profile
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.email) {
      // Check if email is already taken
      const emailExists = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: userId } 
      });
      if (emailExists) {
        throw new Error('Email already in use');
      }
      user.email = updateData.email;
    }
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.address) user.address = updateData.address;

    // Update password if provided
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await user.save();

    return {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role
    };
  }

  // Get all users (admin)
  async getAllUsers(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      startDate = null,
      endDate = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    return {
      users,
      pagination: {
        page,
        pages: Math.ceil(count / limit),
        total: count,
        limit
      }
    };
  }

  // Get user by ID (admin)
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's order statistics
    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          paidOrders: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, 1, 0] } }
        }
      }
    ]);

    const stats = orderStats.length > 0 ? orderStats[0] : {
      totalOrders: 0,
      totalSpent: 0,
      paidOrders: 0
    };

    return {
      ...user.toObject(),
      orderStats: stats
    };
  }

  // Update user status (admin)
  async updateUserStatus(userId, isActive) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = Boolean(isActive);
    await user.save();

    return user;
  }

  // Update user role (admin)
  async updateUserRole(userId, newRole) {
    const validRoles = ['user', 'admin'];

    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.role = newRole;
    await user.save();

    return user;
  }

  // Delete user (admin)
  async deleteUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has orders
    const hasOrders = await Order.exists({ user: userId });

    if (hasOrders) {
      // Soft delete - deactivate instead of deleting
      user.isActive = false;
      await user.save();
      return { message: 'User deactivated (has order history)' };
    } else {
      // Hard delete if no orders
      await User.findByIdAndDelete(userId);
      return { message: 'User deleted successfully' };
    }
  }

  // Get user's orders
  async getUserOrders(userId, filters = {}) {
    const { page = 1, limit = 10 } = filters;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const count = await Order.countDocuments({ user: userId });
    const orders = await Order.find({ user: userId })
      .populate('orderItems.productId', 'name images')
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });

    return {
      orders,
      pagination: {
        page,
        pages: Math.ceil(count / limit),
        total: count,
        limit
      },
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    };
  }

  // Get user statistics (admin)
  async getUserStats() {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const inactiveUsers = await User.countDocuments({ role: 'user', isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // New users this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thisMonth }
    });

    // Users with orders
    const usersWithOrders = await Order.distinct('user');

    // User growth (last 12 months)
    const userGrowth = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      newUsersThisMonth,
      usersWithOrders: usersWithOrders.length,
      userGrowth
    };
  }

  // Request password reset
  async requestPasswordReset(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found with this email');
    }

    // Generate reset token (in production, use crypto for secure tokens)
    const resetToken = generateToken(user._id);

    // In production, save token and expiry to database
    // user.resetPasswordToken = resetToken;
    // user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    // await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    return { message: 'Password reset email sent' };
  }

  // Reset password
  async resetPassword(resetToken, newPassword) {
    // In production, verify token from database
    // For now, we'll decode the token to get user ID
    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      // Clear reset token fields (if implemented)
      // user.resetPasswordToken = undefined;
      // user.resetPasswordExpire = undefined;

      await user.save();

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }
}

module.exports = new UserService();
