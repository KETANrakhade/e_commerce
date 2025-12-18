#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

// Men's Products with online images
const mensProducts = [
  {
    name: "Classic Fit Denim Jeans",
    description: "Premium denim jeans with classic fit. Comfortable and durable, perfect for everyday wear.",
    price: 1999,
    category: "Men",
    stock: 50,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"],
    tags: ["jeans", "denim", "casual", "classic"],
    featured: true
  },
  {
    name: "Slim Fit Cotton Shirt",
    description: "Elegant slim fit shirt made from premium cotton. Perfect for office and casual occasions.",
    price: 1299,
    category: "Men",
    stock: 45,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594938291221-94f18a5e3d1a?w=800"],
    tags: ["shirt", "cotton", "formal", "slim-fit"],
    featured: true
  },
  {
    name: "Regular Fit T-Shirt",
    description: "Comfortable regular fit t-shirt in premium cotton. Available in multiple colors.",
    price: 599,
    category: "Men",
    stock: 100,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"],
    tags: ["t-shirt", "cotton", "casual", "comfortable"],
    featured: false
  },
  {
    name: "Leather Jacket",
    description: "Stylish genuine leather jacket with modern design. Perfect for winter season.",
    price: 4999,
    category: "Men",
    stock: 25,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"],
    tags: ["jacket", "leather", "winter", "stylish"],
    featured: true
  },
  {
    name: "Cargo Pants",
    description: "Durable cargo pants with multiple pockets. Ideal for outdoor activities and casual wear.",
    price: 1799,
    category: "Men",
    stock: 40,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800"],
    tags: ["pants", "cargo", "casual", "durable"],
    featured: false
  },
  {
    name: "Polo T-Shirt",
    description: "Classic polo t-shirt with collar. Perfect blend of casual and formal style.",
    price: 899,
    category: "Men",
    stock: 60,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800"],
    tags: ["polo", "t-shirt", "casual", "classic"],
    featured: false
  },
  {
    name: "Hooded Sweatshirt",
    description: "Warm and comfortable hooded sweatshirt. Perfect for cool weather and casual outings.",
    price: 1499,
    category: "Men",
    stock: 35,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"],
    tags: ["sweatshirt", "hoodie", "winter", "casual"],
    featured: false
  },
  {
    name: "Men's Formal Trousers",
    description: "Elegant formal trousers for office wear. Premium fabric with perfect fit.",
    price: 2199,
    category: "Men",
    stock: 30,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594938298606-c0eef37c8394?w=800"],
    tags: ["trousers", "formal", "office", "elegant"],
    featured: true
  },
  {
    name: "Denim Jacket",
    description: "Classic denim jacket with modern styling. Versatile piece for any wardrobe.",
    price: 2499,
    category: "Men",
    stock: 28,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800"],
    tags: ["jacket", "denim", "casual", "versatile"],
    featured: false
  },
  {
    name: "Chino Pants",
    description: "Smart chino pants perfect for smart casual occasions. Comfortable and stylish.",
    price: 1699,
    category: "Men",
    stock: 42,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800"],
    tags: ["pants", "chino", "smart-casual", "comfortable"],
    featured: false
  },
  {
    name: "Long Sleeve Shirt",
    description: "Premium long sleeve shirt with button-down collar. Perfect for formal occasions.",
    price: 1399,
    category: "Men",
    stock: 38,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800"],
    tags: ["shirt", "long-sleeve", "formal", "premium"],
    featured: false
  },
  {
    name: "Track Pants",
    description: "Comfortable track pants for sports and casual wear. Breathable and flexible fabric.",
    price: 999,
    category: "Men",
    stock: 55,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1506629905607-2a0c0e0c0b0e?w=800"],
    tags: ["pants", "track", "sports", "casual"],
    featured: false
  },
  {
    name: "Men's Blazer",
    description: "Elegant blazer for formal occasions. Tailored fit with premium fabric.",
    price: 3999,
    category: "Men",
    stock: 20,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594938291221-94f18a5e3d1a?w=800"],
    tags: ["blazer", "formal", "elegant", "tailored"],
    featured: true
  },
  {
    name: "Short Sleeve Shirt",
    description: "Comfortable short sleeve shirt for summer. Lightweight and breathable fabric.",
    price: 1099,
    category: "Men",
    stock: 48,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"],
    tags: ["shirt", "short-sleeve", "summer", "casual"],
    featured: false
  },
  {
    name: "Winter Coat",
    description: "Warm winter coat with insulation. Perfect for cold weather protection.",
    price: 4499,
    category: "Men",
    stock: 22,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800"],
    tags: ["coat", "winter", "warm", "protection"],
    featured: true
  }
];

