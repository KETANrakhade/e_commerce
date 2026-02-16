// Test the admin API directly by calling the controller function
require('dotenv').config();
const mongoose = require('mongoose');

async function testAdminApiDirect() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Import the controller
        const { createProduct } = require('./controllers/productController');
        
        // Mock request and response objects
        const mockReq = {
            body: {
                name: "Direct Controller Test - 55% Discount",
                description: "Testing controller directly",
                price: 2200,
                category: "69209ef3499994abc1a16ce9",
                stock: 8,
                imageUrls: ["https://via.placeholder.com/400x500/FF6B6B/FFFFFF?text=55%25+Direct"],
                discount: {
                    isOnSale: true,
                    percentage: 55,
                    saleLabel: "DIRECT CONTROLLER SALE"
                }
            }
        };
        
        const mockRes = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                this.responseData = data;
                return this;
            }
        };
        
        console.log('📦 Mock request body:', JSON.stringify(mockReq.body, null, 2));
        
        // Call the controller function directly
        await createProduct(mockReq, mockRes);
        
        console.log('✅ Controller executed successfully!');
        console.log('📊 Response status:', mockRes.statusCode);
        console.log('📦 Response data:', JSON.stringify(mockRes.responseData, null, 2));
        
        if (mockRes.responseData && mockRes.responseData.data && mockRes.responseData.data.discount) {
            const discount = mockRes.responseData.data.discount;
            console.log('\n🔍 Discount Analysis:');
            console.log('   isOnSale:', discount.isOnSale);
            console.log('   percentage:', discount.percentage);
            console.log('   salePrice:', discount.salePrice);
            console.log('   saleLabel:', discount.saleLabel);
            
            if (discount.isOnSale && discount.percentage === 55) {
                console.log('✅ Discount data is correct!');
            } else {
                console.log('❌ Discount data is incorrect!');
            }
        } else {
            console.log('❌ No discount data in response');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testAdminApiDirect()
    .then(() => {
        console.log('🎉 Direct controller test completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Direct controller test failed:', error.message);
        process.exit(1);
    });