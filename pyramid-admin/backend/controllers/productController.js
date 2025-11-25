const asyncHandler = require('express-async-handler');
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
    query.category = category;
  }
  
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  // Get categories for filter
  const categories = await Product.distinct('category');

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
      categories
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
    images,
    brand,
    weight,
    dimensions,
    tags,
    seoTitle,
    seoDescription,
    featured
  } = req.body;

  // Validation
  if (!name || !price || !category) {
    res.status(400);
    throw new Error('Name, price, and category are required');
  }

  const product = new Product({
    name,
    description,
    price: Number(price),
    category,
    stock: Number(stock) || 0,
    images: images || [],
    brand,
    weight: weight ? Number(weight) : undefined,
    dimensions,
    tags: tags || [],
    seoTitle,
    seoDescription,
    featured: Boolean(featured)
  });

  const created = await product.save();
  res.status(201).json({ success: true, data: created });
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

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product removed' });
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
    case 'delete':
      result = await Product.deleteMany({ _id: { $in: productIds } });
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
  createProduct, 
  updateProduct, 
  deleteProduct,
  bulkProductAction
};





