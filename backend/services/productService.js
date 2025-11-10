const Product = require('../models/productModel');

class ProductService {
  // Get all products with filters
  async getProducts(filters = {}) {
    const { 
      page = 1, 
      limit = 12, 
      keyword, 
      category, 
      minPrice, 
      maxPrice, 
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    let query = { isActive: true };

    // Search by keyword
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Featured products
    if (featured !== undefined) {
      query.featured = featured;
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);

    return {
      products,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  // Get single product by ID
  async getProductById(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  // Get products by category
  async getProductsByCategory(category, filters = {}) {
    const { page = 1, limit = 12 } = filters;
    
    const query = { 
      category: { $regex: category, $options: 'i' }, 
      isActive: true 
    };
    
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return {
      products,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      category
    };
  }

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    const products = await Product.find({ 
      featured: true, 
      isActive: true 
    })
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return products;
  }

  // Create new product
  async createProduct(productData) {
    const {
      name,
      description,
      price,
      category,
      stock = 0,
      images = [],
      brand,
      weight,
      dimensions,
      tags = [],
      seoTitle,
      seoDescription,
      featured = false
    } = productData;

    // Validation
    if (!name || !price || !category) {
      throw new Error('Name, price, and category are required');
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      images,
      brand,
      weight: weight ? Number(weight) : undefined,
      dimensions,
      tags,
      seoTitle,
      seoDescription,
      featured: Boolean(featured)
    });

    return await product.save();
  }

  // Update product
  async updateProduct(productId, updateData) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'price' || key === 'stock' || key === 'weight') {
          product[key] = Number(updateData[key]);
        } else if (key === 'featured' || key === 'isActive') {
          product[key] = Boolean(updateData[key]);
        } else {
          product[key] = updateData[key];
        }
      }
    });

    return await product.save();
  }



  // Bulk actions on products
  async bulkProductAction(action, productIds) {
    if (!action || !productIds || !Array.isArray(productIds)) {
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
        throw new Error('Invalid action');
    }

    return {
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount || result.deletedCount
    };
  }

  // Get admin products with filters
  async getAdminProducts(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      status 
    } = filters;

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    
    if (status === 'active') query.isActive = true;
    else if (status === 'inactive') query.isActive = false;

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get categories for filter
    const categories = await Product.distinct('category');

    return {
      products,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      categories
    };
  }

  // Update product stock
  async updateStock(productId, quantity, operation = 'decrease') {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (operation === 'decrease') {
      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }
      product.stock -= quantity;
    } else if (operation === 'increase') {
      product.stock += quantity;
    }

    return await product.save();
  }

  // Get product statistics
  async getProductStats() {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ featured: true });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });

    // Get categories
    const categories = await Product.distinct('category');

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      featuredProducts,
      outOfStock,
      lowStock,
      totalCategories: categories.length,
      categories
    };
  }
}

module.exports = new ProductService();