// Women's Products with online images
const womensProducts = [
  {
    name: "Floral Summer Dress",
    description: "Beautiful floral print summer dress. Lightweight and comfortable for warm weather.",
    price: 1799,
    category: "Women",
    stock: 40,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"],
    tags: ["dress", "floral", "summer", "casual"],
    featured: true
  },
  {
    name: "Denim Jeans",
    description: "Stylish denim jeans with perfect fit. Comfortable and trendy for everyday wear.",
    price: 1899,
    category: "Women",
    stock: 45,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"],
    tags: ["jeans", "denim", "casual", "trendy"],
    featured: true
  },
  {
    name: "Elegant Blouse",
    description: "Sophisticated blouse perfect for office and formal occasions. Premium fabric.",
    price: 1299,
    category: "Women",
    stock: 35,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800"],
    tags: ["blouse", "formal", "elegant", "office"],
    featured: false
  },
  {
    name: "Casual T-Shirt",
    description: "Comfortable casual t-shirt in soft cotton. Perfect for everyday wear.",
    price: 599,
    category: "Women",
    stock: 80,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"],
    tags: ["t-shirt", "casual", "cotton", "comfortable"],
    featured: false
  },
  {
    name: "Maxi Dress",
    description: "Elegant maxi dress perfect for parties and special occasions. Flowing design.",
    price: 2499,
    category: "Women",
    stock: 25,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800"],
    tags: ["dress", "maxi", "elegant", "party"],
    featured: true
  },
  {
    name: "Women's Leather Jacket",
    description: "Stylish leather jacket with modern design. Perfect for winter and casual outings.",
    price: 4999,
    category: "Women",
    stock: 20,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"],
    tags: ["jacket", "leather", "winter", "stylish"],
    featured: true
  },
  {
    name: "Skinny Jeans",
    description: "Trendy skinny jeans with stretch fabric. Comfortable fit for all-day wear.",
    price: 1699,
    category: "Women",
    stock: 50,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"],
    tags: ["jeans", "skinny", "trendy", "stretch"],
    featured: false
  },
  {
    name: "Crop Top",
    description: "Stylish crop top perfect for summer. Lightweight and trendy design.",
    price: 799,
    category: "Women",
    stock: 60,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800"],
    tags: ["top", "crop", "summer", "trendy"],
    featured: false
  },
  {
    name: "Midi Skirt",
    description: "Elegant midi skirt perfect for office and casual occasions. Versatile piece.",
    price: 1399,
    category: "Women",
    stock: 38,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800"],
    tags: ["skirt", "midi", "elegant", "versatile"],
    featured: false
  },
  {
    name: "Winter Sweater",
    description: "Warm and cozy winter sweater. Perfect for cold weather with stylish design.",
    price: 1999,
    category: "Women",
    stock: 30,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"],
    tags: ["sweater", "winter", "warm", "cozy"],
    featured: false
  },
  {
    name: "Women's Formal Trousers",
    description: "Professional formal trousers for office wear. Tailored fit with premium fabric.",
    price: 1899,
    category: "Women",
    stock: 32,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594938298606-c0eef37c8394?w=800"],
    tags: ["trousers", "formal", "office", "professional"],
    featured: false
  },
  {
    name: "Summer Top",
    description: "Lightweight summer top with beautiful patterns. Perfect for warm weather.",
    price: 899,
    category: "Women",
    stock: 55,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"],
    tags: ["top", "summer", "lightweight", "casual"],
    featured: false
  },
  {
    name: "Evening Gown",
    description: "Stunning evening gown for special occasions. Elegant and sophisticated design.",
    price: 5999,
    category: "Women",
    stock: 15,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800"],
    tags: ["gown", "evening", "elegant", "special-occasion"],
    featured: true
  },
  {
    name: "Denim Shorts",
    description: "Comfortable denim shorts perfect for summer. Casual and trendy style.",
    price: 999,
    category: "Women",
    stock: 65,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1506629905607-2a0c0e0c0b0e?w=800"],
    tags: ["shorts", "denim", "summer", "casual"],
    featured: false
  },
  {
    name: "Women's Blazer",
    description: "Professional blazer for office and formal occasions. Tailored fit with modern design.",
    price: 3499,
    category: "Women",
    stock: 25,
    brand: "Pyramid",
    images: ["https://images.unsplash.com/photo-1594938291221-94f18a5e3d1a?w=800"],
    tags: ["blazer", "formal", "professional", "tailored"],
    featured: true
  }
];

