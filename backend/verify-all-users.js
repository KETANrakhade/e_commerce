// Quick script to verify all users for testing purposes
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./models/userModel');

async function verifyAllUsers() {
  try {
    console.log('🔧 Verifying all users for testing...');
    
    const result = await User.updateMany(
      { isVerified: false },
      { $set: { isVerified: true } }
    );
    
    console.log(`✅ Verified ${result.modifiedCount} users`);
    
    // Show updated users
    const users = await User.find({}).select('name email isVerified');
    console.log('\n📋 All users are now verified:');
    users.forEach(user => {
      console.log(`   ${user.name} (${user.email}) - ${user.isVerified ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error verifying users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

verifyAllUsers();