const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pyramid-ecommerce');

const Product = require('./models/productModel');

async function updateJacketTrending() {
  try {
    console.log('🔍 Searching for jacket products...');
    
    // Find all jacket products
    const jackets = await Product.find({ 
      name: { $regex: /jacket/i } 
    });
    
    if (jackets.length === 0) {
      console.log('❌ No jacket products found');
      return;
    }
    
    console.log(`✅ Found ${jackets.length} jacket product(s):`);
    
    for (const jacket of jackets) {
      console.log(`\n📦 Product: ${jacket.name}`);
      console.log(`   Current trending status: ${jacket.trending}`);
      
      // Update trending to true
      jacket.trending = true;
      await jacket.save();
      
      console.log(`   ✅ Updated trending status to: ${jacket.trending}`);
    }
    
    console.log('\n🎉 All jackets are now marked as trending!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

updateJacketTrending();
