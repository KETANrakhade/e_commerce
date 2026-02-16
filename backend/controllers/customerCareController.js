const asyncHandler = require('express-async-handler');
const CustomerCare = require('../models/customerCareModel');
const Order = require('../models/orderModel');

// @desc    Submit return request
// @route   POST /api/customer-care/return
// @access  Private
const submitReturnRequest = asyncHandler(async (req, res) => {
  const { orderId, productName, reason, details } = req.body;
  
  console.log('📥 Return request received:', { orderId, productName, reason, userId: req.user._id });
  
  // Try to verify order exists and belongs to user (optional validation)
  let order = null;
  try {
    order = await Order.findOne({ 
      $or: [
        { orderNumber: orderId },
        { _id: orderId }
      ],
      user: req.user._id 
    });
    
    if (order) {
      console.log('✅ Order found:', order._id);
      
      // Check if order is eligible for return (within 7 days) - just a warning
      const orderDate = new Date(order.createdAt);
      const currentDate = new Date();
      const daysDiff = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));
      
      console.log('📅 Days since order:', daysDiff);
      
      if (daysDiff > 7) {
        console.log('⚠️ Order is outside 7-day return window, but allowing request');
        // Don't throw error, just log warning - allow customer service to decide
      }
    } else {
      console.log('⚠️ Order not found, but allowing return request for manual verification');
    }
  } catch (error) {
    console.log('⚠️ Error finding order:', error.message);
    // Continue anyway - customer service can verify manually
  }
  
  const returnRequest = await CustomerCare.create({
    user: req.user._id,
    type: 'return',
    orderId: orderId,
    productName,
    reason,
    details: details || '',
    status: 'pending'
  });
  
  console.log('✅ Return request created:', returnRequest._id);
  
  res.status(201).json({
    success: true,
    data: returnRequest,
    message: 'Return request submitted successfully'
  });
});

// @desc    Submit exchange request
// @route   POST /api/customer-care/exchange
// @access  Private
const submitExchangeRequest = asyncHandler(async (req, res) => {
  const { orderId, productName, exchangeType, preference, details } = req.body;
  
  console.log('📥 Exchange request received:', { orderId, productName, exchangeType, userId: req.user._id });
  
  // Try to verify order exists and belongs to user (optional validation)
  let order = null;
  try {
    order = await Order.findOne({ 
      $or: [
        { orderNumber: orderId },
        { _id: orderId }
      ],
      user: req.user._id 
    });
    
    if (order) {
      console.log('✅ Order found:', order._id);
      
      // Check if order is eligible for exchange (within 7 days) - just a warning
      const orderDate = new Date(order.createdAt);
      const currentDate = new Date();
      const daysDiff = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));
      
      console.log('📅 Days since order:', daysDiff);
      
      if (daysDiff > 7) {
        console.log('⚠️ Order is outside 7-day exchange window, but allowing request');
      }
    } else {
      console.log('⚠️ Order not found, but allowing exchange request for manual verification');
    }
  } catch (error) {
    console.log('⚠️ Error finding order:', error.message);
  }
  
  const exchangeRequest = await CustomerCare.create({
    user: req.user._id,
    type: 'exchange',
    orderId: orderId,
    productName,
    exchangeType,
    preference: preference || '',
    details: details || '',
    status: 'pending'
  });
  
  console.log('✅ Exchange request created:', exchangeRequest._id);
  
  res.status(201).json({
    success: true,
    data: exchangeRequest,
    message: 'Exchange request submitted successfully'
  });
});

// @desc    Submit support request
// @route   POST /api/customer-care/support
// @access  Public
const submitSupportRequest = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  
  const supportRequest = await CustomerCare.create({
    user: req.user?._id || null,
    type: 'support',
    name,
    email,
    phone,
    subject,
    message,
    status: 'open'
  });
  
  res.status(201).json({
    success: true,
    data: supportRequest,
    message: 'Support request submitted successfully'
  });
});

// @desc    Get user's customer care requests
// @route   GET /api/customer-care/my-requests
// @access  Private
const getMyRequests = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  
  const filter = { user: req.user._id };
  
  if (type) filter.type = type;
  if (status) filter.status = status;
  
  const requests = await CustomerCare.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  
  res.json({
    success: true,
    data: requests
  });
});

// @desc    Get all customer care requests (Admin)
// @route   GET /api/customer-care/admin/requests
// @access  Private/Admin
const getAllRequests = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;
  
  const filter = {};
  
  if (type) filter.type = type;
  if (status) filter.status = status;
  
  const skip = (page - 1) * limit;
  
  const requests = await CustomerCare.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  const total = await CustomerCare.countDocuments(filter);
  
  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Update request status (Admin)
// @route   PUT /api/customer-care/admin/requests/:id
// @access  Private/Admin
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  
  const request = await CustomerCare.findById(req.params.id);
  
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }
  
  request.status = status || request.status;
  request.adminNotes = adminNotes || request.adminNotes;
  
  if (status === 'completed' || status === 'closed') {
    request.resolvedDate = Date.now();
  }
  
  await request.save();
  
  res.json({
    success: true,
    data: request,
    message: 'Request updated successfully'
  });
});

module.exports = {
  submitReturnRequest,
  submitExchangeRequest,
  submitSupportRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus
};
