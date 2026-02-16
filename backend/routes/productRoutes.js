const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getProductsByCategory, getFeaturedProducts, createProduct, updateProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);
router.post('/', protect, (req, res, next) => {
  console.log('🚨 REGULAR PRODUCTS ROUTE HIT - /api/products');
  console.log('🚨 This should NOT be called for admin requests');
  const fs = require('fs');
  fs.appendFileSync('/tmp/product-routes-debug.log', `[${new Date().toISOString()}] Regular products route hit\n`);
  createProduct(req, res, next);
});
router.put('/:id', protect, updateProduct);


module.exports = router;
