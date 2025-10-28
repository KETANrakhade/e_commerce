const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Product = require('../models/productModel');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  
  if (user) {
    res.json({
      success: true,
      data: user.wishlist
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);
  
  if (user.wishlist.includes(productId)) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  user.wishlist.push(productId);
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate('wishlist');
  
  res.json({
    success: true,
    data: updatedUser.wishlist,
    message: 'Product added to wishlist'
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const user = await User.findById(req.user._id);
  
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate('wishlist');
  
  res.json({
    success: true,
    data: updatedUser.wishlist,
    message: 'Product removed from wishlist'
  });
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  user.wishlist = [];
  await user.save();
  
  res.json({
    success: true,
    data: [],
    message: 'Wishlist cleared'
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};