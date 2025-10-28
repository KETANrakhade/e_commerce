const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple User schema for this script
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Test admin login
const testAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find admin user
    const admin = await User.findOne({ email: 'admin@admin.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      mongoose.connection.close();
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('- Email:', admin.email);
    console.log('- Role:', admin.role);
    console.log('- Active:', admin.isActive);
    
    // Test password
    const isPasswordValid = await bcrypt.compare('admin123', admin.password);
    console.log('- Password valid:', isPasswordValid ? '✅' : '❌');
    
    if (admin.role !== 'admin') {
      console.log('❌ User is not an admin!');
    }
    
    if (!admin.isActive) {
      console.log('❌ User is not active!');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
};

testAdmin();