const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce');

// Product schema (simplified)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function checkRecentProducts() {
    try {
        console.log('Checking recent products...');
        
        // Get recent products (created today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const recentProducts = await Product.find({
            createdAt: { $gte: today }
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${recentProducts.length} products created today:`);
        
        for (const product of recentProducts) {
            console.log(`\n📦 Product: ${product.name} (${product._id})`);
            console.log(`   Created: ${product.createdAt}`);
            console.log(`   Images:`, product.images);
            console.log(`   ImageUrls:`, product.imageUrls);
            
            if (product.images && product.images.some(img => img.url === 'has_images')) {
                console.log(`   ❌ Found "has_images" in images array - FIXING...`);
                
                // Fix the product
                product.images = product.images.filter(img => img.url !== 'has_images');
                product.imageUrls = product.imageUrls ? product.imageUrls.filter(url => url !== 'has_images') : [];
                
                await product.save();
                console.log(`   ✅ Fixed!`);
            }
            
            if (product.imageUrls && product.imageUrls.includes('has_images')) {
                console.log(`   ❌ Found "has_images" in imageUrls array - FIXING...`);
                
                // Fix the product
                product.imageUrls = product.imageUrls.filter(url => url !== 'has_images');
                if (product.images) {
                    product.images = product.images.filter(img => img.url !== 'has_images');
                }
                
                await product.save();
                console.log(`   ✅ Fixed!`);
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkRecentProducts();