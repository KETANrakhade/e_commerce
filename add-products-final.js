#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

async function loginAsAdmin() {
  const response = await axios.post(`${API_BASE}/admin/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  return response.data.data?.token || response.data.token;
}

async function getCategoryId(categoryName) {
  const response = await axios.get(`${API_BASE}/categories`);
  const categories = response.data.data || response.data;
  const categoryList = Array.isArray(categories) ? categories : (categories.categories || []);
  
  const category = categoryList.find(c => 
    c.name === categoryName || c.name?.toLowerCase() === categoryName.toLowerCase()
  );
  
  return category?._id;
}

async function createUniqueProduct(baseName, description, price, category, categoryId, stock, imageUrl, tags, featured, token, index) {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  const uniqueId = `${timestamp}${index}${randomId}`;
  
  // Create completely unique identifiers
  const productData = {
    name: `${baseName} ${uniqueId}`,
    description: description,
    price: price,
    category: categoryId,
    stock: stock,
    imageUrls: [imageUrl],
    tags: tags,
    featured: featured,
    sku: `${category.substring(0, 3).toUpperCase()}-${uniqueId}`,
    slug: `${baseName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${uniqueId}`,
    isActive: true
  };
  
  // Add delay to ensure uniqueness
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const response = await axios.post(
    `${API_BASE}/admin/products`,
    productData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

async function main() {
  console.log('🛍️  Adding Products to Your Store');
  console.log('==================================\n');
  
  try {
    // Login
    console.log('🔐 Logging in...');
    const token = await loginAsAdmin();
    console.log('✅ Login successful\n');
    
    // Get categories
    console.log('📂 Getting categories...');
    const menCategoryId = await getCategoryId('Men');
    const womenCategoryId = await getCategoryId('Women');
    console.log('✅ Categories ready\n');
    
    let successCount = 0;
    let failCount = 0;
    let index = 0;
    
    console.log('📦 Adding products...');
    
    // Men's Products
    const mensProducts = [
      { name: "Classic Denim Jeans", desc: "Premium denim jeans with classic fit", price: 1999, stock: 50, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800", tags: ["jeans", "denim"], featured: true },
      { name: "Cotton Shirt", desc: "Elegant cotton shirt for office wear", price: 1299, stock: 45, img: "https://images.unsplash.com/photo-1594938291221-94f18a5e3d1a?w=800", tags: ["shirt", "cotton"], featured: true },
      { name: "Regular T-Shirt", desc: "Comfortable t-shirt in premium cotton", price: 599, stock: 100, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", tags: ["t-shirt", "casual"], featured: false },
      { name: "Leather Jacket", desc: "Stylish genuine leather jacket", price: 4999, stock: 25, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", tags: ["jacket", "leather"], featured: true },
      { name: "Cargo Pants", desc: "Durable cargo pants with pockets", price: 1799, stock: 40, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800", tags: ["pants", "cargo"], featured: false }
    ];
    
    for (const product of mensProducts) {
      try {
        await createUniqueProduct(
          product.name, product.desc, product.price, "Men", menCategoryId,
          product.stock, product.img, product.tags, product.featured, token, index
        );
        console.log(`✅ [${index + 1}] ${product.name}`);
        successCount++;
      } catch (error) {
        console.log(`❌ [${index + 1}] ${product.name} - ${error.response?.data?.error || error.message}`);
        failCount++;
      }
      index++;
    }
    
    // Women's Products
    const womensProducts = [
      { name: "Summer Dress", desc: "Beautiful floral print summer dress", price: 1799, stock: 40, img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800", tags: ["dress", "summer"], featured: true },
      { name: "Women Jeans", desc: "Stylish denim jeans with perfect fit", price: 1899, stock: 45, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800", tags: ["jeans", "denim"], featured: true },
      { name: "Elegant Blouse", desc: "Sophisticated blouse for office", price: 1299, stock: 35, img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800", tags: ["blouse", "formal"], featured: false },
      { name: "Casual Top", desc: "Comfortable casual top in soft cotton", price: 599, stock: 80, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", tags: ["top", "casual"], featured: false },
      { name: "Maxi Dress", desc: "Elegant maxi dress for parties", price: 2499, stock: 25, img: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800", tags: ["dress", "maxi"], featured: true }
    ];
    
    for (const product of womensProducts) {
      try {
        await createUniqueProduct(
          product.name, product.desc, product.price, "Women", womenCategoryId,
          product.stock, product.img, product.tags, product.featured, token, index
        );
        console.log(`✅ [${index + 1}] ${product.name}`);
        successCount++;
      } catch (error) {
        console.log(`❌ [${index + 1}] ${product.name} - ${error.response?.data?.error || error.message}`);
        failCount++;
      }
      index++;
    }
    
    console.log('\n==================================');
    console.log('📊 Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📦 Total: ${successCount + failCount}`);
    
    if (successCount > 0) {
      console.log('\n🌐 View products at:');
      console.log('   http://localhost:5500/index.html');
      console.log('   http://localhost:5500/men-product.html');
      console.log('   http://localhost:5500/women-product.html');
    }
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
}

main();