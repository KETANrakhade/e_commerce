const express = require('express');
const router = express.Router();
const {
  getSubcategories,
  getSubcategoryById,
  getSubcategoryBySlug,
  getSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} = require('../controllers/subcategoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getSubcategories);
router.get('/slug/:slug', getSubcategoryBySlug);
router.get('/category/:categoryId', getSubcategoriesByCategory);
router.get('/:id', getSubcategoryById);

// Admin routes
router.post('/', protect, admin, createSubcategory);
router.put('/:id', protect, admin, updateSubcategory);
router.delete('/:id', protect, admin, deleteSubcategory);

module.exports = router;