const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');

// @desc    Get all color variants for a product
// @route   GET /api/products/:productId/color-variants
// @access  Private/Admin
const getProductColorVariants = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  res.json({
    success: true,
    data: {
      productId: product._id,
      productName: product.name,
      hasColorVariants: product.hasColorVariants,
      defaultColorVariant: product.defaultColorVariant,
      colorVariants: product.colorVariants || []
    }
  });
});

// @desc    Add a new color variant to a product
// @route   POST /api/products/:productId/color-variants
// @access  Private/Admin
const addColorVariant = asyncHandler(async (req, res) => {
  const { colorName, colorCode, sku, stock, priceModifier, isActive, sortOrder } = req.body;
  
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if SKU already exists
  const existingSku = await Product.findOne({
    $or: [
      { sku: sku },
      { 'colorVariants.sku': sku }
    ]
  });
  
  if (existingSku) {
    res.status(400);
    throw new Error('SKU already exists');
  }
  
  // Create new color variant
  const newColorVariant = {
    colorName: colorName || 'New Color',
    colorCode: colorCode || '',
    sku: sku || `${product.sku || product._id}-${Date.now()}`,
    images: [],
    stock: stock || 0,
    priceModifier: priceModifier || 0,
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: sortOrder || product.colorVariants.length
  };
  
  const addedVariant = product.addColorVariant(newColorVariant);
  await product.save();
  
  res.status(201).json({
    success: true,
    message: 'Color variant added successfully',
    data: addedVariant
  });
});

// @desc    Update a color variant
// @route   PUT /api/products/:productId/color-variants/:variantId
// @access  Private/Admin
const updateColorVariant = asyncHandler(async (req, res) => {
  const { colorName, colorCode, sku, stock, priceModifier, isActive, sortOrder } = req.body;
  
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const variant = product.getColorVariant(req.params.variantId);
  
  if (!variant) {
    res.status(404);
    throw new Error('Color variant not found');
  }
  
  // Check if new SKU already exists (excluding current variant)
  if (sku && sku !== variant.sku) {
    const existingSku = await Product.findOne({
      $or: [
        { sku: sku },
        { 'colorVariants.sku': sku }
      ],
      $and: [
        { _id: { $ne: product._id } },
        { 'colorVariants._id': { $ne: req.params.variantId } }
      ]
    });
    
    if (existingSku) {
      res.status(400);
      throw new Error('SKU already exists');
    }
  }
  
  // Update variant data
  const updateData = {};
  if (colorName !== undefined) updateData.colorName = colorName;
  if (colorCode !== undefined) updateData.colorCode = colorCode;
  if (sku !== undefined) updateData.sku = sku;
  if (stock !== undefined) updateData.stock = stock;
  if (priceModifier !== undefined) updateData.priceModifier = priceModifier;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  
  const updatedVariant = product.updateColorVariant(req.params.variantId, updateData);
  await product.save();
  
  res.json({
    success: true,
    message: 'Color variant updated successfully',
    data: updatedVariant
  });
});

// @desc    Delete a color variant
// @route   DELETE /api/products/:productId/color-variants/:variantId
// @access  Private/Admin
const deleteColorVariant = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const variant = product.getColorVariant(req.params.variantId);
  
  if (!variant) {
    res.status(404);
    throw new Error('Color variant not found');
  }
  
  // Delete images from Cloudinary
  if (variant.images && variant.images.length > 0) {
    const deletePromises = variant.images.map(image => {
      if (image.publicId) {
        return cloudinary.uploader.destroy(image.publicId);
      }
    });
    
    await Promise.all(deletePromises);
  }
  
  // Remove variant from product
  const removed = product.removeColorVariant(req.params.variantId);
  
  if (!removed) {
    res.status(400);
    throw new Error('Failed to remove color variant');
  }
  
  await product.save();
  
  res.json({
    success: true,
    message: 'Color variant deleted successfully'
  });
});

// @desc    Upload images for a color variant
// @route   POST /api/products/:productId/color-variants/:variantId/images
// @access  Private/Admin
const uploadColorVariantImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const variant = product.getColorVariant(req.params.variantId);
  
  if (!variant) {
    res.status(404);
    throw new Error('Color variant not found');
  }
  
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No images uploaded');
  }
  
  // Upload images to Cloudinary
  const uploadPromises = req.files.map(async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `products/${product._id}/colors/${variant._id}`,
      transformation: [
        { width: 800, height: 800, crop: 'fill', quality: 'auto' },
        { format: 'auto' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      alt: `${product.name} - ${variant.colorName}`,
      isPrimary: variant.images.length === 0, // First image is primary
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  });
  
  const uploadedImages = await Promise.all(uploadPromises);
  
  // Add images to variant
  variant.images.push(...uploadedImages);
  await product.save();
  
  res.json({
    success: true,
    message: `${uploadedImages.length} images uploaded successfully`,
    data: {
      variantId: variant._id,
      uploadedImages: uploadedImages,
      totalImages: variant.images.length
    }
  });
});

