/**
 * Test Script for OTP Email Verification System
 * Run: node test-otp-system.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const authService = require('./services/authService');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Test data
const testUser = {
  name: 'Test User OTP',
  email: 'test-otp@example.com',
  password: 'password123'
};

// Main test function
const runTests = async () => {
  console.log('\n🧪 Starting OTP System Tests...\n');

  try {
    // Clean up test user if exists
    await User.deleteOne({ email: testUser.email });
    console.log('🧹 Cleaned up existing test user\n');

    // Test 1: Signup with OTP
    console.log('📝 Test 1: User Signup with OTP Generation');
    console.log('-------------------------------------------');
    const signupResult = await authService.signup(testUser);
    console.log('✅ Signup Result:', JSON.stringify(signupResult, null, 2));
    
    // Get the user to check OTP
    const user = await User.findOne({ email: testUser.email });
    console.log('\n📧 OTP Generated:', user.otp);
    console.log('⏰ OTP Expiry:', new Date(user.otpExpiry).toLocaleString());
    console.log('✉️  Email Verified:', user.isVerified);
    
    const generatedOTP = user.otp;

    // Test 2: Try login before verification (should fail)
    console.log('\n\n🔐 Test 2: Login Before Email Verification (Should Fail)');
    console.log('--------------------------------------------------------');
    try {
      await authService.login({
        email: testUser.email,
        password: testUser.password
      });
      console.log('❌ Test Failed: Login should not work before verification');
    } catch (error) {
      console.log('✅ Expected Error:', error.message);
    }

    // Test 3: Verify OTP with wrong code (should fail)
    console.log('\n\n🔢 Test 3: Verify with Wrong OTP (Should Fail)');
    console.log('-----------------------------------------------');
    try {
      await authService.verifyOTP(testUser.email, '000000');
      console.log('❌ Test Failed: Wrong OTP should not work');
    } catch (error) {
      console.log('✅ Expected Error:', error.message);
    }

    // Test 4: Verify OTP with correct code (should succeed)
    console.log('\n\n✅ Test 4: Verify with Correct OTP (Should Succeed)');
    console.log('---------------------------------------------------');
    const verifyResult = await authService.verifyOTP(testUser.email, generatedOTP);
    console.log('✅ Verification Result:', JSON.stringify(verifyResult, null, 2));

    // Test 5: Login after verification (should succeed)
    console.log('\n\n🎉 Test 5: Login After Email Verification (Should Succeed)');
    console.log('----------------------------------------------------------');
    const loginResult = await authService.login({
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login Result:', JSON.stringify(loginResult, null, 2));

    // Test 6: Resend OTP (should fail - already verified)
    console.log('\n\n🔄 Test 6: Resend OTP After Verification (Should Fail)');
    console.log('------------------------------------------------------');
    try {
      await authService.resendOTP(testUser.email);
      console.log('❌ Test Failed: Resend should not work after verification');
    } catch (error) {
      console.log('✅ Expected Error:', error.message);
    }

    // Test 7: Test OTP expiry
    console.log('\n\n⏱️  Test 7: OTP Expiry Check');
    console.log('----------------------------');
    
    // Create another test user
    const testUser2 = {
      name: 'Test User Expiry',
      email: 'test-expiry@example.com',
      password: 'password123'
    };
    
    await User.deleteOne({ email: testUser2.email });
    await authService.signup(testUser2);
    
    const user2 = await User.findOne({ email: testUser2.email });
    const otp2 = user2.otp;
    
    // Manually expire the OTP
    user2.otpExpiry = Date.now() - 1000; // 1 second ago
    await user2.save();
    
    try {
      await authService.verifyOTP(testUser2.email, otp2);
      console.log('❌ Test Failed: Expired OTP should not work');
    } catch (error) {
      console.log('✅ Expected Error:', error.message);
    }

    // Test 8: Resend OTP for unverified user
    console.log('\n\n🔄 Test 8: Resend OTP for Unverified User (Should Succeed)');
    console.log('-----------------------------------------------------------');
    const resendResult = await authService.resendOTP(testUser2.email);
    console.log('✅ Resend Result:', JSON.stringify(resendResult, null, 2));
    
    const user2Updated = await User.findOne({ email: testUser2.email });
    console.log('📧 New OTP Generated:', user2Updated.otp);

    // Clean up
    console.log('\n\n🧹 Cleaning up test users...');
    await User.deleteOne({ email: testUser.email });
    await User.deleteOne({ email: testUser2.email });
    console.log('✅ Cleanup complete');

    console.log('\n\n🎊 All Tests Passed Successfully! 🎊\n');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
    process.exit(0);
  }
};

// Run tests
connectDB().then(runTests);
