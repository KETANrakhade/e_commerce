#!/usr/bin/env node

const axios = require('axios');

// Sample product data
const sampleProduct = {
  name: "Premium Cotton T-Shirt",
  description: "High-quality cotton t-shirt with comfortable fit. Perfect for casual wear. Made from 100% organic cotton with a modern cut.",
  price: 29.99,
  category: "Men",
  stock: 50,
  brand: "Pyramid Fashion",
  images: [
    "https://via.placeholder.com/400x400/007bff/ffffff?text=T-Shirt+Front",
    "https://via.placeholder.com/400x400/28a745/ffffff?text=T-Shirt+Back"
  ],
  featured: true,
  tags: ["cotton", "casual", "comfortable", "organic"],
  seoTitle: "Premium Cotton T-Shirt - Comfortable & Stylish",
  seoDescription: "Shop our premium cotton t-shirt made from 100% organic cotton. Perfect for casual wear with modern fit and superior comfort."
};

async function addSampleProduct() {
  try {
    console.log('🛍️ Adding Sample Product to Your Store');
    console.log('=====================================');
    
    // First, let's check if the backend is running
    console.log('🔍 Checking backend connection...');
    
    try {
      await axios.get('http://localhost:5000/api/products');
      console.log('✅ Backend is running');
    } catch (error) {
      console.log('❌ Backend not running. Please start it first:');
      console.log('   cd backend && node server.js');
      return;
    }
    
    // Try to create admin user first (in case it doesn't exist)
    console.log('👤 Ensuring admin user exists...');
    try {
      const { spawn } = require('child_process');
      const createAdmin = spawn('node', ['createAdminSimple.js'], { cwd: 'backend' });
      
      await new Promise((resolve) => {
        createAdmin.on('close', () => resolve());
      });
      
      console.log('✅ Admin user ready');
    } catch (error) {
      console.log('⚠️  Admin user creation skipped');
    }
    
    // Login as admin to get token
    console.log('🔐 Logging in as admin...');
    
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Add the sample product
    console.log('📦 Adding sample product...');
    
    const productResponse = await axios.post(
      'http://localhost:5000/api/admin/products',
      sampleProduct,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (productResponse.data.success) {
      console.log('✅ Sample product added successfully!');
      console.log('');
      console.log('📋 Product Details:');
      console.log(`   Name: ${sampleProduct.name}`);
      console.log(`   Price: ₹${sampleProduct.price}`);
      console.log(`   Category: ${sampleProduct.category}`);
      console.log(`   Stock: ${sampleProduct.stock}`);
      console.log(`   Featured: ${sampleProduct.featured ? 'Yes' : 'No'}`);
      console.log('');
      console.log('🌐 View in admin panel:');
      console.log('   http://localhost:8080/login.php');
      console.log('');
      console.log('🔑 Login with:');
      console.log('   Email: admin@admin.com');
      console.log('   Password: admin123');
    } else {
      throw new Error('Failed to create product');
    }
    
  } catch (error) {
    console.log('❌ Error adding sample product:');
    console.log(`   ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    console.log('');
    console.log('🛠️ Troubleshooting:');
    console.log('   1. Make sure backend is running: cd backend && node server.js');
    console.log('   2. Make sure MongoDB is running: brew services start mongodb-community@6.0');
    console.log('   3. Create admin user: cd backend && node createAdminSimple.js');
  }
}

// Run the script
addSampleProduct();