async function loginAsAdmin() {
  try {
    console.log(`   Attempting login with: ${ADMIN_EMAIL}`);
    const response = await axios.post(`${API_BASE}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    }, {
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Don't throw for 4xx errors
      }
    });
    
    // Check response structure - can be response.data.token or response.data.data.token
    if (response.data && response.data.success) {
      const token = response.data.data?.token || response.data.token;
      if (token) {
        return token;
      }
    }
    
    if (response.data && response.data.message) {
      throw new Error(response.data.message);
    }
    
    throw new Error(`Login failed: ${JSON.stringify(response.data)}`);
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      if (status === 401 || status === 404) {
        throw new Error(`Admin user not found or invalid credentials. Please create admin user first.\n   Status: ${status}\n   Message: ${data.message || data.error || 'Unauthorized'}\n   Try: cd backend && node create-admin-user.js`);
      }
      throw new Error(`Login failed (${status}): ${data.message || data.error || error.response.statusText}`);
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to backend. Make sure server is running on port 5001');
    }
    if (error.message) {
      throw error;
    }
    throw new Error(`Login error: ${error.message || 'Unknown error'}`);
  }
}

async function getCategoryId(categoryName, token) {
  try {
    // First, try to get existing categories (public endpoint)
    const getResponse = await axios.get(`${API_BASE}/categories`);
    const categories = getResponse.data.data || getResponse.data;
    const categoryList = Array.isArray(categories) ? categories : (categories.categories || []);
    
    const category = categoryList.find(c => 
      c.name === categoryName || 
      c.slug === categoryName.toLowerCase() ||
      c.name?.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (category) {
      console.log(`   Found existing category: ${categoryName} (${category._id})`);
      return category._id;
    }
    
    // If category doesn't exist, create it using admin endpoint
    console.log(`   Creating new category: ${categoryName}`);
    const createResponse = await axios.post(
      `${API_BASE}/admin/categories`,
      {
        name: categoryName,
        description: `${categoryName}'s clothing and accessories`,
        isActive: true
      },
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const newCategory = createResponse.data.data || createResponse.data;
    const categoryId = newCategory._id || newCategory.id;
    console.log(`   ✅ Created category: ${categoryName} (${categoryId})`);
    return categoryId;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      if (status === 400 && data.message?.includes('already exists')) {
        // Category might exist but wasn't found in list, try to get by slug
        try {
          const slugResponse = await axios.get(`${API_BASE}/categories/slug/${categoryName.toLowerCase()}`);
          const cat = slugResponse.data.data || slugResponse.data;
          return cat._id || cat.id;
        } catch (e) {
          console.error(`   Error: ${data.message}`);
        }
      }
      console.error(`   Error getting/creating category (${status}): ${data.message || error.message}`);
    } else {
      console.error(`   Error getting/creating category: ${error.message}`);
    }
    // Return the category name as fallback - the backend might accept it
    return categoryName;
  }
}

