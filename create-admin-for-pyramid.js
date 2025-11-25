// Create Admin User for Pyramid Admin Panel
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

// User Model
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: 'user' },
    isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce');
        console.log('✅ Connected to MongoDB');

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
        
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            
            // Update to ensure it's admin
            existingAdmin.role = 'admin';
            existingAdmin.isActive = true;
            await existingAdmin.save();
            console.log('✅ Updated existing user to admin');
        } else {
            // Create new admin
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const admin = new User({
                name: 'Admin User',
                email: 'admin@admin.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true
            });

            await admin.save();
            console.log('✅ Admin user created successfully!');
        }

        console.log('');
        console.log('🔐 Admin Credentials:');
        console.log('   Email: admin@admin.com');
        console.log('   Password: admin123');
        console.log('');
        console.log('🎯 Login at: http://localhost:8000');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createAdmin();
