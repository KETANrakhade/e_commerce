const express = require('express');
const router = express.Router();
const {
  registerSuperAdmin,
  registerAdmin,
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
  bulkProductAction
} = require('../controllers/productController');
const {
  createProductWithUpload,
  updateProductWithUpload
} = require('../controllers/productWithUploadController');
const { upload, handleMulterError } = require('../middleware/upload');
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
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  bulkCategoryAction
} = require('../controllers/categoryController');
const {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoryStats,
  bulkSubcategoryAction
} = require('../controllers/subcategoryController');
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandStats,
  bulkBrandAction
} = require('../controllers/brandController');
const { adminProtect } = require('../middleware/adminAuth');

// Public routes
router.post('/register-super-admin', registerSuperAdmin);
router.post('/login', adminLogin);

// Protected admin routes (admin can create other admins)
router.post('/register-admin', adminProtect, registerAdmin);

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

router.post('/products/bulk-action', adminProtect, bulkProductAction);

// Product management with image upload
router.post('/products/with-upload', 
  adminProtect, 
  upload.array('productImages', 10), 
  handleMulterError, 
  createProductWithUpload
);
router.put('/products/:id/with-upload', 
  adminProtect, 
  upload.array('productImages', 10), 
  handleMulterError, 
  updateProductWithUpload
);

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

// Category management routes
router.post('/categories', adminProtect, createCategory);
router.put('/categories/:id', adminProtect, updateCategory);
router.delete('/categories/:id', adminProtect, deleteCategory);
router.get('/categories/stats', adminProtect, getCategoryStats);
router.post('/categories/bulk-action', adminProtect, bulkCategoryAction);

// Subcategory management routes
router.post('/subcategories', adminProtect, createSubcategory);
router.put('/subcategories/:id', adminProtect, updateSubcategory);
router.delete('/subcategories/:id', adminProtect, deleteSubcategory);
router.get('/subcategories/stats', adminProtect, getSubcategoryStats);
router.post('/subcategories/bulk-action', adminProtect, bulkSubcategoryAction);

// Brand management routes
router.post('/brands', adminProtect, createBrand);
router.put('/brands/:id', adminProtect, updateBrand);
router.delete('/brands/:id', adminProtect, deleteBrand);
router.get('/brands/stats', adminProtect, getBrandStats);
router.post('/brands/bulk-action', adminProtect, bulkBrandAction);

module.exports = router;