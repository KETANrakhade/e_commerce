const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pyramid-ecommerce');

// Product schema (simplified)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function checkDiscountProducts() {
    try {
        console.log('🔍 Checking for products with discounts...');
        
        // Get products with discounts
        const discountedProducts = await Product.find({
            'discount.isOnSale': true,
            'discount.percentage': { $gt: 0 }
        }).select('name price discount createdAt').sort({ createdAt: -1 }).limit(10);
        
        console.log(`📦 Found ${discountedProducts.length} products with discounts:`);
        
        if (discountedProducts.length === 0) {
            console.log('⚠️ No products with discounts found in database');
            
            // Check all products to see their discount structure
            console.log('\n🔍 Checking all products for discount structure...');
            const allProducts = await Product.find({}).select('name price discount').limit(5);
            
            allProducts.forEach(product => {
                console.log(`\n📦 ${product.name}:`);
                console.log(`   Price: ${product.price}`);
                console.log(`   Discount:`, product.discount);
            });
        } else {
            discountedProducts.forEach(product => {
                console.log(`\n✅ ${product.name}:`);
                console.log(`   Original Price: ₹${product.price}`);
                console.log(`   Discount: ${product.discount.percentage}%`);
                console.log(`   Sale Price: ₹${product.discount.salePrice}`);
                console.log(`   Created: ${product.createdAt}`);
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDiscountProducts();