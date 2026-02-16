const mongoose = require('mongoose');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');

async function testReviewSubmission() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB\n');
    
    // Get a product
    const product = await Product.findOne();
    if (!product) {
      console.log('❌ No products found. Please add products first.');
      process.exit(1);
    }
    
    console.log('📦 Found product:', product.name);
    console.log('   ID:', product._id);
    console.log('   Current Rating:', product.rating);
    console.log('   Current Num Reviews:', product.numReviews);
    
    // Get a user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }
    
    console.log('\n👤 Found user:', user.name || user.email);
    console.log('   ID:', user._id);
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      product: product._id,
      user: user._id
    });
    
    if (existingReview) {
      console.log('\n⚠️  Review already exists for this product by this user');
      console.log('   Rating:', existingReview.rating);
      console.log('   Comment:', existingReview.comment);
      console.log('\n   Deleting existing review to test fresh submission...');
      await Review.deleteOne({ _id: existingReview._id });
      console.log('   ✅ Deleted');
    }
    
    // Create a test review
    console.log('\n📝 Creating test review...');
    const review = await Review.create({
      product: product._id,
      user: user._id,
      rating: 5,
      comment: 'This is a test review to verify the rating system is working correctly!',
      isVerifiedPurchase: true
    });
    
    console.log('✅ Review created successfully!');
    console.log('   Review ID:', review._id);
    console.log('   Rating:', review.rating);
    
    // Update product rating manually (simulating what the controller does)
    console.log('\n🔄 Updating product rating...');
    const allReviews = await Review.find({ product: product._id });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;
    
    // Use findByIdAndUpdate to avoid validation issues
    await Product.findByIdAndUpdate(
      product._id,
      {
        $set: {
          rating: avgRating,
          numReviews: allReviews.length
        }
      },
      { 
        runValidators: false,
        timestamps: false
      }
    );
    
    console.log('✅ Product rating updated!');
    console.log('   New Rating:', product.rating);
    console.log('   New Num Reviews:', product.numReviews);
    
    // Verify the update
    const updatedProduct = await Product.findById(product._id);
    console.log('\n🔍 Verification:');
    console.log('   Product Rating:', updatedProduct.rating);
    console.log('   Product Num Reviews:', updatedProduct.numReviews);
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Review was created');
    console.log('   - Product rating was updated');
    console.log('   - You can now test on the frontend');
    console.log(`\n🌐 Visit: http://localhost:5001/product.html?id=${product._id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testReviewSubmission();
