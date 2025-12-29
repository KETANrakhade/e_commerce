const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function checkAdminUsers() {
  try {
    const adminUsers = await User.find({ role: 'admin' });
    
    console.log('🔍 Admin Users Found:');
    console.log('=====================');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      console.log('💡 Run: node create-admin-user.js');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log('   ---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking admin users:', error);
    process.exit(1);
  }
}

checkAdminUsers();