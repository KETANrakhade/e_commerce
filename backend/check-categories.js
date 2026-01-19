const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');

async function checkCategories() {
  try {
    console.log('🔍 Checking Categories...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce');
    console.log('✅ MongoDB connected successfully!\n');
    
    // Check Categories
    console.log('📁 CATEGORIES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const categories = await Category.find({});
    console.log(`📊 Total Categories: ${categories.length}`);
    
    if (categories.length > 0) {
      categories.forEach(cat => {
        console.log(`- ID: ${cat._id} | Name: ${cat.name} | Active: ${cat.isActive ? '✅' : '❌'}`);
      });
      
      // Check products by category
      console.log('\n📦 PRODUCTS BY CATEGORY:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      for (const category of categories) {
        const productCount = await Product.countDocuments({ category: category._id });
        console.log(`${category.name}: ${productCount} products`);
      }
    } else {
      console.log('⚠️  NO CATEGORIES FOUND!');
      console.log('💡 You need to create categories first');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Database connection closed');
  }
}

checkCategories();