require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Subcategory = require('./backend/models/subcategoryModel');
const Category = require('./backend/models/categoryModel');
const Product = require('./backend/models/productModel');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Find Men category
    const menCategory = await Category.findOne({ name: 'Men' });
    if (!menCategory) {
      console.log('❌ Men category not found');
      process.exit(0);
    }
    
    console.log('📁 Men Category ID:', menCategory._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Find all subcategories for Men
    const subcategories = await Subcategory.find({ category: menCategory._id });
    
    console.log('📦 Subcategories for Men:');
    console.log('Total:', subcategories.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (subcategories.length === 0) {
      console.log('⚠️  No subcategories found for Men category!\n');
    } else {
      for (const sub of subcategories) {
        const productCount = await Product.countDocuments({ 
          category: menCategory._id, 
          subcategory: sub._id 
        });
        console.log(`📌 Name: ${sub.name}`);
        console.log(`   Slug: ${sub.slug}`);
        console.log(`   Active: ${sub.isActive ? '✅' : '❌'}`);
        console.log(`   Products: ${productCount}`);
        console.log('');
      }
    }
    
    // Also check products without subcategory
    const productsWithoutSubcategory = await Product.countDocuments({ 
      category: menCategory._id,
      $or: [
        { subcategory: null },
        { subcategory: { $exists: false } }
      ]
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⚠️  Products without subcategory: ${productsWithoutSubcategory}`);
    
    // Sample a few products to see their subcategory data
    console.log('\n📋 Sample Men Products (first 5):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const sampleProducts = await Product.find({ category: menCategory._id })
      .populate('subcategory')
      .limit(5);
    
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Subcategory: ${product.subcategory ? product.subcategory.name + ' (' + product.subcategory.slug + ')' : 'NONE'}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
