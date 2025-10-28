const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');

// User schema (adjust based on your existing User model)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Try password: admin123');
      console.log('💡 Or update password in MongoDB directly');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Password: admin123');
    console.log('🎯 Role: admin');
    console.log('');
    console.log('🚀 Now you can login to the admin panel!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();