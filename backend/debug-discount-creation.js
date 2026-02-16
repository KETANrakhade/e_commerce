// Debug script to test discount creation directly with Product model
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');

async function debugDiscountCreation() {
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
        
        // Test 1: Create product with discount data directly
        console.log('\n🧪 Test 1: Creating product with discount data...');
        
        const productData = {
            name: "Direct Model Test - 50% Discount",
            description: "Testing discount creation directly with Product model",
            price: 2000,
            category: menCategory._id,
            stock: 15,
            imageUrls: ["https://via.placeholder.com/400x500/FF6B6B/FFFFFF?text=50%25+Direct+Test"],
            images: [{
                url: "https://via.placeholder.com/400x500/FF6B6B/FFFFFF?text=50%25+Direct+Test",
                publicId: "direct-test-1",
                alt: "Direct Test Product",
                isPrimary: true
            }],
            isActive: true,
            discount: {
                isOnSale: true,
                percentage: 50,
                saleLabel: "DIRECT TEST SALE"
            }
        };
        
        console.log('📦 Product data before creation:', {
            name: productData.name,
            price: productData.price,
            discount: productData.discount
        });
        
        const product = new Product(productData);
        
        console.log('📦 Product discount before save:', product.discount);
        
        const savedProduct = await product.save();
        
        console.log('✅ Product created successfully!');
        console.log('📋 Saved product details:');
        console.log('   ID:', savedProduct._id);
        console.log('   Name:', savedProduct.name);
        console.log('   Price:', savedProduct.price);
        console.log('   Discount:', JSON.stringify(savedProduct.discount, null, 2));
        
        // Test 2: Fetch the product back from database
        console.log('\n🔍 Test 2: Fetching product back from database...');
        
        const fetchedProduct = await Product.findById(savedProduct._id);
        console.log('📦 Fetched product discount:', JSON.stringify(fetchedProduct.discount, null, 2));
        
        // Test 3: Test the pre-save hook logic manually
        console.log('\n🧮 Test 3: Testing pre-save hook logic...');
        
        if (fetchedProduct.discount && fetchedProduct.discount.isOnSale && fetchedProduct.discount.percentage > 0) {
            const expectedSalePrice = Math.round(fetchedProduct.price * (1 - fetchedProduct.discount.percentage / 100));
            console.log('   Expected sale price:', expectedSalePrice);
            console.log('   Actual sale price:', fetchedProduct.discount.salePrice);
            console.log('   Sale price calculation correct:', expectedSalePrice === fetchedProduct.discount.salePrice ? '✅' : '❌');
        } else {
            console.log('   ❌ Discount data is missing or invalid');
        }
        
        // Test 4: Test with productService
        console.log('\n🔧 Test 4: Testing with productService...');
        
        const productService = require('./services/productService');
        
        const serviceProductData = {
            name: "Service Test - 25% Discount",
            description: "Testing discount creation with productService",
            price: 1600,
            category: menCategory._id,
            stock: 12,
            imageUrls: ["https://via.placeholder.com/400x500/FF6B6B/FFFFFF?text=25%25+Service+Test"],
            discount: {
                isOnSale: true,
                percentage: 25,
                saleLabel: "SERVICE TEST SALE"
            }
        };
        
        console.log('📦 Service product data:', {
            name: serviceProductData.name,
            price: serviceProductData.price,
            discount: serviceProductData.discount
        });
        
        const serviceProduct = await productService.createProduct(serviceProductData);
        
        console.log('✅ Service product created!');
        console.log('📋 Service product discount:', JSON.stringify(serviceProduct.discount, null, 2));
        
        return {
            directProduct: savedProduct,
            serviceProduct: serviceProduct
        };
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the script
debugDiscountCreation()
    .then((result) => {
        console.log('\n🎉 Debug completed successfully');
        console.log('📊 Summary:');
        console.log('   Direct model discount working:', result.directProduct.discount.isOnSale ? '✅' : '❌');
        console.log('   Service model discount working:', result.serviceProduct.discount.isOnSale ? '✅' : '❌');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Debug failed:', error.message);
        process.exit(1);
    });