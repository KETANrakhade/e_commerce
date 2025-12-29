// Quick test to see what products are in the database
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce');

// Category Schema
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  isActive: Boolean
}, { timestamps: true });

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isActive: Boolean
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

async function testProducts() {
  try {
    console.log('🔍 Testing products in database...');
    
    // Get all products with category populated
    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .limit(10);
    
    console.log(`📊 Found ${products.length} active products:`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}"`);
      console.log(`   Category: ${product.category?.name || 'No category'} (ID: ${product.category?._id || 'N/A'})`);
      console.log(`   Slug: ${product.category?.slug || 'N/A'}`);
      console.log('');
    });
    
    // Test API endpoints
    console.log('🔍 Testing API endpoints...');
    
    const testCategories = ['men', 'male', 'women', 'female'];
    
    for (const category of testCategories) {
      try {
        const response = await fetch(`http://localhost:5001/api/products/category/${category}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ /api/products/category/${category} - Found ${data.data?.products?.length || 0} products`);
        } else {
          console.log(`❌ /api/products/category/${category} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ /api/products/category/${category} - Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testProducts();