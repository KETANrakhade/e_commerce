const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const productService = require('./productService');

class OrderService {
  // Create new order
  async createOrder(orderData, userId) {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice = 0,  
      taxPrice = 0,
      totalPrice
    } = orderData;

    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items provided');
    }

    // Validate and update stock for each item
    for (const item of orderItems) {
      await productService.updateStock(item.productId || item.id, item.quantity, 'decrease');
    }

    const order = new Order({
      orderItems: orderItems.map(item => ({
        ...item,
        productId: item.id || item.productId
      })),
      user: userId,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    return await order.save();
  }

  // Get user's orders
  async getUserOrders(userId, filters = {}) {
    const { page = 1, limit = 10 } = filters;
    
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments({ user: userId });
    
    const orders = await Order.find({ user: userId })
      .populate('orderItems.productId', 'name images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return {
      orders,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  // Get single order by ID
  async getOrderById(orderId, userId = null) {
    let query = { _id: orderId };
    if (userId) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email phone address')
      .populate('orderItems.productId', 'name images');

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  // Update order to paid
  async updateOrderToPaid(orderId, paymentResult) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = paymentResult;
    order.status = 'confirmed';

    return await order.save();
  }

  // Get all orders for admin
  async getAdminOrders(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      startDate, 
      endDate 
    } = filters;

    let query = {};
    
    // Search by order number or customer info
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } }
      ];
    }
    
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.productId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get order statuses for filter
    const statuses = await Order.distinct('status');

    return {
      orders,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      statuses
    };
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    
    // Update delivery status if delivered
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    // If cancelled, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.orderItems) {
        await productService.updateStock(item.productId, item.quantity, 'increase');
      }
    }

    return await order.save();
  }

  // Get order statistics
  async getOrderStats() {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue statistics
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Daily sales for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: thirtyDaysAgo }
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

    return {
      totalOrders,
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      revenue: {
        total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthly: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0
      },
      dailySales
    };
  }

  // Export orders
  async exportOrders(filters = {}) {
    const { status, startDate, endDate } = filters;

    let query = {};
    
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.productId', 'name')
      .sort({ createdAt: -1 });

    return orders;
  }

  // Get recent orders
  async getRecentOrders(limit = 10) {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    return orders;
  }

  // Get sales analytics
  async getSalesAnalytics(period = 30) {
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

    return {
      salesData,
      topProducts
    };
  }
}

module.exports = new OrderService();