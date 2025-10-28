const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  getRecentOrders,
  getSalesAnalytics
} = require('../controllers/adminController');
const {
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkProductAction
} = require('../controllers/productController');
const {
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrders
} = require('../controllers/orderController');
const {
  getAdminUsers,
  getUserById,
  updateUserStatus,
  getUserOrders,
  getUserStats
} = require('../controllers/userController');
const { adminProtect } = require('../middleware/adminAuth');

// Public routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/profile', adminProtect, getAdminProfile);
router.get('/stats', adminProtect, getDashboardStats);
router.get('/recent-orders', adminProtect, getRecentOrders);
router.get('/sales-analytics', adminProtect, getSalesAnalytics);

// Product management routes
router.get('/products', adminProtect, getAdminProducts);
router.get('/products/:id', adminProtect, getProductById);
router.post('/products', adminProtect, createProduct);
router.put('/products/:id', adminProtect, updateProduct);
router.delete('/products/:id', adminProtect, deleteProduct);
router.post('/products/bulk-action', adminProtect, bulkProductAction);

// Order management routes
router.get('/orders', adminProtect, getAdminOrders);
router.get('/orders/stats', adminProtect, getOrderStats);
router.get('/orders/export', adminProtect, exportOrders);
router.get('/orders/:id', adminProtect, getOrderById);
router.put('/orders/:id/status', adminProtect, updateOrderStatus);

// User management routes
router.get('/users', adminProtect, getAdminUsers);
router.get('/users/stats', adminProtect, getUserStats);
router.get('/users/:id', adminProtect, getUserById);
router.get('/users/:id/orders', adminProtect, getUserOrders);
router.put('/users/:id/status', adminProtect, updateUserStatus);

module.exports = router;