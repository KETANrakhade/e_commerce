const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

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

// Check admin user
const checkAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find admin user
    const admin = await User.findOne({ email: 'admin@admin.com' });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log('- ID:', admin._id);
      console.log('- Name:', admin.name);
      console.log('- Email:', admin.email);
      console.log('- Role:', admin.role);
      console.log('- Active:', admin.isActive);
      console.log('- Created:', admin.createdAt);
      
      // Test password
      const isPasswordValid = await bcrypt.compare('admin123', admin.password);
      console.log('- Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ Password does not match! Updating password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        admin.password = hashedPassword;
        await admin.save();
        console.log('✅ Password updated successfully');
      }
      
    } else {
      console.log('❌ Admin user not found!');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

checkAdmin();