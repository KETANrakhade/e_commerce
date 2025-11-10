const Brand = require('../models/brandModel');
const Product = require('../models/productModel');

class BrandService {
  // Get all brands with filters
  async getBrands(filters = {}) {
    const { page = 1, limit = 20, search, status, featured } = filters;
    
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

    return {
      brands,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    };
  }

  // Get featured brands
  async getFeaturedBrands(limit = 8) {
    const brands = await Brand.find({ 
      featured: true, 
      isActive: true 
    })
      .limit(Number(limit))
      .sort({ sortOrder: 1, name: 1 });

    return brands;
  }

  // Get single brand by ID
  async getBrandById(brandId) {
    const brand = await Brand.findById(brandId);
    if (!brand) {
      throw new Error('Brand not found');
    }
    return brand;
  }

  // Get brand by slug
  async getBrandBySlug(slug) {
    const brand = await Brand.findOne({ 
      slug, 
      isActive: true 
    });
    if (!brand) {
      throw new Error('Brand not found');
    }
    return brand;
  }

  // Create new brand
  async createBrand(brandData) {
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
    } = brandData;

    if (!name) {
      throw new Error('Brand name is required');
    }

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
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

    return brand;
  }

  // Update brand
  async updateBrand(brandId, updateData) {
    const brand = await Brand.findById(brandId);
    if (!brand) {
      throw new Error('Brand not found');
    }

    const { name } = updateData;

    // Check if name is being changed and if it already exists
    if (name && name !== brand.name) {
      const existingBrand = await Brand.findOne({ name });
      if (existingBrand) {
        throw new Error('Brand with this name already exists');
      }
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'isActive' || key === 'featured') {
          brand[key] = Boolean(updateData[key]);
        } else if (key === 'sortOrder' || key === 'establishedYear') {
          brand[key] = Number(updateData[key]);
        } else {
          brand[key] = updateData[key];
        }
      }
    });

    return await brand.save();
  }

  // Soft delete brand
  async deleteBrand(brandId) {
    const brand = await Brand.findById(brandId);
    if (!brand) {
      throw new Error('Brand not found');
    }

    // Check if brand has products
    const productCount = await Product.countDocuments({ brand: brand.name });
    if (productCount > 0) {
      throw new Error(`Cannot delete brand. It has ${productCount} products associated with it.`);
    }

    // Soft delete - deactivate instead of removing
    brand.isActive = false;
    await brand.save();

    return { message: 'Brand deactivated successfully' };
  }

  // Get brand statistics
  async getBrandStats() {
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

    return {
      totalBrands,
      activeBrands,
      inactiveBrands,
      featuredBrands,
      topBrands
    };
  }

  // Bulk brand actions
  async bulkBrandAction(action, brandIds) {
    if (!action || !brandIds || !Array.isArray(brandIds)) {
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
        throw new Error('Invalid action');
    }

    return {
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount
    };
  }
}

module.exports = new BrandService();