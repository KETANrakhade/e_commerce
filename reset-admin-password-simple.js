const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./backend/models/userModel');

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@pyramid.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Update admin password
    admin.password = hashedPassword;
    admin.isActive = true;
    admin.role = 'admin';
    await admin.save();

    console.log('✅ Admin password reset successfully');
    console.log('📧 Email: admin@pyramid.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', admin.role);
    console.log('✅ Active:', admin.isActive);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();