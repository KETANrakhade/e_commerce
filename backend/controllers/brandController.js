const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const Product = require('../models/productModel');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, featured } = req.query;
  
  let query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (featured !== undefined) query.featured = Boolean(featured);

  const skip = (page - 1) * limit;
  const total = await Brand.countDocuments(query);
  
  const brands = await Brand.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort({ sortOrder: 1, name: 1 });

  res.json({
    success: true,
    data: {
      brands,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    }
  });
});

// @desc    Get featured brands
// @route   GET /api/brands/featured
// @access  Public
const getFeaturedBrands = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  
  const brands = await Brand.find({ 
    featured: true, 
    isActive: true 
  })
    .limit(Number(limit))
    .sort({ sortOrder: 1, name: 1 });

  res.json({
    success: true,
    data: brands
  });
});

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  res.json({
    success: true,
    data: brand
  });
});

// @desc    Get brand by slug
// @route   GET /api/brands/slug/:slug
// @access  Public
const getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ 
    slug: req.params.slug, 
    isActive: true 
  });
  
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  res.json({
    success: true,
    data: brand
  });
});

// @desc    Create brand
// @route   POST /api/admin/brands
// @access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    logo,
    website,
    email,
    phone,
    address,
    featured,
    sortOrder,
    seoTitle,
    seoDescription,
    establishedYear,
    tags
  } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Brand name is required');
  }

  // Check if brand already exists
  const existingBrand = await Brand.findOne({ name });
  if (existingBrand) {
    res.status(400);
    throw new Error('Brand with this name already exists');
  }

  const brand = await Brand.create({
    name,
    description,
    logo,
    website,
    email,
    phone,
    address,
    featured: Boolean(featured),
    sortOrder: sortOrder || 0,
    seoTitle,
    seoDescription,
    establishedYear: establishedYear ? Number(establishedYear) : undefined,
    tags: tags || []
  });

  res.status(201).json({
    success: true,
    data: brand,
    message: 'Brand created successfully'
  });
});

// @desc    Update brand
// @route   PUT /api/admin/brands/:id
// @access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  const {
    name,
    description,
    logo,
    website,
    email,
    phone,
    address,
    isActive,
    featured,
    sortOrder,
    seoTitle,
    seoDescription,
    establishedYear,
    tags
  } = req.body;

  // Check if name is being changed and if it already exists
  if (name && name !== brand.name) {
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      res.status(400);
      throw new Error('Brand with this name already exists');
    }
  }

  // Update fields
  brand.name = name || brand.name;
  brand.description = description || brand.description;
  brand.logo = logo || brand.logo;
  brand.website = website || brand.website;
  brand.email = email || brand.email;
  brand.phone = phone || brand.phone;
  brand.address = address || brand.address;
  brand.isActive = isActive !== undefined ? Boolean(isActive) : brand.isActive;
  brand.featured = featured !== undefined ? Boolean(featured) : brand.featured;
  brand.sortOrder = sortOrder !== undefined ? Number(sortOrder) : brand.sortOrder;
  brand.seoTitle = seoTitle || brand.seoTitle;
  brand.seoDescription = seoDescription || brand.seoDescription;
  brand.establishedYear = establishedYear !== undefined ? Number(establishedYear) : brand.establishedYear;
  brand.tags = tags || brand.tags;

  const updatedBrand = await brand.save();

  res.json({
    success: true,
    data: updatedBrand,
    message: 'Brand updated successfully'
  });
});

// @desc    Delete brand (soft delete)
// @route   DELETE /api/admin/brands/:id
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  // Check if brand has products
  const productCount = await Product.countDocuments({ brand: brand.name });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete brand. It has ${productCount} products associated with it.`);
  }

  // Soft delete - deactivate instead of removing
  brand.isActive = false;
  await brand.save();

  res.json({
    success: true,
    message: 'Brand deactivated successfully'
  });
});

// @desc    Get brand statistics
// @route   GET /api/admin/brands/stats
// @access  Private/Admin
const getBrandStats = asyncHandler(async (req, res) => {
  const totalBrands = await Brand.countDocuments();
  const activeBrands = await Brand.countDocuments({ isActive: true });
  const inactiveBrands = await Brand.countDocuments({ isActive: false });
  const featuredBrands = await Brand.countDocuments({ featured: true, isActive: true });

  // Update product counts for all brands
  const brands = await Brand.find();
  for (const brand of brands) {
    const productCount = await Product.countDocuments({ 
      brand: brand.name,
      isActive: true 
    });
    brand.productCount = productCount;
    await brand.save();
  }

  // Get brands with most products
  const topBrands = await Brand.find({ isActive: true })
    .sort({ productCount: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      totalBrands,
      activeBrands,
      inactiveBrands,
      featuredBrands,
      topBrands
    }
  });
});

// @desc    Bulk brand actions
// @route   POST /api/admin/brands/bulk-action
// @access  Private/Admin
const bulkBrandAction = asyncHandler(async (req, res) => {
  const { action, brandIds } = req.body;

  if (!action || !brandIds || !Array.isArray(brandIds)) {
    res.status(400);
    throw new Error('Action and brand IDs are required');
  }

  let result;
  
  switch (action) {
    case 'activate':
      result = await Brand.updateMany(
        { _id: { $in: brandIds } },
        { isActive: true }
      );
      break;
    case 'deactivate':
      result = await Brand.updateMany(
        { _id: { $in: brandIds } },
        { isActive: false }
      );
      break;
    case 'feature':
      result = await Brand.updateMany(
        { _id: { $in: brandIds } },
        { featured: true }
      );
      break;
    case 'unfeature':
      result = await Brand.updateMany(
        { _id: { $in: brandIds } },
        { featured: false }
      );
      break;
    default:
      res.status(400);
      throw new Error('Invalid action');
  }

  res.json({
    success: true,
    message: `Bulk ${action} completed`,
    modifiedCount: result.modifiedCount
  });
});

module.exports = {
  getBrands,
  getFeaturedBrands,
  getBrandById,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandStats,
  bulkBrandAction
};