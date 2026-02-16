const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');

// @desc    Get all products with search and filters (public)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const filters = {
    page: Number(req.query.pageNumber) || 1,
    limit: Number(req.query.limit) || 12,
    keyword: req.query.keyword || '',
    category: req.query.category || '',
    subcategory: req.query.subcategory || '',
    brand: req.query.brand || '',
    minPrice: Number(req.query.minPrice) || 0,
    maxPrice: Number(req.query.maxPrice) || Number.MAX_SAFE_INTEGER,
    sortBy: req.query.sortBy || 'createdAt',
    sortOrder: req.query.sortOrder || 'desc',
    isActive: true
  };
  
  const result = await productService.getProducts(filters);
  
  res.json({ 
    success: true,
    data: {
      products: result.products, 
      page: result.pagination.page, 
      pages: result.pagination.pages,
      total: result.pagination.total,
      filters: {
        keyword: filters.keyword,
        category: filters.category,
        brand: filters.brand,
        priceRange: { min: filters.minPrice, max: filters.maxPrice }
      }
    }
  });
});

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = asyncHandler(async (req, res) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    keyword: req.query.search || '',
    category: req.query.category || '',
    brand: req.query.brand || '',
    isActive: req.query.status === 'active' ? true : req.query.status === 'inactive' ? false : undefined
  };

  const result = await productService.getProducts(filters);
  
  // Get categories and brands for filters
  const Category = require('../models/categoryModel');
  const Brand = require('../models/brandModel');
  
  const categories = await Category.find({ isActive: true }).select('_id name');
  const brands = await Brand.find({ isActive: true }).select('_id name');

  res.json({
    success: true,
    data: {
      products: result.products,
      pagination: result.pagination,
      categories,
      brands
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const productDoc = await productService.getProductById(req.params.id);
  
  console.log('🔍 Raw product from DB:', {
    name: productDoc.name,
    price: productDoc.price,
    discount: productDoc.discount
  });
  
  // Convert to plain object for manipulation
  const product = productDoc.toObject();
  
  // Transform color variants for frontend consumption
  if (product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0) {
    // Sort color variants by sortOrder
    product.colorVariants.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    // Transform color variants to frontend format
    product.colorVariants = product.colorVariants
      .filter(variant => variant.isActive) // Only show active variants to public
      .map(variant => ({
        _id: variant._id,
        colorName: variant.colorName,
        colorCode: variant.colorCode,
        sku: variant.sku,
        stock: variant.stock,
        priceModifier: variant.priceModifier || 0,
        // If priceModifier is set and not 0, use it as the actual price, otherwise use base price
        finalPrice: (variant.priceModifier && variant.priceModifier !== 0) ? variant.priceModifier : product.price,
        images: variant.images || [],
        isPrimary: variant.images && variant.images.length > 0 ? variant.images.find(img => img.isPrimary) : null,
        thumbnailImage: variant.images && variant.images.length > 0 ? 
          (variant.images.find(img => img.isPrimary) || variant.images[0]).url : null,
        isDefault: product.defaultColorVariant && product.defaultColorVariant.toString() === variant._id.toString(),
        sortOrder: variant.sortOrder || 0
      }));
    
    // If no default is set, make first variant default
    if (!product.colorVariants.find(v => v.isDefault) && product.colorVariants.length > 0) {
      product.colorVariants[0].isDefault = true;
    }
  }
  
  res.json({ success: true, data: product });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 12,
    category: category,
    isActive: true
  };
  
  const result = await productService.getProducts(filters);
  
  res.json({ 
    success: true,
    data: {
      products: result.products, 
      page: result.pagination.page, 
      pages: result.pagination.pages,
      total: result.pagination.total,
      category
    }
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  
  const filters = {
    limit: limit,
    featured: true,
    isActive: true
  };
  
  const result = await productService.getProducts(filters);
  
  res.json({ 
    success: true,
    data: result.products
  });
});

// @desc    Create product (admin)
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const requestId = Date.now();
  console.log(`🚨 [${requestId}] CONTROLLER DEFINITELY HIT - THIS SHOULD SHOW UP!`);
  console.log(`🚨 [${requestId}] If you see this, the controller is being called`);
  
  // Write to a file to make sure we can see the logs
  const fs = require('fs');
  fs.appendFileSync('/tmp/product-controller-debug.log', `[${new Date().toISOString()}] Controller hit with discount: ${JSON.stringify(req.body.discount)}\n`);
  
  console.log(`🔍 [${requestId}] CREATE PRODUCT ENDPOINT HIT`);
  console.log(`🔍 [${requestId}] Request body keys:`, Object.keys(req.body));
  console.log(`🔍 [${requestId}] Full request body:`, JSON.stringify(req.body, null, 2));
  console.log(`🔍 [${requestId}] Discount in request:`, req.body.discount);
  console.log(`🔍 [${requestId}] Discount type:`, typeof req.body.discount);
  console.log(`🔍 [${requestId}] Discount isOnSale:`, req.body.discount?.isOnSale);
  console.log(`🔍 [${requestId}] Discount percentage:`, req.body.discount?.percentage);
  
  const created = await productService.createProduct(req.body);
  
  console.log(`🔍 [${requestId}] Created product discount:`, created.discount);
  console.log(`🔍 [${requestId}] About to send response...`);
  
  fs.appendFileSync('/tmp/product-controller-debug.log', `[${new Date().toISOString()}] Created product discount: ${JSON.stringify(created.discount)}\n`);
  
  const responseData = { 
    success: true, 
    data: created,
    message: 'Product created successfully'
  };
  
  console.log(`🔍 [${requestId}] Response data discount:`, responseData.data.discount);
  fs.appendFileSync('/tmp/product-controller-debug.log', `[${new Date().toISOString()}] Response data discount: ${JSON.stringify(responseData.data.discount)}\n`);
  
  res.status(201).json(responseData);
  
  console.log(`🔍 [${requestId}] Response sent`);
});

