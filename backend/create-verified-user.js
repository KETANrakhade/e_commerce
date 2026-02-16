// Create a verified user for testing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./models/userModel');

async function createVerifiedUser() {
  try {
    console.log('🔧 Creating verified test user...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'verified@test.com' });
    if (existingUser) {
      console.log('📝 User already exists, updating verification status...');
      existingUser.isVerified = true;
      await existingUser.save();
      console.log('✅ User verification updated');
    } else {
      // Create new verified user
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const user = new User({
        name: 'Verified Test User',
        email: 'verified@test.com',
        password: hashedPassword,
        isVerified: true // This is the key!
      });
      
      await user.save();
      console.log('✅ Created new verified user');
    }
    
    console.log('📋 User details:');
    console.log('   Email: verified@test.com');
    console.log('   Password: password123');
    console.log('   Status: Verified ✅');
    
    // Also verify an existing user for convenience
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      testUser.isVerified = true;
      await testUser.save();
      console.log('✅ Also verified test@example.com');
    }
    
  } catch (error) {
    console.error('❌ Error creating verified user:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createVerifiedUser();