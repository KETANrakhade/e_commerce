const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

class UserService {
  // Create new user
  async createUser(userData) {
    const { name, email, password, role = 'user' } = userData;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
      role,
      isActive: true
    });

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    };
  }

  // Authenticate user
  async authenticateUser(email, password) {
    const user = await User.findOne({ email, isActive: true });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
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

  // Get user by ID
  async getUserById(userId) {
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
    Object.keys(updateData).forEach(key => {
      if (key !== 'password' && updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    // Handle password update separately
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    }

    await user.save();
    return user.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } });
  }

  // Get all users (admin)
  async getAllUsers(filters = {}) {
    const { page = 1, limit = 10, search, role, status } = filters;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      users,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  // Update user status
  async updateUserStatus(userId, isActive) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = isActive;
    await user.save();
    return user;
  }

  // Add to wishlist
  async addToWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.wishlist.includes(productId)) {
      throw new Error('Product already in wishlist');
    }

    user.wishlist.push(productId);
    await user.save();
    
    return await User.findById(userId).populate('wishlist');
  }

  // Remove from wishlist
  async removeFromWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    
    return await User.findById(userId).populate('wishlist');
  }

  // Get user statistics
  async getUserStats() {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thisMonth }
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      newUsersThisMonth
    };
  }
}

module.exports = new UserService();