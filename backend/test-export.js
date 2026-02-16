// Test Export Functionality
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const app = express();

// Import the export function
const { exportOrders } = require('./controllers/orderController');

// Test route without authentication
app.get('/test-export', async (req, res) => {
  try {
    console.log('🧪 Testing export functionality...');
    
    // Mock request object
    req.query = {
      format: 'pdf',
      status: '',
      startDate: '',
      endDate: ''
    };
    
    // Call the export function
    await exportOrders(req, res);
    
  } catch (error) {
    console.error('❌ Export test failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📄 Test export: http://localhost:${PORT}/test-export`);
});