const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Review = require('./models/reviewModel');
const User = require('./models/userModel');

async function checkRatings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB\n');
    
    // Get all reviews
    const allReviews = await Review.find().populate('product', 'name rating numReviews').populate('user', 'name');
    
    if (allReviews.length === 0) {
      console.log('❌ No reviews found in database');
      process.exit(0);
    }
    
    console.log(`📝 Found ${allReviews.length} reviews in database\n`);
    
    // Group reviews by product
    const reviewsByProduct = {};
    allReviews.forEach(review => {
      const productId = review.product._id.toString();
      if (!reviewsByProduct[productId]) {
        reviewsByProduct[productId] = {
          product: review.product,
          reviews: []
        };
      }
      reviewsByProduct[productId].reviews.push(review);
    });
    
    // Display each product with its reviews
    for (const productId in reviewsByProduct) {
      const { product, reviews } = reviewsByProduct[productId];
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📦 Product: ${product.name}`);
      console.log(`   ID: ${productId}`);
      console.log(`   ⭐ Stored Rating: ${product.rating}`);
      console.log(`   📊 Stored Num Reviews: ${product.numReviews}`);
      console.log(`\n   📝 Actual Reviews (${reviews.length}):`);
      
      let totalRating = 0;
      reviews.forEach((review, i) => {
        console.log(`      ${i + 1}. ${review.rating}★ by ${review.user?.name || 'Unknown'}`);
        console.log(`         "${review.comment.substring(0, 60)}..."`);
        totalRating += review.rating;
      });
      
      const calculatedAvg = (totalRating / reviews.length).toFixed(2);
      console.log(`\n   🧮 Calculated Average: ${calculatedAvg}`);
      
      if (product.rating !== parseFloat(calculatedAvg)) {
        console.log(`   ⚠️  MISMATCH! Stored rating (${product.rating}) doesn't match calculated (${calculatedAvg})`);
      } else {
        console.log(`   ✅ Rating is correct!`);
      }
      console.log('');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkRatings();
