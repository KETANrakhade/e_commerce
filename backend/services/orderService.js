const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const emailService = require('./emailService');

class OrderService {
  // Create new order
  async createOrder(userId, orderData) {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    } = orderData;

    // Validation
    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items provided');
    }

    if (!shippingAddress) {
      throw new Error('Shipping address is required');
    }

    // Verify products exist and have sufficient stock
    for (const item of orderItems) {
      const product = await Product.findById(item.productId || item.id);
      
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${item.name} is not available`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}`);
      }
    }

    // Create order
    const order = new Order({
      user: userId,
      orderItems: orderItems.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    const createdOrder = await order.save();

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId || item.id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Send confirmation emails
    try {
      const user = await User.findById(userId);
      await emailService.sendOrderConfirmation(user, createdOrder);
      await emailService.sendNewOrderNotification(createdOrder, user);
    } catch (error) {
      console.error('Failed to send order confirmation emails:', error);
    }

    return createdOrder;
  }

  // Get order by ID
  async getOrderById(orderId, userId = null, isAdmin = false) {
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone address')
      .populate('orderItems.productId', 'name images');

    if (!order) {
      throw new Error('Order not found');
    }

    // Check authorization
    if (!isAdmin && userId && order.user._id.toString() !== userId.toString()) {
      throw new Error('Not authorized to view this order');
    }

    return order;
  }

  // Get user orders
  async getUserOrders(userId, filters = {}) {
    const { page = 1, limit = 10, status = '' } = filters;

    const query = { user: userId };

    if (status) {
      query.status = status;
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
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
      }
    };
  }

  // Get all orders (admin)
  async getAllOrders(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      startDate = null,
      endDate = null,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      excludeCompleted = false
    } = filters;

    const query = {};

    // Exclude delivered and cancelled orders if requested (for pending orders view)
    if (excludeCompleted) {
      query.status = { $nin: ['delivered', 'cancelled'] };
    }

    // Search by order number or customer
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

    // Filter by specific status (overrides excludeCompleted)
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.productId', 'name')
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    return {
      orders,
      pagination: {
        page,
        pages: Math.ceil(count / limit),
        total: count,
        limit
      }
    };
  }

  // Update order status
  async updateOrderStatus(orderId, newStatus) {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status');
    }

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;
    order.status = newStatus;

    // Update delivery status if delivered
    if (newStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    // If cancelled, restore product stock
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await order.save();

    // Send status update email
    try {
      await emailService.sendOrderStatusUpdate(order.user, order, newStatus);
    } catch (error) {
      console.error('Failed to send order status update email:', error);
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

    // Auto-update status to confirmed if still pending
    if (order.status === 'pending') {
      order.status = 'confirmed';
    }

    await order.save();
    return order;
  }

  // Cancel order
  async cancelOrder(orderId, userId = null, isAdmin = false) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check authorization
    if (!isAdmin && userId && order.user.toString() !== userId.toString()) {
      throw new Error('Not authorized to cancel this order');
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    await order.save();

    return order;
  }

  // Get order statistics
  async getOrderStats(filters = {}) {
    const { startDate = null, endDate = null } = filters;

    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Total orders
    const totalOrders = await Order.countDocuments(dateQuery);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    ordersByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    // Revenue statistics
    const revenueStats = await Order.aggregate([
      { $match: { ...dateQuery, isPaid: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueStats.length > 0 ? revenueStats[0] : {
      totalRevenue: 0,
      averageOrderValue: 0,
      totalOrders: 0
    };

    // Monthly revenue (last 12 months)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: dateQuery },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.productId',
          totalQuantity: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    return {
      totalOrders,
      ordersByStatus: statusCounts,
      revenue,
      monthlyRevenue,
      topProducts
    };
  }

  // Export orders
  async exportOrders(filters = {}) {
    const { status = '', startDate = null, endDate = null } = filters;

    const query = {};

    if (status) {
      query.status = status;
    }

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
}

module.exports = new OrderService();
