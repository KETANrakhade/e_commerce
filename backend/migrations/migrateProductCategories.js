const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');
require('dotenv').config();

// Migration script to update existing products with new category/brand references
const migrateProductCategories = async () => {
  try {
    console.log('🔄 Starting Product Category/Brand Migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        let updated = false;

        // Migrate category if it's a string
        if (product.category && typeof product.category === 'string') {
          // Store original category name for backward compatibility
          product.categoryName = product.category;

          // Find or create category
          let category = await Category.findOne({ name: product.category });
          if (!category) {
            console.log(`📁 Creating new category: ${product.category}`);
            category = await Category.create({
              name: product.category,
              description: `Auto-created category for ${product.category}`,
              isActive: true
            });
          }

          // Update product with category ObjectId
          product.category = category._id;
          updated = true;
        }

        // Migrate brand if it's a string
        if (product.brand && typeof product.brand === 'string') {
          // Store original brand name for backward compatibility
          product.brandName = product.brand;

          // Find or create brand
          let brand = await Brand.findOne({ name: product.brand });
          if (!brand) {
            console.log(`🏢 Creating new brand: ${product.brand}`);
            brand = await Brand.create({
              name: product.brand,
              description: `Auto-created brand for ${product.brand}`,
              isActive: true
            });
          }

          // Update product with brand ObjectId
          product.brand = brand._id;
          updated = true;
        }

        // Save if updated
        if (updated) {
          await product.save();
          migratedCount++;
          console.log(`✅ Migrated product: ${product.name}`);
        }

      } catch (error) {
        console.error(`❌ Error migrating product ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📦 Total processed: ${products.length} products`);

    // Update product counts in categories and brands
    console.log('\n🔄 Updating product counts...');
    
    const categories = await Category.find();
    for (const category of categories) {
      const productCount = await Product.countDocuments({ 
        category: category._id, 
        isActive: true 
      });
      category.productCount = productCount;
      await category.save();
    }

    const brands = await Brand.find();
    for (const brand of brands) {
      const productCount = await Product.countDocuments({ 
        brand: brand._id, 
        isActive: true 
      });
      brand.productCount = productCount;
      await brand.save();
    }

    console.log('✅ Product counts updated');
    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Database connection closed');
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateProductCategories();
}

module.exports = migrateProductCategories;