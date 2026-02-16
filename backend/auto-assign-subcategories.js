require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Subcategory = require('./models/subcategoryModel');
const Category = require('./models/categoryModel');

// Function to determine subcategory based on product name
function guessSubcategory(productName) {
    const name = productName.toLowerCase();
    
    // Shirts (but not T-Shirts)
    if ((name.includes('shirt') || name.includes('button') || name.includes('dress shirt') || name.includes('formal')) 
        && !name.includes('t-shirt') && !name.includes('tshirt') && !name.includes('tee')) {
        return 'shirts';
    }
    
    // T-Shirts
    if (name.includes('t-shirt') || name.includes('tshirt') || name.includes('tee') || name.includes('polo')) {
        return 't-shirts';
    }
    
    // Jackets
    if (name.includes('jacket') || name.includes('coat') || name.includes('blazer') || name.includes('hoodie') || name.includes('sweater') || name.includes('cardigan')) {
        return 'jackets';
    }
    
    // Jeans
    if (name.includes('jean') || name.includes('denim') || name.includes('trouser') || name.includes('pant') || name.includes('cargo')) {
        return 'jeans';
    }
    
    // Accessories
    if (name.includes('accessor') || name.includes('belt') || name.includes('wallet') || name.includes('bag') || name.includes('watch') || name.includes('cap') || name.includes('hat')) {
        return 'accessories';
    }
    
    return null;
}

mongoose.connect(process.env.MONGO_URI)
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
    
    // Get all subcategories for Men
    const subcategories = await Subcategory.find({ category: menCategory._id });
    const subcategoryMap = {};
    subcategories.forEach(sub => {
      subcategoryMap[sub.slug] = sub._id;
    });
    
    console.log('📦 Available Subcategories:');
    subcategories.forEach(sub => {
      console.log(`   - ${sub.name} (${sub.slug})`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Find products without subcategory
    const productsWithoutSubcategory = await Product.find({ 
      category: menCategory._id,
      $or: [
        { subcategory: null },
        { subcategory: { $exists: false } }
      ]
    });
    
    console.log(`🔍 Found ${productsWithoutSubcategory.length} products without subcategory\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const product of productsWithoutSubcategory) {
      const guessedSlug = guessSubcategory(product.name);
      
      if (guessedSlug && subcategoryMap[guessedSlug]) {
        product.subcategory = subcategoryMap[guessedSlug];
        await product.save();
        console.log(`✅ Updated: "${product.name}" → ${guessedSlug}`);
        updatedCount++;
      } else {
        console.log(`⚠️  Skipped: "${product.name}" (couldn't determine subcategory)`);
        skippedCount++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} products`);
    console.log(`   ⚠️  Skipped: ${skippedCount} products`);
    console.log(`   📦 Total: ${productsWithoutSubcategory.length} products\n`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
