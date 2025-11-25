// Test Cart Functionality
require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('./models/cartModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');

const testCart = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find a test user
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('❌ No user found. Please create a user first.');
      process.exit(1);
    }
    console.log('✅ Found user:', user.email);

    // 2. Find a test product
    const product = await Product.findOne({ isActive: true });
    if (!product) {
      console.log('❌ No active product found. Please create a product first.');
      process.exit(1);
    }
    console.log('✅ Found product:', product.name, '- Stock:', product.stock);

    // 3. Check if cart exists
    let cart = await Cart.findOne({ user: user._id });
    console.log('📦 Existing cart:', cart ? 'Found' : 'Not found');

    // 4. Create or update cart
    if (!cart) {
      cart = new Cart({
        user: user._id,
        items: [{
          product: product._id,
          quantity: 1,
          price: product.price
        }]
      });
      console.log('🆕 Creating new cart...');
    } else {
      // Check if product already in cart
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === product._id.toString()
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
        console.log('➕ Updating existing item quantity...');
      } else {
        cart.items.push({
          product: product._id,
          quantity: 1,
          price: product.price
        });
        console.log('➕ Adding new item to cart...');
      }
    }

    // 5. Save cart
    await cart.save();
    console.log('💾 Cart saved successfully!');

    // 6. Retrieve and display cart
    const savedCart = await Cart.findOne({ user: user._id })
      .populate('items.product', 'name price images stock');
    
    console.log('\n📋 Cart Details:');
    console.log('User:', user.email);
    console.log('Total Items:', savedCart.totalItems);
    console.log('Total Price:', savedCart.totalPrice);
    console.log('\nItems:');
    savedCart.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.product.name}`);
      console.log(`     Quantity: ${item.quantity}`);
      console.log(`     Price: ₹${item.price}`);
      console.log(`     Subtotal: ₹${item.price * item.quantity}`);
    });

    console.log('\n✅ Cart test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testCart();
