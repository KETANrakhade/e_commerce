const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const search = req.query.search || '';
  const status = req.query.status || '';
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Build query
  let query = {};
  
  if (search) {
    // Search by order number or customer email/name
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
  
  if (status) {
    query.status = status;
  }
  
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
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  // Get order statuses for filter
  const statuses = await Order.distinct('status');

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
      statuses
    }
  });
});

// @desc    Get single order details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone address')
    .populate('orderItems.productId', 'name images');

  if (order) {
    res.json({ success: true, data: order });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    
    // Update delivery status if delivered
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    
    res.json({ 
      success: true, 
      data: updatedOrder,
      message: `Order status updated to ${status}` 
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
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

  res.json({
    success: true,
    data: {
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
      }
    }
  });
});

// @desc    Export orders
// @route   GET /api/admin/orders/export
// @access  Private/Admin
const exportOrders = asyncHandler(async (req, res) => {
  const { format = 'json', startDate, endDate, status } = req.query;

  let query = {};
  
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

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = orders.map(order => ({
      'Order Number': order.orderNumber,
      'Customer Name': order.user.name,
      'Customer Email': order.user.email,
      'Status': order.status,
      'Total Price': order.totalPrice,
      'Payment Status': order.isPaid ? 'Paid' : 'Unpaid',
      'Created Date': order.createdAt.toISOString().split('T')[0],
      'Items Count': order.orderItems.length
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    
    // Simple CSV conversion (in production, use a proper CSV library)
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    res.send(csvContent);
  } else {
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const order = new Order({
    orderItems: orderItems.map(item => ({
      ...item,
      productId: item.id || item.productId
    })),
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  });

  const createdOrder = await order.save();
  res.status(201).json({ success: true, data: createdOrder });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('orderItems.productId', 'name images')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: orders });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address
    };

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  createOrder,
  getMyOrders,
  updateOrderToPaid,
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrders
};