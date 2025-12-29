const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the actual User model
const User = require('./models/userModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce');

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting admin password...');
    
    // Find admin users
    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      console.log('💡 Creating new admin user...');
      
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newAdmin = new User({
        name: 'Admin User',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ New admin user created!');
    } else {
      console.log(`📊 Found ${adminUsers.length} admin users. Updating passwords...`);
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update all admin users
      for (const admin of adminUsers) {
        admin.password = hashedPassword;
        admin.isActive = true;
        await admin.save();
        console.log(`✅ Updated password for: ${admin.email}`);
      }
    }
    
    console.log('\n🎉 Admin password reset complete!');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('🚀 Try logging in now!');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
resetAdminPassword();