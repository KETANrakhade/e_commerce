const express = require('express');
const router = express.Router();
const {
  uploadSingleImage,
  uploadMultipleImagesController,
  deleteImageController,
  uploadProductImages
} = require('../controllers/uploadController');
const { upload, handleMulterError } = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminAuth');

// Single image upload
router.post('/single', 
  protect, 
  upload.single('image'), 
  handleMulterError, 
  uploadSingleImage
);

// Multiple images upload
router.post('/multiple', 
  protect, 
  upload.array('images', 10), 
  handleMulterError, 
  uploadMultipleImagesController
);

// Product images upload (for admin)
router.post('/product', 
  adminProtect, 
  upload.array('productImages', 10), 
  handleMulterError, 
  uploadProductImages
);

// Delete image
router.delete('/:publicId', 
  protect, 
  deleteImageController
);

module.exports = router;
