#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

async function loginAsAdmin() {
  try {
    console.log(`   Attempting login with: ${ADMIN_EMAIL}`);
    const response = await axios.post(`${API_BASE}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (response.data && response.data.success) {
      const token = response.data.data?.token || response.data.token;
      if (token) {
        return token;
      }
    }
    
    throw new Error(`Login failed: ${JSON.stringify(response.data)}`);
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      throw new Error(`Login failed (${status}): ${data.message || data.error || error.response.statusText}`);
    }
    throw error;
  }
}

async function clearAllProducts() {
  console.log('🗑️  Clearing All Products');
  console.log('========================\n');
  
  try {
    // Login as admin
    console.log('🔐 Logging in as admin...');
    const token = await loginAsAdmin();
    console.log('✅ Admin login successful\n');
    
    // Get all products
    console.log('📦 Getting all products...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    const responseData = productsResponse.data.data || productsResponse.data;
    const products = responseData.products || responseData;
    
    if (!products || products.length === 0) {
      console.log('✅ No products found to delete');
      return;
    }
    
    console.log(`Found ${products.length} products to delete\n`);
    
    let deletedCount = 0;
    let failedCount = 0;
    
    // Delete each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        await axios.delete(`${API_BASE}/admin/products/${product._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`✅ [${i + 1}/${products.length}] Deleted: ${product.name}`);
        deletedCount++;
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`❌ [${i + 1}/${products.length}] Failed to delete: ${product.name} - ${error.message}`);
        failedCount++;
      }
    }
    
    console.log('\n========================');
    console.log('📊 Summary:');
    console.log(`   ✅ Deleted: ${deletedCount} products`);
    console.log(`   ❌ Failed: ${failedCount} products`);
    console.log(`   📦 Total: ${deletedCount + failedCount} products`);
    
  } catch (error) {
    console.log('\n❌ Error:');
    console.log(`   ${error.message}`);
  }
}

// Run the script
clearAllProducts();