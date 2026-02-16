const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce');

// Define product schema (simplified)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function addSampleDiscounts() {
  try {
    console.log('🔍 Fetching products...');
    
    // Get all products
    const products = await Product.find({ isActive: true }).limit(20);
    console.log(`📦 Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('❌ No products found');
      process.exit(1);
    }
    
    // Add discounts to every 4th product
    const discountPercentages = [20, 30, 40, 50, 60, 70];
    const saleLabels = ['SALE', 'MEGA SALE', 'FLASH SALE', 'CLEARANCE', 'SUPER SALE'];
    
    let updatedCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      // Every 4th product gets a discount
      if ((i + 1) % 4 === 0) {
        const product = products[i];
        const randomDiscount = discountPercentages[Math.floor(Math.random() * discountPercentages.length)];
        const randomLabel = saleLabels[Math.floor(Math.random() * saleLabels.length)];
        const salePrice = Math.round(product.price * (1 - randomDiscount / 100));
        
        const discountData = {
          isOnSale: true,
          percentage: randomDiscount,
          salePrice: salePrice,
          saleLabel: randomLabel,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        };
        
        await Product.findByIdAndUpdate(
          product._id,
          { $set: { discount: discountData } },
          { new: true }
        );
        
        console.log(`✅ Added ${randomDiscount}% discount to "${product.name}" (₹${product.price} → ₹${salePrice})`);
        updatedCount++;
      }
    }
    
    console.log(`🎯 Successfully added discounts to ${updatedCount} products`);
    console.log('🚀 You can now test the discount functionality!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding discounts:', error);
    process.exit(1);
  }
}

// Run the script
addSampleDiscounts();