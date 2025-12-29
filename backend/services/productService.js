const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');
const emailService = require('./emailService');

class ProductService {
  // Get all products with filters
  async getProducts(filters = {}) {
    const {
      page = 1,
      limit = 12,
      keyword = '',
      category = '',
      brand = '',
      minPrice = 0,
      maxPrice = Infinity,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive,
      featured
    } = filters;

    const query = {};
    
    // Handle isActive filter
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
    // Handle featured filter
    if (featured !== undefined) {
      query.featured = featured;
    }

    // Search by keyword
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    // Filter by category - support both ObjectId and string
    if (category) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        // Try to find category by name or slug
        const categoryDoc = await Category.findOne({
          $or: [
            { name: { $regex: `^${category}$`, $options: 'i' } },
            { slug: { $regex: `^${category}$`, $options: 'i' } }
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
    }

    // Filter by brand - support both ObjectId and string
    if (brand) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(brand)) {
        query.brand = brand;
      } else {
        query.brandName = { $regex: brand, $options: 'i' };
      }
    }

    // Filter by price range
    if (minPrice > 0 || maxPrice < Infinity) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('brand', 'name slug')
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    return {
      products,
      pagination: {
        page,
        pages: Math.ceil(count / limit),
        total: count,
        limit
      }
    };
  }

  // Get single product by ID
  async getProductById(productId) {
    const product = await Product.findById(productId)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('brand', 'name slug');

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  // Create new product
  async createProduct(productData) {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      brand,
      stock = 0,
      images = [],
      imageUrls = [],
      weight,
      dimensions,
      tags = [],
      seoTitle,
      seoDescription,
      featured = false,
      sku
    } = productData;

    // Validation
    if (!name || !price || !category) {
      throw new Error('Name, price, and category are required');
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new Error('Invalid category');
    }

    // Handle brand - support both ObjectId and brand name
    let brandId = null;
    if (brand) {
      // Check if brand is a valid ObjectId
      if (brand.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId, verify it exists
        const brandExists = await Brand.findById(brand);
        if (!brandExists) {
          throw new Error('Invalid brand ID');
        }
        brandId = brand;
      } else {
        // It's a brand name, find or create the brand
        let brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${brand}$`, 'i') } });
        if (!brandDoc) {
          // Create new brand if it doesn't exist
          brandDoc = await Brand.create({
            name: brand,
            slug: brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            description: `${brand} brand products`,
            isActive: true
          });
        }
        brandId = brandDoc._id;
      }
    }

    // Process images
    let processedImages = [];
    let processedImageUrls = [];

    if (images && images.length > 0) {
      processedImages = images.map((img, index) => ({
        url: img.url,
        publicId: img.publicId || `product-${Date.now()}-${index}`,
        alt: img.alt || `${name} - Image ${index + 1}`,
        isPrimary: index === 0 || img.isPrimary,
        width: img.width,
        height: img.height,
        format: img.format,
        size: img.size
      }));
      processedImageUrls = images.map(img => img.url);
    } else if (imageUrls && imageUrls.length > 0) {
      processedImageUrls = imageUrls;
      processedImages = imageUrls.map((url, index) => ({
        url,
        publicId: `product-${Date.now()}-${index}`,
        alt: `${name} - Image ${index + 1}`,
        isPrimary: index === 0
      }));
    }

    // Generate SKU if not provided
    const generatedSku = sku || `${categoryExists.name.substring(0, 3).toUpperCase()}-${Date.now()}`;

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      subcategory,
      brand: brandId,
      stock: Number(stock),
      images: processedImages,
      imageUrls: processedImageUrls,
      weight: weight ? Number(weight) : undefined,
      dimensions,
      tags,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description,
      featured: Boolean(featured),
      sku: generatedSku
    });

    const createdProduct = await product.save();
    return createdProduct;
  }

  // Update product
  async updateProduct(productId, updateData) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Verify category if being updated
    if (updateData.category && updateData.category !== product.category.toString()) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        throw new Error('Invalid category');
      }
    }

    // Verify brand if being updated
    if (updateData.brand && updateData.brand !== product.brand?.toString()) {
      const brandExists = await Brand.findById(updateData.brand);
      if (!brandExists) {
        throw new Error('Invalid brand');
      }
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        product[key] = updateData[key];
      }
    });

    // Check for low stock and send alert
    if (updateData.stock !== undefined && updateData.stock < 10 && updateData.stock !== product.stock) {
      try {
        await emailService.sendLowStockAlert(product);
      } catch (error) {
        console.error('Failed to send low stock alert:', error);
      }
    }

    const updatedProduct = await product.save();
    return updatedProduct;
  }

  // Delete product (soft delete)
  async deleteProduct(productId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    return { message: 'Product deleted successfully' };
  }

  // Hard delete product
  async hardDeleteProduct(productId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    await Product.findByIdAndDelete(productId);
    return { message: 'Product permanently deleted' };
  }

  // Bulk actions
  async bulkAction(action, productIds) {
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new Error('Product IDs are required');
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
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { isActive: false }
        );
        break;

      case 'hardDelete':
        result = await Product.deleteMany({ _id: { $in: productIds } });
        break;

      default:
        throw new Error('Invalid action');
    }

    return {
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount || result.deletedCount || 0
    };
  }

  // Update stock
  async updateStock(productId, quantity, operation = 'set') {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    switch (operation) {
      case 'set':
        product.stock = quantity;
        break;
      case 'add':
        product.stock += quantity;
        break;
      case 'subtract':
        product.stock = Math.max(0, product.stock - quantity);
        break;
      default:
        throw new Error('Invalid operation');
    }

    // Check for low stock
    if (product.stock < 10) {
      try {
        await emailService.sendLowStockAlert(product);
      } catch (error) {
        console.error('Failed to send low stock alert:', error);
      }
    }

    await product.save();
    return product;
  }

  // Get product statistics
  async getProductStats() {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });
    const featuredProducts = await Product.countDocuments({ featured: true });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lt: 10 } });

    // Get products by category
    const productsByCategory = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', count: 1 } }
    ]);

    // Average price
    const avgPrice = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      outOfStock,
      lowStock,
      productsByCategory,
      averagePrice: avgPrice.length > 0 ? avgPrice[0].avgPrice : 0
    };
  }
}

module.exports = new ProductService();