// @desc    Update product (admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const updated = await productService.updateProduct(req.params.id, req.body);
  res.json({ 
    success: true, 
    data: updated,
    message: 'Product updated successfully'
  });
});

// @desc    Delete product (admin) - PERMANENT DELETE
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.hardDeleteProduct(req.params.id);
  res.json({ 
    success: true, 
    message: 'Product permanently deleted successfully'
  });
});




// @desc    Bulk actions on products (admin)
// @route   POST /api/admin/products/bulk-action
// @access  Private/Admin
const bulkProductAction = asyncHandler(async (req, res) => {
  const { action, productIds } = req.body;
  const result = await productService.bulkAction(action, productIds);
  res.json({ 
    success: true, 
    message: result.message,
    modifiedCount: result.modifiedCount
  });
});

// @desc    Check SKU availability
// @route   POST /api/admin/products/check-sku
// @access  Private/Admin
const checkSkuAvailability = asyncHandler(async (req, res) => {
  const { skus } = req.body;
  
  if (!skus || !Array.isArray(skus)) {
    return res.status(400).json({
      success: false,
      message: 'SKUs array is required'
    });
  }
  
  const Product = require('../models/productModel');
  
  // Check if any SKU already exists in database
  const existingProducts = await Product.find({
    $or: [
      { sku: { $in: skus } },
      { 'colorVariants.sku': { $in: skus } }
    ]
  });
  
  const conflictingSKUs = [];
  for (const product of existingProducts) {
    if (skus.includes(product.sku)) {
      conflictingSKUs.push(product.sku);
    }
    if (product.colorVariants) {
      for (const variant of product.colorVariants) {
        if (skus.includes(variant.sku)) {
          conflictingSKUs.push(variant.sku);
        }
      }
    }
  }
  
  const uniqueConflicts = [...new Set(conflictingSKUs)];
  const availableSKUs = skus.filter(sku => !uniqueConflicts.includes(sku));
  
  res.json({
    success: true,
    data: {
      available: availableSKUs,
      conflicts: uniqueConflicts,
      allAvailable: uniqueConflicts.length === 0
    }
  });
});

module.exports = { 
  getProducts, 
  getAdminProducts,
  getProductById, 
  getProductsByCategory,
  getFeaturedProducts,
  createProduct, 
  updateProduct,
  deleteProduct,
  bulkProductAction,
  checkSkuAvailability
};





