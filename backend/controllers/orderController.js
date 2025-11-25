const asyncHandler = require('express-async-handler');
const orderService = require('../services/orderService');

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = asyncHandler(async (req, res) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: req.query.search || '',
    status: req.query.status || '',
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    excludeCompleted: req.query.excludeCompleted === 'true' // Filter for pending orders only
  };

  const result = await orderService.getAllOrders(filters);
  
  const Order = require('../models/orderModel');
  const statuses = await Order.distinct('status');

  res.json({
    success: true,
    data: {
      orders: result.orders,
      pagination: result.pagination,
      statuses
    }
  });
});

// @desc    Get single order details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, null, true);
  res.json({ success: true, data: order });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updatedOrder = await orderService.updateOrderStatus(req.params.id, status);
  
  res.json({ 
    success: true, 
    data: updatedOrder,
    message: `Order status updated to ${status}` 
  });
});

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };
  
  const stats = await orderService.getOrderStats(filters);
  
  res.json({
    success: true,
    data: stats
  });
});

// @desc    Export orders
// @route   GET /api/admin/orders/export
// @access  Private/Admin
const exportOrders = asyncHandler(async (req, res) => {
  const { format = 'json', startDate, endDate, status } = req.query;

  const filters = { status, startDate, endDate };
  const orders = await orderService.exportOrders(filters);

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
  const createdOrder = await orderService.createOrder(req.user._id, req.body);
  res.status(201).json({ success: true, data: createdOrder });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    status: req.query.status || ''
  };
  
  const result = await orderService.getUserOrders(req.user._id, filters);
  res.json({ success: true, data: result.orders });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer?.email_address
  };
  
  const updatedOrder = await orderService.updateOrderToPaid(req.params.id, paymentResult);
  res.json({ success: true, data: updatedOrder });
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