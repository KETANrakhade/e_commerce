const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const result = await userService.registerUser(req.body);
  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Auth user
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const result = await userService.loginUser(req.body.email, req.body.password);
  res.json({
    success: true,
    data: result
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user._id);
  res.json({ success: true, data: user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUserProfile(req.user._id, req.body);
  res.json({
    success: true,
    data: updatedUser
  });
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = asyncHandler(async (req, res) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: req.query.search || '',
    role: req.query.role || '',
    status: req.query.status || '',
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };

  const result = await userService.getAllUsers(filters);
  
  const User = require('../models/userModel');
  const roles = await User.distinct('role');

  res.json({
    success: true,
    data: {
      users: result.users,
      pagination: result.pagination,
      roles
    }
  });
});

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const updatedUser = await userService.updateUserStatus(req.params.id, isActive);

  res.json({
    success: true,
    data: updatedUser,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// @desc    Get user's orders
// @route   GET /api/admin/users/:id/orders
// @access  Private/Admin
const getUserOrders = asyncHandler(async (req, res) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  };

  const result = await userService.getUserOrders(req.params.id, filters);

  res.json({
    success: true,
    data: result
  });
});

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();
  
  res.json({
    success: true,
    data: stats
  });
});



module.exports = {
  registerUser,
  authUser,
  getProfile,
  updateProfile,
  getAdminUsers,
  getUserById,
  updateUserStatus,
  getUserOrders,
  getUserStats
};




