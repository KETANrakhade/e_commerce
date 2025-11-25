const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Get reviews for a product (public)
router.get('/:productId', getProductReviews);

// Create review (protected)
router.post('/:productId', protect, createReview);

// Update review (protected)
router.put('/:reviewId', protect, updateReview);

// Delete review (protected)
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
