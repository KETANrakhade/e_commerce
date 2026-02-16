// Quick script to check cart vs available products
const API_BASE_URL = 'http://localhost:5001/api';

async function checkCartProducts() {
    console.log('🔍 Checking cart vs available products...');
    
    // Get cart from localStorage (simulate browser environment)
    const cartData = `[{"_id":"696f4e1fb5b780bba10f4974","id":"696f4e1fb5b780bba10f4974","name":"Slim Fit Cargo trousers","price":2999,"image":"uploads/products/color_variant_1768902175_3402.jpg","quantity":1}]`;
    
    console.log('📦 Cart data:', cartData);
    
    try {
        const cart = JSON.parse(cartData);
        console.log('🛒 Parsed cart:', cart);
        
        // Get available products
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        if (!data.success) {
            console.error('❌ Failed to load products:', data.error);
            return;
        }
        
        const products = data.data.products;
        const productIds = products.map(p => p._id);
        
        console.log('📊 Available products:', products.length);
        console.log('🆔 First 5 product IDs:', productIds.slice(0, 5));
        
        // Check each cart item
        cart.forEach((item, index) => {
            const cartProductId = item._id || item.id || item.product || item.productId;
            const isValid = productIds.includes(cartProductId);
            
            console.log(`\n🔍 Cart Item ${index + 1}:`);
            console.log(`   Name: ${item.name}`);
            console.log(`   Cart ID: "${cartProductId}"`);
            console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
            
            if (!isValid) {
                console.log('   🔍 Looking for similar IDs...');
                const similarIds = productIds.filter(id => id.includes(cartProductId.substring(0, 10)));
                if (similarIds.length > 0) {
                    console.log('   🎯 Similar IDs found:', similarIds);
                } else {
                    console.log('   ❌ No similar IDs found');
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// For Node.js environment
if (typeof fetch === 'undefined') {
    const fetch = require('node-fetch');
    global.fetch = fetch;
}

checkCartProducts();