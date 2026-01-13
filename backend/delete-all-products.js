// Script to delete all products from the database
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001/api';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTQxYWQ0YzYxMmJiN2NlMDZlMjMxNyIsImlhdCI6MTc2ODIwMzkwNSwiZXhwIjoxNzcwNzk1OTA1fQ.0KwfDrXEAJMl-YlxupyK1vbrKl-hkO3--oV0OScR5ck';

async function getAllProducts() {
    try {
        const response = await fetch(`${API_BASE}/admin/products?limit=100`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.products) {
            return data.data.products;
        } else {
            console.error('Failed to fetch products:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function deleteProduct(productId, productName) {
    try {
        const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Deleted: ${productName} (ID: ${productId})`);
            return true;
        } else {
            console.error(`❌ Failed to delete ${productName}:`, data.message || data.error);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error deleting ${productName}:`, error.message);
        return false;
    }
}

async function deleteAllProducts() {
    console.log('🗑️  Starting bulk product deletion...\n');
    
    // Get all products
    const products = await getAllProducts();
    
    if (products.length === 0) {
        console.log('No products found to delete.');
        return;
    }
    
    console.log(`Found ${products.length} products to delete:\n`);
    
    // Show products that will be deleted
    products.forEach((product, index) => {
        const categoryName = product.category?.name || 'Unknown';
        console.log(`${index + 1}. ${product.name} (${categoryName})`);
    });
    
    console.log('\n🚨 WARNING: This will PERMANENTLY delete all products from the database!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    // 5 second delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Starting deletion...\n');
    
    let deletedCount = 0;
    let failedCount = 0;
    
    // Delete products one by one
    for (const product of products) {
        const success = await deleteProduct(product._id, product.name);
        if (success) {
            deletedCount++;
        } else {
            failedCount++;
        }
        
        // Small delay between deletions
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Deletion Summary:');
    console.log(`✅ Successfully deleted: ${deletedCount} products`);
    console.log(`❌ Failed to delete: ${failedCount} products`);
    console.log(`📦 Total processed: ${products.length} products`);
    
    if (deletedCount > 0) {
        console.log('\n🎉 All products have been permanently deleted from the database!');
    }
}

// Run the deletion
deleteAllProducts().catch(console.error);