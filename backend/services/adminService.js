const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

class AdminService {
  // Register super admin (first time setup)
  async registerSuperAdmin(adminData) {
    const { name, email, password, secretKey } = adminData;

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw new Error('Super admin already exists. Use regular admin registration.');
    }

    // Verify secret key
    if (secretKey !== 'PYRAMID_SUPER_ADMIN_2024') {
      throw new Error('Invalid secret key for super admin registration');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
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

    return {
      _id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
      token: generateToken(superAdmin._id)
    };
  }

  // Register new admin (by existing admin)
  async registerAdmin(adminData) {
    const { name, email, password } = adminData;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
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

    return {
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role
    };
  }

  // Admin login
  async adminLogin(email, password) {
    // Find user and check if admin
    const user = await User.findOne({ email, role: 'admin', isActive: true });
    
    if (!user) {
      throw new Error('Invalid email or password, or insufficient permissions');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password, or insufficient permissions');
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

  // Get admin profile
  async getAdminProfile(adminId) {
    const admin = await User.findById(adminId).select('-password');
    
    if (!admin || admin.role !== 'admin') {
      throw new Error('Admin not found');
    }

    return admin;
  }

  // Get dashboard statistics
  async getDashboardStats() {
    const Order = require('../models/orderModel');
    const Product = require('../models/productModel');

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

    // Get low stock products
    const lowStockProducts = await Product.countDocuments({ 
      stock: { $lte: 10, $gt: 0 }, 
      isActive: true 
    });

    // Get out of stock products
    const outOfStockProducts = await Product.countDocuments({ 
      stock: 0, 
      isActive: true 
    });

    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Get this month's stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthOrders = await Order.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    const thisMonthRevenue = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: thisMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const thisMonthUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thisMonth }
    });

    return {
      overview: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue
      },
      alerts: {
        lowStockProducts,
        outOfStockProducts,
        pendingOrders
      },
      thisMonth: {
        orders: thisMonthOrders,
        revenue: thisMonthRevenue.length > 0 ? thisMonthRevenue[0].total : 0,
        newUsers: thisMonthUsers
      },
      ordersByStatus,
      monthlySales
    };
  }

  // Get recent orders
  async getRecentOrders(limit = 10) {
    const Order = require('../models/orderModel');
    
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    return orders;
  }

  // Get sales analytics
  async getSalesAnalytics(period = 30) {
    const Order = require('../models/orderModel');
    
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

    // Get category performance
    const categoryPerformance = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    return {
      salesData,
      topProducts,
      categoryPerformance
    };
  }

  // Get all admins
  async getAllAdmins() {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    return admins;
  }

  // Update admin status
  async updateAdminStatus(adminId, isActive) {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Admin not found');
    }

    admin.isActive = isActive;
    await admin.save();

    return admin;
  }

  // Delete admin (soft delete by deactivating)
  async deleteAdmin(adminId, currentAdminId) {
    if (adminId === currentAdminId) {
      throw new Error('Cannot delete your own admin account');
    }

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Admin not found');
    }

    admin.isActive = false;
    await admin.save();

    return { message: 'Admin account deactivated successfully' };
  }
}

module.exports = new AdminService();