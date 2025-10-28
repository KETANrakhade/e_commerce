const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWishlist);
router.post('/add', protect, addToWishlist);
router.delete('/remove/:productId', protect, removeFromWishlist);
router.delete('/clear', protect, clearWishlist);

module.exports = router;