const asyncHandler = require('express-async-handler');
const paymentService = require('../services/paymentService');

const createCheckoutSession = asyncHandler(async (req, res) => {
  const session = await paymentService.createRazorpayOrder(req.body, req.user);
  res.json({
    success: true,
    data: session
  });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
    res.status(400);
    throw new Error('Missing payment verification data');
  }

  const savedOrder = await paymentService.handleSuccessfulPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData
  }, req.user);

  res.json({
    success: true,
    data: savedOrder
  });
});

module.exports = { createCheckoutSession, verifyRazorpayPayment };
