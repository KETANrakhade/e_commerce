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
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .lean(); // Use lean() for better performance and ensure all fields are returned

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
      sku,
      discount
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

    // Process discount data
    let processedDiscount = {
      isOnSale: false,
      percentage: 0,
      salePrice: 0,
      startDate: null,
      endDate: null,
      saleLabel: ''
    };

    if (discount) {
      console.log('🔍 Processing discount data:', discount);
      
      processedDiscount = {
        isOnSale: Boolean(discount.isOnSale || discount.percentage > 0),
        percentage: Number(discount.percentage) || 0,
        salePrice: Number(discount.salePrice) || 0,
        startDate: discount.startDate ? new Date(discount.startDate) : null,
        endDate: discount.endDate ? new Date(discount.endDate) : null,
        saleLabel: discount.saleLabel || (discount.percentage > 0 ? 'SALE' : '')
      };

      // Calculate sale price if not provided but percentage is given
      if (processedDiscount.percentage > 0 && !processedDiscount.salePrice) {
        processedDiscount.salePrice = Math.round(Number(price) * (1 - processedDiscount.percentage / 100));
      }

      console.log('🔍 Processed discount:', processedDiscount);
    }

    // Process color variants
    let processedColorVariants = [];
    let calculatedStock = Number(stock);
    let hasColorVariantsFlag = false;
    let defaultColorVariantId = null;
    
    if (productData.hasColorVariants && productData.colorVariants && productData.colorVariants.length > 0) {
      // Validate color variant SKUs are unique
      const variantSkus = productData.colorVariants.map(v => v.sku);
      const uniqueSkus = new Set(variantSkus);
      if (variantSkus.length !== uniqueSkus.size) {
        throw new Error('Color variant SKUs must be unique');
      }
      
      // Check if any SKU already exists in database
      const existingProducts = await Product.find({
        $or: [
          { sku: { $in: variantSkus } },
          { 'colorVariants.sku': { $in: variantSkus } }
        ]
      });
      
      if (existingProducts.length > 0) {
        // Find which specific SKUs are conflicting
        const conflictingSKUs = [];
        for (const product of existingProducts) {
          if (variantSkus.includes(product.sku)) {
            conflictingSKUs.push(product.sku);
          }
          if (product.colorVariants) {
            for (const variant of product.colorVariants) {
              if (variantSkus.includes(variant.sku)) {
                conflictingSKUs.push(variant.sku);
              }
            }
          }
        }
        
        // Generate suggested alternative SKUs
        const suggestions = [];
        for (const conflictSku of [...new Set(conflictingSKUs)]) {
          const timestamp = Date.now().toString().slice(-6);
          const randomNum = Math.floor(Math.random() * 999).toString().padStart(3, '0');
          const baseSku = conflictSku.split('-')[0] || 'PRODUCT';
          suggestions.push(`${baseSku}-${timestamp}-${randomNum}`);
        }
        
        throw new Error(`The following SKUs already exist: ${[...new Set(conflictingSKUs)].join(', ')}. Suggested alternatives: ${suggestions.join(', ')}`);
      }
      
      processedColorVariants = productData.colorVariants.map((variant, index) => ({
        colorName: variant.colorName,
        colorCode: variant.colorCode || '#000000',
        sku: variant.sku,
        images: variant.images || [],
        stock: Number(variant.stock) || 0,
        priceModifier: Number(variant.priceModifier) || 0,
        isActive: variant.isActive !== false, // Default to true
        sortOrder: variant.sortOrder || index
      }));
      
      // Calculate total stock from variants
      calculatedStock = processedColorVariants.reduce((total, variant) => total + variant.stock, 0);
      hasColorVariantsFlag = true;
      
      // Find default variant
      const defaultVariant = productData.colorVariants.find(v => v.isDefault);
      if (defaultVariant) {
        // We'll set this after the product is saved and we have the variant IDs
      }
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      subcategory,
      brand: brandId,
      stock: calculatedStock,
      images: processedImages,
      imageUrls: processedImageUrls,
      weight: weight ? Number(weight) : undefined,
      dimensions,
      tags,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description,
      featured: Boolean(featured),
      sku: generatedSku,
      colorVariants: processedColorVariants,
      hasColorVariants: hasColorVariantsFlag,
      discount: processedDiscount
    });

    const createdProduct = await product.save();
    
    // Set default color variant if specified
    if (hasColorVariantsFlag && processedColorVariants.length > 0) {
      const defaultVariant = productData.colorVariants.find(v => v.isDefault);
      if (defaultVariant) {
        const savedVariant = createdProduct.colorVariants.find(v => v.sku === defaultVariant.sku);
        if (savedVariant) {
          createdProduct.defaultColorVariant = savedVariant._id;
          await createdProduct.save();
        }
      } else {
        // Set first variant as default
        createdProduct.defaultColorVariant = createdProduct.colorVariants[0]._id;
        await createdProduct.save();
      }
    }
    
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
