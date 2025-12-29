const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce');

const Category = require('./models/categoryModel');

async function testCategory() {
  try {
    console.log('🔄 Testing category lookup...');
    
    const testId = '69200e0257911091d8adb443'; // Male category ID from earlier
    
    console.log(`Testing ID: ${testId}`);
    console.log(`Is valid ObjectId: ${mongoose.Types.ObjectId.isValid(testId)}`);
    
    // Test findById
    const category = await Category.findById(testId);
    console.log('Category found:', category ? {
      id: category._id,
      name: category.name,
      slug: category.slug,
      isActive: category.isActive
    } : 'NOT FOUND');
    
    // List all categories
    console.log('\n📋 All categories:');
    const allCategories = await Category.find();
    allCategories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id}, Active: ${cat.isActive})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCategory();