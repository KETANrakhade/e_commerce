const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  console.log('📋 Get cart request for user:', req.user._id);
  
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images stock');
  
  if (!cart) {
    console.log('📦 No cart found, returning empty cart');
    return res.json({ 
      success: true,
      cart: {
        items: [], 
        totalItems: 0, 
        totalPrice: 0 
      }
    });
  }

  console.log('✅ Cart found with', cart.items.length, 'items');
  console.log('   Total items:', cart.totalItems);
  console.log('   Total price:', cart.totalPrice);

  res.json({
    success: true,
    cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  console.log('🛒 Add to cart request received');
  console.log('User ID:', req.user._id);
  console.log('Request body:', req.body);

  const { productId, quantity = 1 } = req.body;

  // Validate productId
  if (!productId) {
    console.log('❌ Error: Product ID is missing');
    res.status(400);
    throw new Error('Product ID is required');
  }

  // Validate quantity
  if (quantity < 1) {
    console.log('❌ Error: Invalid quantity');
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  // Check if product exists and is active
  console.log('🔍 Looking for product:', productId);
  const product = await Product.findById(productId);
  
  if (!product) {
    console.log('❌ Error: Product not found in database');
    res.status(404);
    throw new Error('Product not found');
  }

  console.log('✅ Product found:', product.name);
  console.log('   Active:', product.isActive);
  console.log('   Stock:', product.stock);
  console.log('   Price:', product.price);

  if (!product.isActive) {
    console.log('❌ Error: Product is not active');
    res.status(404);
    throw new Error('Product is not available');
  }

  // Check stock
  if (product.stock < quantity) {
    console.log('❌ Error: Insufficient stock');
    res.status(400);
    throw new Error(`Insufficient stock. Available: ${product.stock}`);
  }

  // Find or create cart
  console.log('🔍 Looking for existing cart...');
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    console.log('🆕 Creating new cart');
    cart = new Cart({
      user: req.user._id,
      items: [{
        product: productId,
        quantity,
        price: product.price
      }]
    });
  } else {
    console.log('✅ Found existing cart with', cart.items.length, 'items');
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      console.log('➕ Product already in cart, updating quantity');
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      
      // Check stock again
      if (newQuantity > product.stock) {
        console.log('❌ Error: Total quantity exceeds stock');
        res.status(400);
        throw new Error(`Insufficient stock. Available: ${product.stock}, In cart: ${cart.items[itemIndex].quantity}`);
      }
      
      cart.items[itemIndex].quantity = newQuantity;
      console.log('   New quantity:', newQuantity);
    } else {
      console.log('➕ Adding new product to cart');
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
  }

  // Save cart
  console.log('💾 Saving cart...');
  await cart.save();
  console.log('✅ Cart saved successfully');
  console.log('   Total items:', cart.totalItems);
  console.log('   Total price:', cart.totalPrice);

  // Populate product details
  await cart.populate('items.product', 'name price images stock');
  console.log('✅ Cart populated with product details');

  console.log('📦 Returning cart with', cart.items.length, 'items');
  res.status(201).json({
    success: true,
    message: 'Product added to cart',
    cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  // Check stock
  const product = await Product.findById(productId);
  if (quantity > product.stock) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name price images stock');

  res.json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  
  await cart.save();
  await cart.populate('items.product', 'name price images stock');

  res.json(cart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = [];
  await cart.save();

  res.json({ message: 'Cart cleared', cart });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
