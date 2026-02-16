// Direct database script to add a product with discount
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');

async function addDiscountProductDirect() {
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
        
        // Create product with discount
        const productData = {
            name: "Premium Cotton Shirt - Discount Test",
            description: "A premium cotton shirt with 35% discount to test the discount system functionality. This product should appear on the discount page and show proper pricing.",
            price: 2200,
            category: menCategory._id,
            stock: 20,
            imageUrls: [
                "https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=Discount+Test+Shirt",
                "https://via.placeholder.com/400x500/5F9FB6/FFFFFF?text=Back+View"
            ],
            images: [
                {
                    url: "https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=Discount+Test+Shirt",
                    publicId: "discount-test-1",
                    alt: "Discount Test Shirt - Front View",
                    isPrimary: true
                },
                {
                    url: "https://via.placeholder.com/400x500/5F9FB6/FFFFFF?text=Back+View",
                    publicId: "discount-test-2", 
                    alt: "Discount Test Shirt - Back View",
                    isPrimary: false
                }
            ],
            tags: ["men", "shirt", "cotton", "premium", "discount-test"],
            featured: true,
            isActive: true,
            discount: {
                isOnSale: true,
                percentage: 35,
                salePrice: Math.round(2200 * (1 - 35/100)), // Will be recalculated by pre-save hook
                saleLabel: "MEGA SALE",
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
        };
        
        console.log('📦 Creating product with discount:', {
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
        console.log('   Savings: ₹' + (savedProduct.price - savedProduct.discount.salePrice).toLocaleString());
        console.log('   Sale Label:', savedProduct.discount.saleLabel);
        console.log('   Is On Sale:', savedProduct.discount.isOnSale);
        
        console.log('\n🎯 Testing URLs:');
        console.log('   Individual Product: product.html?id=' + savedProduct._id);
        console.log('   Men\'s Products: men-product.html');
        console.log('   Discount Page: discount.html');
        
        console.log('\n✅ Test product added successfully! The discount system should now work end-to-end.');
        
        // Verify the product can be found in discount queries
        const discountProducts = await Product.find({
            'discount.isOnSale': true,
            'discount.percentage': { $gt: 0 },
            isActive: true
        });
        
        console.log('\n🔍 Verification:');
        console.log('   Total products with discounts:', discountProducts.length);
        console.log('   Our test product found:', discountProducts.some(p => p._id.toString() === savedProduct._id.toString()) ? '✅' : '❌');
        
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
addDiscountProductDirect()
    .then(() => {
        console.log('🎉 Script completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Script failed:', error.message);
        process.exit(1);
    });