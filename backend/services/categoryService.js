const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

class CategoryService {
  // Get all categories with filters
  async getCategories(filters = {}) {
    const { page = 1, limit = 20, search, status } = filters;
    
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

    return {
      categories,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    };
  }

  // Get single category by ID
  async getCategoryById(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  // Get category by slug
  async getCategoryBySlug(slug) {
    const category = await Category.findOne({ 
      slug, 
      isActive: true 
    });
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  // Create new category
  async createCategory(categoryData) {
    const {
      name,
      description,
      image,
      sortOrder,
      seoTitle,
      seoDescription
    } = categoryData;

    if (!name) {
      throw new Error('Category name is required');
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const category = await Category.create({
      name,
      description,
      image,
      sortOrder: sortOrder || 0,
      seoTitle,
      seoDescription
    });

    return category;
  }

  // Update category
  async updateCategory(categoryId, updateData) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    const { name } = updateData;

    // Check if name is being changed and if it already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'isActive') {
          category[key] = Boolean(updateData[key]);
        } else if (key === 'sortOrder') {
          category[key] = Number(updateData[key]);
        } else {
          category[key] = updateData[key];
        }
      }
    });

    return await category.save();
  }

  // Soft delete category
  async deleteCategory(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      throw new Error(`Cannot delete category. It has ${productCount} products associated with it.`);
    }

    // Soft delete - deactivate instead of removing
    category.isActive = false;
    await category.save();

    return { message: 'Category deactivated successfully' };
  }

  // Get category statistics
  async getCategoryStats() {
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

    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
      topCategories
    };
  }

  // Bulk category actions
  async bulkCategoryAction(action, categoryIds) {
    if (!action || !categoryIds || !Array.isArray(categoryIds)) {
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
        throw new Error('Invalid action');
    }

    return {
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount
    };
  }
}

module.exports = new CategoryService();