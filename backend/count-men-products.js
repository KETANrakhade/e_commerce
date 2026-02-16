require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Find Men category
    const menCategory = await Category.findOne({ name: 'Men' });
    if (!menCategory) {
      console.log('❌ Men category not found');
      process.exit(0);
    }
    
    // Count all products
    const totalProducts = await Product.countDocuments({ category: menCategory._id });
    const activeProducts = await Product.countDocuments({ category: menCategory._id, isActive: true });
    const inactiveProducts = await Product.countDocuments({ category: menCategory._id, isActive: false });
    
    console.log('📊 Men Products Count:');
    console.log(`   Total: ${totalProducts}`);
    console.log(`   Active: ${activeProducts}`);
    console.log(`   Inactive: ${inactiveProducts}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
