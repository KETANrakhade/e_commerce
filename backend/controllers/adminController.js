const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register super admin (first time setup)
// @route   POST /api/admin/register-super-admin
// @access  Public (but protected by logic)
const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  // Check if any admin exists
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    res.status(400);
    throw new Error('Super admin already exists. Use regular admin registration.');
  }

  // Verify secret key (you can change this)
  if (secretKey !== 'PYRAMID_SUPER_ADMIN_2024') {
    res.status(401);
    throw new Error('Invalid secret key for super admin registration');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create super admin
  const superAdmin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    isActive: true
  });

  res.status(201).json({
    success: true,
    message: 'Super admin created successfully',
    data: {
      _id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
      token: generateToken(superAdmin._id)
    }
  });
});

// @desc    Register new admin (by existing admin)
// @route   POST /api/admin/register-admin
// @access  Private/Admin
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new admin
  const newAdmin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    isActive: true
  });

  res.status(201).json({
    success: true,
    message: 'New admin created successfully',
    data: {
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role
    }
  });
});

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = asyncHandler(async (req, res) => {
  console.log('🔍 Admin login attempt:', req.body);
  
  const { email, password } = req.body;

  // Find user and check if admin
  const user = await User.findOne({ email, role: 'admin', isActive: true });
  
  console.log('👤 User found:', user ? 'Yes' : 'No');
  if (user) {
    console.log('   - Email:', user.email);
    console.log('   - Role:', user.role);
    console.log('   - Active:', user.isActive);
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    console.log('✅ Password match - Login successful');
    
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
    console.log('❌ Login failed - Invalid credentials or not admin');
    res.status(401);
    throw new Error('Invalid email or password, or insufficient permissions');
  }
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getAdminProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user && user.role === 'admin') {
    res.json({
      success: true,
      data: user
    });
  } else {
    res.status(404);
    throw new Error('Admin not found');
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments({ role: 'user' });
  
  // Calculate total revenue
  const revenueResult = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Get recent orders count by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get monthly sales data for chart
  const monthlySales = await Order.aggregate([
    { 
      $match: { 
        isPaid: true,
        createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      ordersByStatus,
      monthlySales
    }
  });
});

// @desc    Get recent orders
// @route   GET /api/admin/recent-orders
// @access  Private/Admin
const getRecentOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: orders
  });
});

// @desc    Get sales analytics
// @route   GET /api/admin/sales-analytics
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const salesData = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Get top selling products
  const topProducts = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.productId',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  res.json({
    success: true,
    data: {
      salesData,
      topProducts
    }
  });
});

module.exports = {
  registerSuperAdmin,
  registerAdmin,
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  getRecentOrders,
  getSalesAnalytics
};