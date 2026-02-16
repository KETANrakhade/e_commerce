const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Review = require('./models/reviewModel');
const User = require('./models/userModel');

async function checkAllReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB\n');
    
    // Get all reviews
    const allReviews = await Review.find()
      .populate('product', 'name rating numReviews')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`📝 Total Reviews in Database: ${allReviews.length}\n`);
    
    if (allReviews.length === 0) {
      console.log('❌ No reviews found!');
      console.log('\nPossible reasons:');
      console.log('1. Reviews were not saved to database');
      console.log('2. Review submission failed silently');
      console.log('3. Database connection issue');
      process.exit(0);
    }
    
    // Display all reviews
    allReviews.forEach((review, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Review #${index + 1}`);
      console.log(`   Product: ${review.product?.name || 'Unknown'}`);
      console.log(`   Product ID: ${review.product?._id || 'Unknown'}`);
      console.log(`   Rating: ${review.rating}★`);
      console.log(`   Comment: "${review.comment.substring(0, 80)}..."`);
      console.log(`   By: ${review.user?.name || review.user?.email || 'Unknown'}`);
      console.log(`   Verified Purchase: ${review.isVerifiedPurchase ? 'Yes ✓' : 'No'}`);
      console.log(`   Created: ${new Date(review.createdAt).toLocaleString()}`);
      console.log(`   Product Rating: ${review.product?.rating || 0}`);
      console.log(`   Product Num Reviews: ${review.product?.numReviews || 0}`);
    });
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Get all products with reviews
    const productsWithReviews = await Product.find({ numReviews: { $gt: 0 } })
      .select('name rating numReviews')
      .sort({ numReviews: -1 });
    
    console.log(`📦 Products with Reviews: ${productsWithReviews.length}\n`);
    
    productsWithReviews.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Rating: ${product.rating.toFixed(2)}★`);
      console.log(`   Reviews: ${product.numReviews}`);
      console.log(`   ID: ${product._id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkAllReviews();
