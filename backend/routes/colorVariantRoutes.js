const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getProductColorVariants,
  addColorVariant,
  updateColorVariant,
  deleteColorVariant,
  uploadColorVariantImages,
  deleteColorVariantImage,
  setPrimaryImage,
  setDefaultColorVariant,
  reorderColorVariants
} = require('../controllers/colorVariantController');
const { protect, admin } = require('../middleware/authMiddleware');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp/'); // Temporary storage before Cloudinary upload
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require authentication and admin privileges
router.use(protect);
router.use(admin);

// Color variant management routes
router.route('/:productId/color-variants')
  .get(getProductColorVariants)
  .post(addColorVariant);

router.route('/:productId/color-variants/reorder')
  .put(reorderColorVariants);

router.route('/:productId/color-variants/:variantId')
  .put(updateColorVariant)
  .delete(deleteColorVariant);

router.route('/:productId/color-variants/:variantId/images')
  .post(upload.array('images', 5), uploadColorVariantImages);

router.route('/:productId/color-variants/:variantId/images/:imageIndex')
  .delete(deleteColorVariantImage);

router.route('/:productId/color-variants/:variantId/images/:imageIndex/primary')
  .put(setPrimaryImage);

router.route('/:productId/color-variants/:variantId/set-default')
  .put(setDefaultColorVariant);

module.exports = router;