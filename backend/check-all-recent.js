const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce');

// Product schema (simplified)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function checkAllRecent() {
    try {
        console.log('Checking all recent products...');
        
        // Get products from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const recentProducts = await Product.find({
            createdAt: { $gte: weekAgo }
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${recentProducts.length} products from last 7 days:`);
        
        let fixedCount = 0;
        
        for (const product of recentProducts) {
            console.log(`\n📦 Product: ${product.name} (${product._id})`);
            console.log(`   Created: ${product.createdAt}`);
            console.log(`   Images:`, JSON.stringify(product.images, null, 2));
            console.log(`   ImageUrls:`, product.imageUrls);
            
            let needsFix = false;
            
            if (product.images && product.images.some(img => img.url === 'has_images')) {
                console.log(`   ❌ Found "has_images" in images array`);
                needsFix = true;
            }
            
            if (product.imageUrls && product.imageUrls.includes('has_images')) {
                console.log(`   ❌ Found "has_images" in imageUrls array`);
                needsFix = true;
            }
            
            if (needsFix) {
                console.log(`   🔧 FIXING...`);
                
                // Fix the product
                if (product.images) {
                    product.images = product.images.filter(img => img.url !== 'has_images');
                }
                if (product.imageUrls) {
                    product.imageUrls = product.imageUrls.filter(url => url !== 'has_images');
                }
                
                await product.save();
                fixedCount++;
                console.log(`   ✅ Fixed!`);
            }
        }
        
        console.log(`\n🎉 Fixed ${fixedCount} products with broken images`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAllRecent();