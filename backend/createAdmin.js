const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@admin.com', role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@admin.com');
      console.log('Password: admin123');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });
    
    await admin.save();
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();