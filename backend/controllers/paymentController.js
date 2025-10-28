const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, totalPrice } = req.body;
  
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Create line items for Stripe
  const line_items = orderItems.map(item => ({
    price_data: {
      currency: 'inr',
      product_data: { 
        name: item.name,
        images: item.image ? [item.image] : []
      },
      unit_amount: Math.round(item.price * 100) // convert rupees to paise
    },
    quantity: item.quantity
  }));

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/orderSuccess.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout.html`,
    metadata: { 
      userId: req.user._id.toString(),
      orderData: JSON.stringify({
        orderItems,
        shippingAddress,
        totalPrice
      })
    },
    customer_email: req.user.email
  });

  res.json({ 
    sessionId: session.id,
    url: session.url 
  });
});

// Stripe webhook handler
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, orderData } = session.metadata;
    
    try {
      const parsedOrderData = JSON.parse(orderData);
      
      // Create order in database
      const order = new Order({
        user: userId,
        orderItems: parsedOrderData.orderItems.map(item => ({
          productId: item.productId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: parsedOrderData.shippingAddress,
        paymentMethod: 'Online',
        paymentResult: {
          id: session.payment_intent,
          status: session.payment_status,
          update_time: new Date().toISOString(),
          email_address: session.customer_email
        },
        itemsPrice: parsedOrderData.totalPrice,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: parsedOrderData.totalPrice,
        isPaid: true,
        paidAt: new Date(),
        status: 'confirmed'
      });

      await order.save();
      console.log('Order created successfully:', order.orderNumber);
    } catch (err) {
      console.error('Error creating order:', err);
    }
  }

  res.json({ received: true });
});

module.exports = { createCheckoutSession, handleStripeWebhook };
