const Subcategory = require('../models/subcategoryModel');
const Category = require('../models/categoryModel');

class SubcategoryService {
  // Get all subcategories with filters
  async getSubcategories(filters = {}) {
    const { page = 1, limit = 20, search, category, status } = filters;
    
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

    return {
      subcategories,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    };
  }

  // Get subcategories by category
  async getSubcategoriesByCategory(categoryId) {
    const subcategories = await Subcategory.find({ 
      category: categoryId, 
      isActive: true 
    })
      .populate('category', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    return subcategories;
  }

  // Get single subcategory by ID
  async getSubcategoryById(subcategoryId) {
    const subcategory = await Subcategory.findById(subcategoryId)
      .populate('category', 'name slug description');
    
    if (!subcategory) {
      throw new Error('Subcategory not found');
    }

    return subcategory;
  }

  // Get subcategory by slug
  async getSubcategoryBySlug(categorySlug, subcategorySlug) {
    // First find the category
    const category = await Category.findOne({ slug: categorySlug, isActive: true });
    if (!category) {
      throw new Error('Category not found');
    }

    const subcategory = await Subcategory.findOne({ 
      slug: subcategorySlug,
      category: category._id,
      isActive: true 
    }).populate('category', 'name slug description');
    
    if (!subcategory) {
      throw new Error('Subcategory not found');
    }

    return subcategory;
  }

  // Create new subcategory
  async createSubcategory(subcategoryData) {
    const {
      name,
      description,
      category,
      image,
      sortOrder,
      seoTitle,
      seoDescription
    } = subcategoryData;

    if (!name || !category) {
      throw new Error('Subcategory name and category are required');
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new Error('Category not found');
    }

    // Check if subcategory already exists in this category
    const existingSubcategory = await Subcategory.findOne({ name, category });
    if (existingSubcategory) {
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
    return subcategory;
  }

  // Update subcategory
  async updateSubcategory(subcategoryId, updateData) {
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      throw new Error('Subcategory not found');
    }

    const { name, category } = updateData;

    // Check if category exists (if being changed)
    if (category && category !== subcategory.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
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
        throw new Error('Subcategory with this name already exists in this category');
      }
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'isActive') {
          subcategory[key] = Boolean(updateData[key]);
        } else if (key === 'sortOrder') {
          subcategory[key] = Number(updateData[key]);
        } else {
          subcategory[key] = updateData[key];
        }
      }
    });

    const updatedSubcategory = await subcategory.save();
    await updatedSubcategory.populate('category', 'name slug');
    return updatedSubcategory;
  }

  // Soft delete subcategory
  async deleteSubcategory(subcategoryId) {
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      throw new Error('Subcategory not found');
    }

    // Soft delete - deactivate instead of removing
    subcategory.isActive = false;
    await subcategory.save();

    return { message: 'Subcategory deactivated successfully' };
  }

  // Get subcategory statistics
  async getSubcategoryStats() {
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

    return {
      totalSubcategories,
      activeSubcategories,
      inactiveSubcategories,
      subcategoriesByCategory
    };
  }

  // Bulk subcategory actions
  async bulkSubcategoryAction(action, subcategoryIds) {
    if (!action || !subcategoryIds || !Array.isArray(subcategoryIds)) {
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
        throw new Error('Invalid action');
    }

    return {
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount
    };
  }
}

module.exports = new SubcategoryService();