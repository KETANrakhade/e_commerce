const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, password: hashed });
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    }
  });
});

// @desc    Auth user
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, isActive: true });
  if (user && (await bcrypt.compare(password, user.password))) {
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const status = req.query.status || '';
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Build query
  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    query.role = role;
  }

  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const count = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  // Get user roles for filter
  const roles = await User.distinct('role');

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
        limit: pageSize
      },
      roles
    }
  });
});

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    // Get user's order count and total spent
    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          paidOrders: {
            $sum: { $cond: [{ $eq: ['$isPaid', true] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = orderStats.length > 0 ? orderStats[0] : {
      totalOrders: 0,
      totalSpent: 0,
      paidOrders: 0
    };

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        orderStats: stats
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findById(req.params.id);

  if (user) {
    user.isActive = Boolean(isActive);
    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user's orders
// @route   GET /api/admin/users/:id/orders
// @access  Private/Admin
const getUserOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const count = await Order.countDocuments({ user: req.params.id });
  const orders = await Order.find({ user: req.params.id })
    .populate('orderItems.productId', 'name images')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
        limit: pageSize
      },
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    }
  });
});

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
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

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      newUsersThisMonth,
      usersWithOrders: usersWithOrders.length
    }
  });
});



module.exports = {
  registerUser,
  authUser,
  getProfile,
  getAdminUsers,
  getUserById,
  updateUserStatus,
  getUserOrders,
  getUserStats
};




