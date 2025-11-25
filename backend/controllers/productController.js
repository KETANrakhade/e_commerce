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
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  const filters = {
    page: Number(req.query.pageNumber) || 1,
    limit: 12,
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
  const created = await productService.createProduct(req.body);
  res.status(201).json({ 
    success: true, 
    data: created,
    message: 'Product created successfully'
  });
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

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res.json({ 
    success: true, 
    message: result.message
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

module.exports = { 
  getProducts, 
  getAdminProducts,
  getProductById, 
  getProductsByCategory,
  getFeaturedProducts,
  createProduct, 
  updateProduct,
  deleteProduct,
  bulkProductAction
};