async function addProduct(product, token, categoryId, index) {
  try {
    // Format images properly for the backend
    const formattedImages = product.images.map((url, imgIndex) => ({
      url: url,
      publicId: `product-${Date.now()}-${index}-${imgIndex}-${Math.floor(Math.random() * 10000)}`,
      alt: product.name,
      isPrimary: imgIndex === 0
    }));
    
    // Build product data with unique identifiers
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 100000);
    const uniqueId = `${timestamp}-${index}-${randomSuffix}`;
    
    // Add a small delay to ensure unique timestamps
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const productData = {
      name: `${product.name} (${index + 1})`, // Make name unique
      slug: `${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${uniqueId}`,
      sku: `${product.category.substring(0, 3).toUpperCase()}-${uniqueId}`,
      description: product.description || `${product.name} - Premium quality product`,
      price: product.price,
      category: categoryId,
      stock: product.stock || 50,
      images: formattedImages,
      imageUrls: product.images,
      tags: product.tags || [],
      featured: product.featured || false,
      isActive: true
    };
    
    const response = await axios.post(
      `${API_BASE}/admin/products`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status < 500; // Don't throw for 4xx errors
        }
      }
    );
    
    if (response.status >= 400) {
      const errorMsg = response.data?.message || response.data?.error || response.data?.data?.message || `HTTP ${response.status}`;
      const fullError = response.data ? JSON.stringify(response.data, null, 2) : errorMsg;
      throw new Error(`${errorMsg}\n   Details: ${fullError.substring(0, 200)}`);
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const errorMsg = data.message || data.error || data.data?.message || error.response.statusText;
      throw new Error(`${errorMsg} (${status})`);
    }
    throw error;
  }
}

async function addAllProducts() {
  console.log('🛍️  Adding 30 Products to Your Store');
  console.log('=====================================\n');
  
  try {
    // Check backend connection
    console.log('🔍 Checking backend connection...');
    try {
      const healthCheck = await axios.get(`${API_BASE}/products`, { timeout: 5000 });
      console.log('✅ Backend is running on port 5001\n');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Backend not running. Please start it first:');
        console.log('   cd backend && node server.js\n');
        return;
      }
      console.log('⚠️  Backend connection issue:', error.message);
      console.log('   Continuing anyway...\n');
    }
    
    // Login as admin
    console.log('🔐 Logging in as admin...');
    const token = await loginAsAdmin();
    console.log('✅ Admin login successful\n');
    
    // Get category IDs
    console.log('📂 Getting categories...');
    const menCategoryId = await getCategoryId('Men', token);
    const womenCategoryId = await getCategoryId('Women', token);
    console.log('✅ Categories ready\n');
    
    let successCount = 0;
    let failCount = 0;
    
    // Add Men's products
    console.log('👔 Adding Men\'s Products (15 items)...');
    console.log('-----------------------------------');
    for (let i = 0; i < mensProducts.length; i++) {
      const product = mensProducts[i];
      try {
        await addProduct(product, token, menCategoryId, i);
        console.log(`✅ [${i + 1}/15] ${product.name}`);
        successCount++;
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        if (error.message.includes('Product already exists')) {
          console.log(`⚠️  [${i + 1}/15] ${product.name} - Already exists, skipping`);
        } else {
          console.log(`❌ [${i + 1}/15] ${product.name} - ${error.message}`);
          failCount++;
        }
      }
    }
    
    console.log('\n👗 Adding Women\'s Products (15 items)...');
    console.log('-----------------------------------');
    for (let i = 0; i < womensProducts.length; i++) {
      const product = womensProducts[i];
      try {
        await addProduct(product, token, womenCategoryId, i + 15);
        console.log(`✅ [${i + 1}/15] ${product.name}`);
        successCount++;
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        if (error.message.includes('Product already exists')) {
          console.log(`⚠️  [${i + 1}/15] ${product.name} - Already exists, skipping`);
        } else {
          console.log(`❌ [${i + 1}/15] ${product.name} - ${error.message}`);
          failCount++;
        }
      }
    }
    
    // Summary
    console.log('\n=====================================');
    console.log('📊 Summary:');
    console.log(`   ✅ Successfully added: ${successCount} products`);
    console.log(`   ❌ Failed: ${failCount} products`);
    console.log(`   📦 Total: ${successCount + failCount} products`);
    console.log('\n🌐 View products at:');
    console.log('   http://localhost:5001/api/products');
    console.log('   http://localhost:5001/api/products/category/men');
    console.log('   http://localhost:5001/api/products/category/women');
    
  } catch (error) {
    console.log('\n❌ Error:');
    console.log(`   ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    console.log('\n🛠️  Troubleshooting:');
    console.log('   1. Make sure backend is running: cd backend && node server.js');
    console.log('   2. Make sure MongoDB is running');
    console.log('   3. Create admin user if needed');
    console.log('   4. Check API_BASE URL (should be http://localhost:5001/api)');
  }
}

// Run the script
addAllProducts();

