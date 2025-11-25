const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ product: productId });

  res.json({
    reviews,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Create a review
// @route   POST /api/reviews/:productId
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Rating and comment are required');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  // Check if user purchased this product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'orderItems.productId': productId,
    status: 'delivered'
  });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    comment,
    isVerifiedPurchase: !!hasPurchased
  });

  // Update product rating
  await updateProductRating(productId);

  const populatedReview = await Review.findById(review._id).populate('user', 'name');
  
  res.status(201).json(populatedReview);
});

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns this review
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  if (rating) {
    if (rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('Rating must be between 1 and 5');
    }
    review.rating = rating;
  }

  if (comment) {
    review.comment = comment;
  }

  await review.save();

  // Update product rating
  await updateProductRating(review.product);

  const updatedReview = await Review.findById(reviewId).populate('user', 'name');
  
  res.json(updatedReview);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns this review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const productId = review.product;
  await review.deleteOne();

  // Update product rating
  await updateProductRating(productId);

  res.json({ message: 'Review deleted' });
});

// Helper function to update product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  
  const product = await Product.findById(productId);
  
  if (reviews.length === 0) {
    product.rating = 0;
    product.numReviews = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / reviews.length;
    product.numReviews = reviews.length;
  }
  
  await product.save();
};

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
};
