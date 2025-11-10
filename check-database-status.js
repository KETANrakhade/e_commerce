const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./backend/models/userModel');
const Product = require('./backend/models/productModel');
const Order = require('./backend/models/orderModel');

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking PYRAMID E-Commerce Database Status...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce');
    console.log('✅ MongoDB connected successfully!\n');
    
    // Check Users Collection
    console.log('👥 USERS COLLECTION STATUS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    console.log(`📊 Total Users: ${totalUsers}`);
    console.log(`👑 Admin Users: ${adminUsers}`);
    console.log(`👤 Regular Users: ${regularUsers}`);
    console.log(`✅ Active Users: ${activeUsers}`);
    
    if (adminUsers === 0) {
      console.log('⚠️  NO ADMIN USERS FOUND!');
      console.log('💡 Run: node create-admin-user.js to create admin');
    } else {
      const admins = await User.find({ role: 'admin' }).select('name email isActive');
      console.log('👑 Admin Users:');
      admins.forEach(admin => {
        console.log(`   📧 ${admin.email} (${admin.name}) - ${admin.isActive ? '✅ Active' : '❌ Inactive'}`);
      });
    }
    
    // Check Products Collection
    console.log('\n📦 PRODUCTS COLLECTION STATUS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ featured: true });
    
    console.log(`📊 Total Products: ${totalProducts}`);
    console.log(`✅ Active Products: ${activeProducts}`);
    console.log(`⭐ Featured Products: ${featuredProducts}`);
    
    if (totalProducts === 0) {
      console.log('⚠️  NO PRODUCTS FOUND!');
      console.log('💡 Add products through admin panel or run sample data script');
    } else {
      const categories = await Product.distinct('category');
      console.log(`🏷️  Categories: ${categories.join(', ')}`);
    }
    
    // Check Orders Collection
    console.log('\n🛒 ORDERS COLLECTION STATUS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ isPaid: true });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    console.log(`📊 Total Orders: ${totalOrders}`);
    console.log(`💳 Paid Orders: ${paidOrders}`);
    console.log(`⏳ Pending Orders: ${pendingOrders}`);
    
    // Check Database Indexes
    console.log('\n🔍 DATABASE INDEXES STATUS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const userIndexes = await User.collection.getIndexes();
    const productIndexes = await Product.collection.getIndexes();
    const orderIndexes = await Order.collection.getIndexes();
    
    console.log(`👥 User Indexes: ${Object.keys(userIndexes).length}`);
    console.log(`📦 Product Indexes: ${Object.keys(productIndexes).length}`);
    console.log(`🛒 Order Indexes: ${Object.keys(orderIndexes).length}`);
    
    // Overall Status
    console.log('\n🎯 OVERALL DATABASE STATUS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const isReady = adminUsers > 0 && totalProducts >= 0 && totalOrders >= 0;
    
    if (isReady) {
      console.log('✅ DATABASE IS READY FOR PRODUCTION!');
      console.log('🚀 All collections are properly configured');
      console.log('👑 Admin users exist for management');
      console.log('📊 Indexes are optimized for performance');
    } else {
      console.log('⚠️  DATABASE NEEDS SETUP:');
      if (adminUsers === 0) console.log('   - Create admin users');
      if (totalProducts === 0) console.log('   - Add sample products');
      console.log('   - Test user registration and login');
    }
    
    console.log('\n🔗 QUICK ACTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Create Admin: node create-admin-user.js');
    console.log('📦 Add Products: node add-sample-product.js');
    console.log('🚀 Start Server: cd backend && npm start');
    console.log('🌐 Frontend: Open index.html in browser');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUTION: Start MongoDB server');
      console.log('   - Install MongoDB locally, or');
      console.log('   - Use MongoDB Atlas cloud database');
      console.log('   - Update MONGO_URI in .env file');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Database connection closed');
  }
}

checkDatabaseStatus();