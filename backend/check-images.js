const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce');

// Product schema (simplified)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function checkImages() {
    try {
        console.log('Checking all products for image issues...');
        
        // Get all products
        const products = await Product.find({}).limit(10);
        
        console.log(`Checking ${products.length} products:`);
        
        for (const product of products) {
            console.log(`\n📦 Product: ${product.name}`);
            console.log(`   Images:`, product.images);
            console.log(`   ImageUrls:`, product.imageUrls);
            
            if (product.images && product.images.some(img => img.url === 'has_images')) {
                console.log(`   ❌ Found "has_images" in images array`);
            }
            if (product.imageUrls && product.imageUrls.includes('has_images')) {
                console.log(`   ❌ Found "has_images" in imageUrls array`);
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkImages();