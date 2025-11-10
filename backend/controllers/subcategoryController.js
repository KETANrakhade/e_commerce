const asyncHandler = require('express-async-handler');
const Subcategory = require('../models/subcategoryModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// @desc    Get all subcategories
// @route   GET /api/subcategories
// @access  Public
const getSubcategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category, status } = req.query;
  
  let query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category) {
    query.category = category;
  }
  
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;

  const skip = (page - 1) * limit;
  const total = await Subcategory.countDocuments(query);
  
  const subcategories = await Subcategory.find(query)
    .populate('category', 'name slug')
    .skip(skip)
    .limit(Number(limit))
    .sort({ sortOrder: 1, name: 1 });

  res.json({
    success: true,
    data: {
      subcategories,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    }
  });
});

// @desc    Get subcategories by category
// @route   GET /api/subcategories/category/:categoryId
// @access  Public
const getSubcategoriesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  
  const subcategories = await Subcategory.find({ 
    category: categoryId, 
    isActive: true 
  })
    .populate('category', 'name slug')
    .sort({ sortOrder: 1, name: 1 });

  res.json({
    success: true,
    data: subcategories
  });
});

// @desc    Get single subcategory
// @route   GET /api/subcategories/:id
// @access  Public
const getSubcategoryById = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id)
    .populate('category', 'name slug description');
  
  if (!subcategory) {
    res.status(404);
    throw new Error('Subcategory not found');
  }

  res.json({
    success: true,
    data: subcategory
  });
});

// @desc    Get subcategory by slug
// @route   GET /api/subcategories/slug/:categorySlug/:subcategorySlug
// @access  Public
const getSubcategoryBySlug = asyncHandler(async (req, res) => {
  const { categorySlug, subcategorySlug } = req.params;
  
  // First find the category
  const category = await Category.findOne({ slug: categorySlug, isActive: true });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const subcategory = await Subcategory.findOne({ 
    slug: subcategorySlug,
    category: category._id,
    isActive: true 
  }).populate('category', 'name slug description');
  
  if (!subcategory) {
    res.status(404);
    throw new Error('Subcategory not found');
  }

  res.json({
    success: true,
    data: subcategory
  });
});

// @desc    Create subcategory
// @route   POST /api/admin/subcategories
// @access  Private/Admin
const createSubcategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    image,
    sortOrder,
    seoTitle,
    seoDescription
  } = req.body;

  if (!name || !category) {
    res.status(400);
    throw new Error('Subcategory name and category are required');
  }

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Category not found');
  }

  // Check if subcategory already exists in this category
  const existingSubcategory = await Subcategory.findOne({ name, category });
  if (existingSubcategory) {
    res.status(400);
    throw new Error('Subcategory with this name already exists in this category');
  }

  const subcategory = await Subcategory.create({
    name,
    description,
    category,
    image,
    sortOrder: sortOrder || 0,
    seoTitle,
    seoDescription
  });

  // Populate category info
  await subcategory.populate('category', 'name slug');

  res.status(201).json({
    success: true,
    data: subcategory,
    message: 'Subcategory created successfully'
  });
});

// @desc    Update subcategory
// @route   PUT /api/admin/subcategories/:id
// @access  Private/Admin
const updateSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);
  
  if (!subcategory) {
    res.status(404);
    throw new Error('Subcategory not found');
  }

  const {
    name,
    description,
    category,
    image,
    isActive,
    sortOrder,
    seoTitle,
    seoDescription
  } = req.body;

  // Check if category exists (if being changed)
  if (category && category !== subcategory.category.toString()) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(400);
      throw new Error('Category not found');
    }
  }

  // Check if name is being changed and if it already exists in the category
  if (name && name !== subcategory.name) {
    const existingSubcategory = await Subcategory.findOne({ 
      name, 
      category: category || subcategory.category 
    });
    if (existingSubcategory) {
      res.status(400);
      throw new Error('Subcategory with this name already exists in this category');
    }
  }

  // Update fields
  subcategory.name = name || subcategory.name;
  subcategory.description = description || subcategory.description;
  subcategory.category = category || subcategory.category;
  subcategory.image = image || subcategory.image;
  subcategory.isActive = isActive !== undefined ? Boolean(isActive) : subcategory.isActive;
  subcategory.sortOrder = sortOrder !== undefined ? Number(sortOrder) : subcategory.sortOrder;
  subcategory.seoTitle = seoTitle || subcategory.seoTitle;
  subcategory.seoDescription = seoDescription || subcategory.seoDescription;

  const updatedSubcategory = await subcategory.save();
  await updatedSubcategory.populate('category', 'name slug');

  res.json({
    success: true,
    data: updatedSubcategory,
    message: 'Subcategory updated successfully'
  });
});

// @desc    Delete subcategory (soft delete)
// @route   DELETE /api/admin/subcategories/:id
// @access  Private/Admin
const deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);
  
  if (!subcategory) {
    res.status(404);
    throw new Error('Subcategory not found');
  }

  // Soft delete - deactivate instead of removing
  subcategory.isActive = false;
  await subcategory.save();

  res.json({
    success: true,
    message: 'Subcategory deactivated successfully'
  });
});

// @desc    Get subcategory statistics
// @route   GET /api/admin/subcategories/stats
// @access  Private/Admin
const getSubcategoryStats = asyncHandler(async (req, res) => {
  const totalSubcategories = await Subcategory.countDocuments();
  const activeSubcategories = await Subcategory.countDocuments({ isActive: true });
  const inactiveSubcategories = await Subcategory.countDocuments({ isActive: false });

  // Get subcategories by category
  const subcategoriesByCategory = await Subcategory.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $project: {
        categoryName: '$category.name',
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalSubcategories,
      activeSubcategories,
      inactiveSubcategories,
      subcategoriesByCategory
    }
  });
});

// @desc    Bulk subcategory actions
// @route   POST /api/admin/subcategories/bulk-action
// @access  Private/Admin
const bulkSubcategoryAction = asyncHandler(async (req, res) => {
  const { action, subcategoryIds } = req.body;

  if (!action || !subcategoryIds || !Array.isArray(subcategoryIds)) {
    res.status(400);
    throw new Error('Action and subcategory IDs are required');
  }

  let result;
  
  switch (action) {
    case 'activate':
      result = await Subcategory.updateMany(
        { _id: { $in: subcategoryIds } },
        { isActive: true }
      );
      break;
    case 'deactivate':
      result = await Subcategory.updateMany(
        { _id: { $in: subcategoryIds } },
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
  getSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryById,
  getSubcategoryBySlug,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoryStats,
  bulkSubcategoryAction
};