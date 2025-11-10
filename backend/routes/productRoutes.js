const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getProductsByCategory, getFeaturedProducts, createProduct, updateProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);


module.exports = router;