// @desc    Delete an image from a color variant
// @route   DELETE /api/products/:productId/color-variants/:variantId/images/:imageIndex
// @access  Private/Admin
const deleteColorVariantImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const variant = product.getColorVariant(req.params.variantId);
  
  if (!variant) {
    res.status(404);
    throw new Error('Color variant not found');
  }
  
  const imageIndex = parseInt(req.params.imageIndex);
  
  if (imageIndex < 0 || imageIndex >= variant.images.length) {
    res.status(400);
    throw new Error('Invalid image index');
  }
  
  const imageToDelete = variant.images[imageIndex];
  
  // Delete from Cloudinary
  if (imageToDelete.publicId) {
    await cloudinary.uploader.destroy(imageToDelete.publicId);
  }
  
  // Remove from array
  variant.images.splice(imageIndex, 1);
  
  // If deleted image was primary, make first image primary
  if (imageToDelete.isPrimary && variant.images.length > 0) {
    variant.images[0].isPrimary = true;
  }
  
  await product.save();
  
  res.json({
    success: true,
    message: 'Image deleted successfully',
    data: {
      variantId: variant._id,
      remainingImages: variant.images.length
    }
  });
});

// @desc    Set primary image for a color variant
// @route   PUT /api/products/:productId/color-variants/:variantId/images/:imageIndex/primary
// @access  Private/Admin
const setPrimaryImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const variant = product.getColorVariant(req.params.variantId);
  
  if (!variant) {
    res.status(404);
    throw new Error('Color variant not found');
  }
  
  const imageIndex = parseInt(req.params.imageIndex);
  
  if (imageIndex < 0 || imageIndex >= variant.images.length) {
    res.status(400);
    throw new Error('Invalid image index');
  }
  
  // Reset all images to non-primary
  variant.images.forEach(image => {
    image.isPrimary = false;
  });
  
  // Set selected image as primary
  variant.images[imageIndex].isPrimary = true;
  
  await product.save();
  
  res.json({
    success: true,
    message: 'Primary image updated successfully',
    data: {
      variantId: variant._id,
      primaryImageIndex: imageIndex,
      primaryImageUrl: variant.images[imageIndex].url
    }
  });
});

// @desc    Set default color variant for product
// @route   PUT /api/products/:productId/color-variants/:variantId/set-default
// @access  Private/Admin
const setDefaultColorVariant = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const variant = product.getColorVariant(req.params.variantId);
  
  if (!variant) {
    res.status(404);
    throw new Error('Color variant not found');
  }
  
  product.defaultColorVariant = req.params.variantId;
  await product.save();
  
  res.json({
    success: true,
    message: 'Default color variant updated successfully',
    data: {
      productId: product._id,
      defaultColorVariant: product.defaultColorVariant,
      colorName: variant.colorName
    }
  });
});

// @desc    Reorder color variants
// @route   PUT /api/products/:productId/color-variants/reorder
// @access  Private/Admin
const reorderColorVariants = asyncHandler(async (req, res) => {
  const { variantOrder } = req.body; // Array of variant IDs in desired order
  
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  if (!Array.isArray(variantOrder)) {
    res.status(400);
    throw new Error('Variant order must be an array');
  }
  
  // Update sort order for each variant
  variantOrder.forEach((variantId, index) => {
    const variant = product.getColorVariant(variantId);
    if (variant) {
      variant.sortOrder = index;
    }
  });
  
  // Sort variants by sortOrder
  product.colorVariants.sort((a, b) => a.sortOrder - b.sortOrder);
  
  await product.save();
  
  res.json({
    success: true,
    message: 'Color variants reordered successfully',
    data: {
      productId: product._id,
      colorVariants: product.colorVariants.map(v => ({
        _id: v._id,
        colorName: v.colorName,
        sortOrder: v.sortOrder
      }))
    }
  });
});

module.exports = {
  getProductColorVariants,
  addColorVariant,
  updateColorVariant,
  deleteColorVariant,
  uploadColorVariantImages,
  deleteColorVariantImage,
  setPrimaryImage,
  setDefaultColorVariant,
  reorderColorVariants
};