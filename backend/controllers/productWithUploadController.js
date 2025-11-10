const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const { uploadMultipleImages } = require('../config/cloudinary');

// @desc    Create product with image upload
// @route   POST /api/admin/products/with-upload
// @access  Private/Admin
const createProductWithUpload = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      brand,
      weight,
      dimensions,
      tags,
      seoTitle,
      seoDescription,
      featured,
      sku
    } = req.body;

    // Validation
    if (!name || !price || !category) {
      res.status(400);
      throw new Error('Name, price, and category are required');
    }

    let processedImages = [];
    let processedImageUrls = [];

    // Handle image uploads if files are provided
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} images for product: ${name}`);
      
      const sanitizedProductName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const fileBuffers = req.files.map(file => file.buffer);
      
      // Upload to Cloudinary
      const uploadResults = await uploadMultipleImages(fileBuffers, {
        folder: 'pyramid-ecommerce/products',
        public_id: `${sanitizedProductName}_${Date.now()}`,
      });

      // Process uploaded images
      processedImages = uploadResults.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        alt: `${name} - Image ${index + 1}`,
        isPrimary: index === 0,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }));

      processedImageUrls = uploadResults.map(result => result.secure_url);
      
      console.log(`Successfully uploaded ${uploadResults.length} images`);
    }

    // Parse dimensions if provided as string
    let parsedDimensions = dimensions;
    if (typeof dimensions === 'string') {
      try {
        parsedDimensions = JSON.parse(dimensions);
      } catch (e) {
        parsedDimensions = undefined;
      }
    }

    // Parse tags if provided as string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }

    // Generate SKU if not provided
    const generatedSku = sku || `${category.substring(0, 3).toUpperCase()}-${Date.now()}`;

    // Create product
    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      images: processedImages,
      imageUrls: processedImageUrls,
      brand,
      weight: weight ? Number(weight) : undefined,
      dimensions: parsedDimensions,
      tags: parsedTags || [],
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description,
      featured: Boolean(featured === 'true' || featured === true),
      sku: generatedSku
    });

    const created = await product.save();
    
    res.status(201).json({
      success: true,
      data: created,
      message: `Product created successfully${processedImages.length > 0 ? ` with ${processedImages.length} images` : ''}`
    });

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500);
    throw new Error(`Product creation failed: ${error.message}`);
  }
});

// @desc    Update product with image upload
// @route   PUT /api/admin/products/:id/with-upload
// @access  Private/Admin
const updateProductWithUpload = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const {
      name,
      description,
      price,
      category,
      stock,
      brand,
      weight,
      dimensions,
      tags,
      seoTitle,
      seoDescription,
      featured,
      isActive,
      keepExistingImages
    } = req.body;

    let updatedImages = [...product.images];
    let updatedImageUrls = [...product.imageUrls];

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} new images for product: ${product.name}`);
      
      const sanitizedProductName = (name || product.name).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const fileBuffers = req.files.map(file => file.buffer);
      
      // Upload to Cloudinary
      const uploadResults = await uploadMultipleImages(fileBuffers, {
        folder: 'pyramid-ecommerce/products',
        public_id: `${sanitizedProductName}_${Date.now()}`,
      });

      // Process new uploaded images
      const newImages = uploadResults.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        alt: `${name || product.name} - Image ${updatedImages.length + index + 1}`,
        isPrimary: updatedImages.length === 0 && index === 0, // First image is primary if no existing images
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }));

      const newImageUrls = uploadResults.map(result => result.secure_url);

      // Add new images to existing ones or replace them
      if (keepExistingImages === 'true') {
        updatedImages = [...updatedImages, ...newImages];
        updatedImageUrls = [...updatedImageUrls, ...newImageUrls];
      } else {
        updatedImages = newImages;
        updatedImageUrls = newImageUrls;
      }
      
      console.log(`Successfully uploaded ${uploadResults.length} new images`);
    }

    // Parse dimensions if provided as string
    let parsedDimensions = dimensions;
    if (typeof dimensions === 'string') {
      try {
        parsedDimensions = JSON.parse(dimensions);
      } catch (e) {
        parsedDimensions = product.dimensions;
      }
    }

    // Parse tags if provided as string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.images = updatedImages;
    product.imageUrls = updatedImageUrls;
    product.brand = brand || product.brand;
    product.weight = weight !== undefined ? Number(weight) : product.weight;
    product.dimensions = parsedDimensions || product.dimensions;
    product.tags = parsedTags || product.tags;
    product.seoTitle = seoTitle || product.seoTitle;
    product.seoDescription = seoDescription || product.seoDescription;
    product.featured = featured !== undefined ? Boolean(featured === 'true' || featured === true) : product.featured;
    product.isActive = isActive !== undefined ? Boolean(isActive === 'true' || isActive === true) : product.isActive;

    const updated = await product.save();
    
    res.json({
      success: true,
      data: updated,
      message: `Product updated successfully${req.files && req.files.length > 0 ? ` with ${req.files.length} new images` : ''}`
    });

  } catch (error) {
    console.error('Product update error:', error);
    res.status(500);
    throw new Error(`Product update failed: ${error.message}`);
  }
});

module.exports = {
  createProductWithUpload,
  updateProductWithUpload
};