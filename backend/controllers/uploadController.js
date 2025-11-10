const asyncHandler = require('express-async-handler');
const { uploadImage: cloudinaryUpload, uploadMultipleImages, deleteImage } = require('../config/cloudinary');

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private
const uploadSingleImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    // Upload to Cloudinary
    const result = await cloudinaryUpload(req.file.buffer, {
      folder: 'pyramid-ecommerce/products',
      public_id: `product_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500);
    throw new Error(`Upload failed: ${error.message}`);
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
const uploadMultipleImagesController = asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('No files uploaded');
    }

    // Upload all files to Cloudinary
    const fileBuffers = req.files.map(file => file.buffer);
    const results = await uploadMultipleImages(fileBuffers, {
      folder: 'pyramid-ecommerce/products',
      public_id: `product_${Date.now()}`,
    });

    const uploadedImages = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    }));

    res.status(200).json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500);
    throw new Error(`Upload failed: ${error.message}`);
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
const deleteImageController = asyncHandler(async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      res.status(400);
      throw new Error('Public ID is required');
    }

    // Delete from Cloudinary
    const result = await deleteImage(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        data: result
      });
    } else {
      res.status(404);
      throw new Error('Image not found or already deleted');
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500);
    throw new Error(`Delete failed: ${error.message}`);
  }
});

// @desc    Upload product images (for admin product creation)
// @route   POST /api/upload/product
// @access  Private/Admin
const uploadProductImages = asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('No product images uploaded');
    }

    const { productName } = req.body;
    const sanitizedProductName = productName 
      ? productName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      : 'product';

    // Upload all files to Cloudinary with product-specific naming
    const fileBuffers = req.files.map(file => file.buffer);
    const results = await uploadMultipleImages(fileBuffers, {
      folder: 'pyramid-ecommerce/products',
      public_id: `${sanitizedProductName}_${Date.now()}`,
    });

    const productImages = results.map((result, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      alt: `${productName || 'Product'} - Image ${index + 1}`,
      isPrimary: index === 0, // First image is primary
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    }));

    res.status(200).json({
      success: true,
      message: `${results.length} product images uploaded successfully`,
      data: {
        images: productImages,
        primaryImage: productImages[0]
      }
    });
  } catch (error) {
    console.error('Product upload error:', error);
    res.status(500);
    throw new Error(`Product image upload failed: ${error.message}`);
  }
});

module.exports = {
  uploadSingleImage,
  uploadMultipleImagesController,
  deleteImageController,
  uploadProductImages
};
