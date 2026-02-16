const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Order = require('./models/orderModel');

async function testOrders() {
  try {
    console.log('Testing orders...');
    
    // Count orders
    const count = await Order.countDocuments();
    console.log(`Total orders in database: ${count}`);
    
    // Get first few orders
    const orders = await Order.find().limit(3).populate('user', 'name email');
    console.log('Sample orders:');
    orders.forEach(order => {
      console.log(`- ${order.orderNumber}: ${order.user?.name || 'Unknown'} - ₹${order.totalPrice} - ${order.status}`);
    });
    
    if (count === 0) {
      console.log('No orders found. Creating a test order...');
      
      // Create a test order
      const testOrder = new Order({
        orderNumber: 'ORD-TEST-001',
        user: new mongoose.Types.ObjectId(), // Dummy user ID
        orderItems: [{
          productId: new mongoose.Types.ObjectId(),
          name: 'Test Product',
          price: 1000,
          quantity: 1,
          image: 'test.jpg'
        }],
        shippingAddress: {
          address: '123 Test Street',
          city: 'Mumbai',
          postalCode: '400001',
          country: 'India'
        },
        paymentMethod: 'Online',
        itemsPrice: 1000,
        totalPrice: 1000,
        status: 'delivered',
        isPaid: true,
        paidAt: new Date()
      });
      
      await testOrder.save();
      console.log('Test order created successfully!');
    }
    
  } catch (error) {
    console.error('Error testing orders:', error);
  } finally {
    mongoose.connection.close();
  }
}

testOrders();