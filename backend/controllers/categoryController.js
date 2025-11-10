const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  
  let query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;

  const skip = (page - 1) * limit;
  const total = await Category.countDocuments(query);
  
  const categories = await Category.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort({ sortOrder: 1, name: 1 });

  res.json({
    success: true,
    data: {
      categories,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    }
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({
    success: true,
    data: category
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ 
    slug: req.params.slug, 
    isActive: true 
  });
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({
    success: true,
    data: category
  });
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    image,
    sortOrder,
    seoTitle,
    seoDescription
  } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    res.status(400);
    throw new Error('Category with this name already exists');
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    sortOrder: sortOrder || 0,
    seoTitle,
    seoDescription
  });

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully'
  });
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const {
    name,
    description,
    image,
    isActive,
    sortOrder,
    seoTitle,
    seoDescription
  } = req.body;

  // Check if name is being changed and if it already exists
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400);
      throw new Error('Category with this name already exists');
    }
  }

  // Update fields
  category.name = name || category.name;
  category.description = description || category.description;
  category.image = image || category.image;
  category.isActive = isActive !== undefined ? Boolean(isActive) : category.isActive;
  category.sortOrder = sortOrder !== undefined ? Number(sortOrder) : category.sortOrder;
  category.seoTitle = seoTitle || category.seoTitle;
  category.seoDescription = seoDescription || category.seoDescription;

  const updatedCategory = await category.save();

  res.json({
    success: true,
    data: updatedCategory,
    message: 'Category updated successfully'
  });
});

// @desc    Delete category (soft delete)
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category.name });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category. It has ${productCount} products associated with it.`);
  }

  // Soft delete - deactivate instead of removing
  category.isActive = false;
  await category.save();

  res.json({
    success: true,
    message: 'Category deactivated successfully'
  });
});

// @desc    Get category statistics
// @route   GET /api/admin/categories/stats
// @access  Private/Admin
const getCategoryStats = asyncHandler(async (req, res) => {
  const totalCategories = await Category.countDocuments();
  const activeCategories = await Category.countDocuments({ isActive: true });
  const inactiveCategories = await Category.countDocuments({ isActive: false });

  // Update product counts for all categories
  const categories = await Category.find();
  for (const category of categories) {
    const productCount = await Product.countDocuments({ 
      category: category.name,
      isActive: true 
    });
    category.productCount = productCount;
    await category.save();
  }

  // Get categories with most products
  const topCategories = await Category.find({ isActive: true })
    .sort({ productCount: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      totalCategories,
      activeCategories,
      inactiveCategories,
      topCategories
    }
  });
});

// @desc    Bulk category actions
// @route   POST /api/admin/categories/bulk-action
// @access  Private/Admin
const bulkCategoryAction = asyncHandler(async (req, res) => {
  const { action, categoryIds } = req.body;

  if (!action || !categoryIds || !Array.isArray(categoryIds)) {
    res.status(400);
    throw new Error('Action and category IDs are required');
  }

  let result;
  
  switch (action) {
    case 'activate':
      result = await Category.updateMany(
        { _id: { $in: categoryIds } },
        { isActive: true }
      );
      break;
    case 'deactivate':
      result = await Category.updateMany(
        { _id: { $in: categoryIds } },
        { isActive: false }
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
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  bulkCategoryAction
};