const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB and test admin login
async function testAdminLogin() {
  try {
    console.log('🔍 Testing Admin Login...');
    console.log('========================');
    
    // Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import User model
    const User = require('./models/userModel');
    
    // Find admin user
    console.log('\n2. Looking for admin user...');
    const admin = await User.findOne({ email: 'admin@admin.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('💡 Run: node createAdminSimple.js');
      process.exit(1);
    }
    
    console.log('✅ Admin user found:');
    console.log('   - ID:', admin._id);
    console.log('   - Email:', admin.email);
    console.log('   - Role:', admin.role);
    console.log('   - Active:', admin.isActive);
    
    // Test password
    console.log('\n3. Testing password...');
    const isPasswordValid = await bcrypt.compare('admin123', admin.password);
    
    if (isPasswordValid) {
      console.log('✅ Password is correct');
    } else {
      console.log('❌ Password is incorrect!');
      console.log('💡 Run: node createAdminSimple.js to reset password');
    }
    
    // Test admin conditions
    console.log('\n4. Checking admin conditions...');
    
    if (admin.role !== 'admin') {
      console.log('❌ User role is not admin:', admin.role);
    } else {
      console.log('✅ User has admin role');
    }
    
    if (!admin.isActive) {
      console.log('❌ Admin account is not active');
    } else {
      console.log('✅ Admin account is active');
    }
    
    // Test API endpoint simulation
    console.log('\n5. Simulating API login...');
    
    if (admin.role === 'admin' && admin.isActive && isPasswordValid) {
      console.log('✅ Login should work! All conditions met.');
      
      // Generate token (simulate)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
      console.log('✅ JWT token generated successfully');
      
    } else {
      console.log('❌ Login will fail. Issues found above.');
    }
    
    console.log('\n🎯 Summary:');
    console.log('- Admin user exists:', !!admin);
    console.log('- Password correct:', isPasswordValid);
    console.log('- Role is admin:', admin?.role === 'admin');
    console.log('- Account active:', admin?.isActive);
    console.log('- Should login work:', !!(admin && isPasswordValid && admin.role === 'admin' && admin.isActive));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testAdminLogin();