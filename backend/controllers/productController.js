const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/productModel');

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword ? { 
    $and: [
      { isActive: true },
      { $or: [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ]}
    ]
  } : { isActive: true };
  
  const count = await Product.countDocuments({...keyword});
  const products = await Product.find({...keyword})
    .limit(pageSize)
    .skip(pageSize*(page-1))
    .sort({ createdAt: -1 });
    
  res.json({ 
    success: true,
    data: {
      products, 
      page, 
      pages: Math.ceil(count/pageSize),
      total: count
    }
  });
});

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const brand = req.query.brand || '';
  const status = req.query.status || '';

  // Build query
  let query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category) {
    // Support both ObjectId and string category searches
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      query.categoryName = { $regex: category, $options: 'i' };
    }
  }

  if (brand) {
    // Support both ObjectId and string brand searches
    if (mongoose.Types.ObjectId.isValid(brand)) {
      query.brand = brand;
    } else {
      query.brandName = { $regex: brand, $options: 'i' };
    }
  }
  
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('brand', 'name slug')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  // Get categories and brands for filters
  const Category = require('../models/categoryModel');
  const Brand = require('../models/brandModel');
  
  const categories = await Category.find({ isActive: true }).select('_id name');
  const brands = await Brand.find({ isActive: true }).select('_id name');

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
        limit: pageSize
      },
      categories,
      brands
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json({ success: true, data: product });
  } else { 
    res.status(404); 
    throw new Error('Product not found'); 
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  
  let query = { isActive: true };
  
  // Support both ObjectId and string category searches
  if (mongoose.Types.ObjectId.isValid(category)) {
    query.category = category;
  } else {
    // Try to find category by name or slug first
    const Category = require('../models/categoryModel');
    const categoryDoc = await Category.findOne({
      $or: [
        { name: { $regex: category, $options: 'i' } },
        { slug: category }
      ],
      isActive: true
    });
    
    if (categoryDoc) {
      query.category = categoryDoc._id;
    } else {
      // Fallback to string search for backward compatibility
      query.categoryName = { $regex: category, $options: 'i' };
    }
  }
  
  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('brand', 'name slug')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
    
  res.json({ 
    success: true,
    data: {
      products, 
      page, 
      pages: Math.ceil(count / pageSize),
      total: count,
      category
    }
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  
  const products = await Product.find({ 
    featured: true, 
    isActive: true 
  })
    .limit(limit)
    .sort({ createdAt: -1 });
    
  res.json({ 
    success: true,
    data: products
  });
});

// @desc    Create product (admin)
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    stock,
    images, // New detailed image objects
    imageUrls, // Simple URLs for backward compatibility
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

  // Process images - handle both new format and backward compatibility
  let processedImages = [];
  let processedImageUrls = [];

  if (images && Array.isArray(images)) {
    // New detailed image format
    processedImages = images.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      alt: img.alt || `${name} - Image ${index + 1}`,
      isPrimary: index === 0 || img.isPrimary,
      width: img.width,
      height: img.height,
      format: img.format,
      size: img.size
    }));
    
    // Also populate imageUrls for backward compatibility
    processedImageUrls = images.map(img => img.url);
  } else if (imageUrls && Array.isArray(imageUrls)) {
    // Backward compatibility - convert simple URLs to detailed format
    processedImageUrls = imageUrls;
    processedImages = imageUrls.map((url, index) => ({
      url: url,
      publicId: '', // Will be empty for backward compatibility
      alt: `${name} - Image ${index + 1}`,
      isPrimary: index === 0,
      width: null,
      height: null,
      format: null,
      size: null
    }));
  }

  // Generate SKU if not provided
  const generatedSku = sku || `${category.substring(0, 3).toUpperCase()}-${Date.now()}`;

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
    dimensions,
    tags: tags || [],
    seoTitle: seoTitle || name,
    seoDescription: seoDescription || description,
    featured: Boolean(featured),
    sku: generatedSku
  });

  const created = await product.save();
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
  const {
    name,
    description,
    price,
    category,
    stock,
    images,
    isActive,
    featured,
    brand,
    weight,
    dimensions,
    tags,
    seoTitle,
    seoDescription
  } = req.body;

  const product = await Product.findById(req.params.id);
  
  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.images = images || product.images;
    product.isActive = isActive !== undefined ? Boolean(isActive) : product.isActive;
    product.featured = featured !== undefined ? Boolean(featured) : product.featured;
    product.brand = brand || product.brand;
    product.weight = weight !== undefined ? Number(weight) : product.weight;
    product.dimensions = dimensions || product.dimensions;
    product.tags = tags || product.tags;
    product.seoTitle = seoTitle || product.seoTitle;
    product.seoDescription = seoDescription || product.seoDescription;

    const updated = await product.save();
    res.json({ success: true, data: updated });
  } else { 
    res.status(404); 
    throw new Error('Product not found'); 
  }
});




// @desc    Bulk actions on products (admin)
// @route   POST /api/admin/products/bulk-action
// @access  Private/Admin
const bulkProductAction = asyncHandler(async (req, res) => {
  const { action, productIds } = req.body;

  if (!action || !productIds || !Array.isArray(productIds)) {
    res.status(400);
    throw new Error('Action and product IDs are required');
  }

  let result;
  
  switch (action) {
    case 'activate':
      result = await Product.updateMany(
        { _id: { $in: productIds } },
        { isActive: true }
      );
      break;
    case 'deactivate':
      result = await Product.updateMany(
        { _id: { $in: productIds } },
        { isActive: false }
      );
      break;
    case 'feature':
      result = await Product.updateMany(
        { _id: { $in: productIds } },
        { featured: true }
      );
      break;
    case 'unfeature':
      result = await Product.updateMany(
        { _id: { $in: productIds } },
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
    modifiedCount: result.modifiedCount || result.deletedCount
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
  bulkProductAction
};





