// Script to add a product with exactly 20% discount for testing
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');

async function add20PercentDiscountProduct() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find Men's category
        const menCategory = await Category.findOne({ 
            $or: [
                { name: { $regex: /men/i } },
                { slug: { $regex: /men/i } }
            ]
        });
        
        if (!menCategory) {
            throw new Error('Men\'s category not found');
        }
        
        console.log('📋 Using category:', menCategory.name);
        
        // Create product with exactly 20% discount
        const productData = {
            name: "Test Product - 20% Discount Verification",
            description: "This product has exactly 20% discount to verify the discount system is working correctly.",
            price: 1000, // Using round number for easy calculation
            category: menCategory._id,
            stock: 25,
            imageUrls: [
                "https://via.placeholder.com/400x500/FF6B6B/FFFFFF?text=20%25+Discount+Test"
            ],
            images: [
                {
                    url: "https://via.placeholder.com/400x500/FF6B6B/FFFFFF?text=20%25+Discount+Test",
                    publicId: "20-percent-test-1",
                    alt: "20% Discount Test Product",
                    isPrimary: true
                }
            ],
            tags: ["men", "test", "20-percent-discount"],
            featured: true,
            isActive: true,
            discount: {
                isOnSale: true,
                percentage: 20, // Exactly 20%
                saleLabel: "20% OFF SALE",
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
        };
        
        console.log('📦 Creating product with 20% discount:', {
            name: productData.name,
            price: productData.price,
            discount: productData.discount
        });
        
        const product = new Product(productData);
        const savedProduct = await product.save();
        
        console.log('✅ Product created successfully!');
        console.log('📋 Product Details:');
        console.log('   ID:', savedProduct._id);
        console.log('   Name:', savedProduct.name);
        console.log('   Original Price: ₹' + savedProduct.price.toLocaleString());
        console.log('   Discount:', savedProduct.discount.percentage + '%');
        console.log('   Sale Price: ₹' + savedProduct.discount.salePrice.toLocaleString());
        console.log('   Expected Sale Price: ₹800 (1000 - 20%)');
        console.log('   Actual matches expected:', savedProduct.discount.salePrice === 800 ? '✅' : '❌');
        console.log('   Savings: ₹' + (savedProduct.price - savedProduct.discount.salePrice).toLocaleString());
        console.log('   Sale Label:', savedProduct.discount.saleLabel);
        console.log('   Is On Sale:', savedProduct.discount.isOnSale);
        
        console.log('\n🎯 Testing URLs:');
        console.log('   Individual Product: product.html?id=' + savedProduct._id);
        console.log('   Men\'s Products: men-product.html');
        console.log('   Discount Page: discount.html');
        
        console.log('\n✅ 20% discount test product created! Check the URLs above.');
        
        return savedProduct;
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the script
add20PercentDiscountProduct()
    .then(() => {
        console.log('🎉 Script completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Script failed:', error.message);
        process.exit(1);
    });