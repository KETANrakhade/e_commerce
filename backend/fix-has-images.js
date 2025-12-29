const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce');

// Product schema (simplified)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function fixHasImagesIssue() {
    try {
        console.log('Fixing products with "has_images" issue...');
        
        // Find products with "has_images" in their image URLs
        const brokenProducts = await Product.find({
            $or: [
                { 'images.url': 'has_images' },
                { 'imageUrls': 'has_images' },
                { 'imageUrls': { $in: ['has_images'] } }
            ]
        });
        
        console.log(`Found ${brokenProducts.length} products with broken image paths`);
        
        for (const product of brokenProducts) {
            console.log(`Fixing product: ${product.name} (${product._id})`);
            
            // Remove broken image entries
            if (product.images) {
                product.images = product.images.filter(img => 
                    img.url !== 'has_images' && img.url !== ''
                );
            }
            
            if (product.imageUrls) {
                product.imageUrls = product.imageUrls.filter(url => 
                    url !== 'has_images' && url !== ''
                );
            }
            
            // If no valid images remain, set empty arrays
            if (!product.images || product.images.length === 0) {
                product.images = [];
            }
            if (!product.imageUrls || product.imageUrls.length === 0) {
                product.imageUrls = [];
            }
            
            await product.save();
            console.log(`✅ Fixed product: ${product.name}`);
        }
        
        console.log('✅ Finished fixing broken image paths');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing broken images:', error);
        process.exit(1);
    }
}

fixHasImagesIssue();