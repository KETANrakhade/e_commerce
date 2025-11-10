// Test Cloudinary Configuration
require('dotenv').config();
const { testConnection } = require('./config/cloudinary');

async function runTest() {
  console.log('🧪 Testing Cloudinary Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
  
  console.log('\n🔗 Testing Connection...');
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('\n🎉 Cloudinary is properly configured and connected!');
    console.log('\n📁 Your images will be stored in:');
    console.log('   Folder: pyramid-ecommerce/products/');
    console.log('   Format: Auto-optimized WebP');
    console.log('   Max Size: 800x800px');
    console.log('   Quality: Auto-optimized');
  } else {
    console.log('\n❌ Cloudinary configuration failed!');
    console.log('\n🔧 Please check:');
    console.log('   1. Your .env file has correct Cloudinary credentials');
    console.log('   2. Your Cloudinary account is active');
    console.log('   3. API keys are valid and not expired');
  }
}

runTest().catch(console.error);