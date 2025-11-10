const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orderModel');

class PaymentService {
  // Create Stripe checkout session
  async createCheckoutSession(orderData, user) {
    const { orderItems, shippingAddress, totalPrice } = orderData;
    
    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items provided');
    }

    // Create line items for Stripe
    const line_items = orderItems.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: { 
          name: item.name,
          images: item.image ? [item.image] : [],
          description: item.description || ''
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
        userId: user._id.toString(),
        orderData: JSON.stringify({
          orderItems,
          shippingAddress,
          totalPrice
        })
      },
      customer_email: user.email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['IN'] // India only for now
      }
    });

    return {
      sessionId: session.id,
      url: session.url,
      session
    };
  }

  // Handle Stripe webhook
  async handleStripeWebhook(rawBody, signature) {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await this.handleSuccessfulPayment(session);
    }

    return { received: true };
  }

  // Handle successful payment
  async handleSuccessfulPayment(session) {
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

      const savedOrder = await order.save();
      console.log('Order created successfully:', savedOrder.orderNumber);

      // Send confirmation email (if email service is configured)
      try {
        const emailService = require('./emailService');
        const User = require('../models/userModel');
        const user = await User.findById(userId);
        
        if (user) {
          await emailService.sendOrderConfirmation(user, savedOrder);
          await emailService.sendNewOrderNotification(savedOrder, user);
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw error - order creation should succeed even if email fails
      }

      return savedOrder;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  }

  // Get payment intent details
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw new Error('Failed to retrieve payment details');
    }
  }

  // Refund payment
  async refundPayment(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // convert to paise
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Create payment intent (for custom checkout)
  async createPaymentIntent(amount, currency = 'inr', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to paise
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Get customer payment methods
  async getCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods;
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  // Create or retrieve Stripe customer
  async createOrRetrieveCustomer(user) {
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });

      return customer;
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      throw new Error('Failed to manage customer');
    }
  }

  // Get payment statistics
  async getPaymentStats(startDate = null, endDate = null) {
    try {
      const params = {
        limit: 100
      };

      if (startDate) {
        params.created = { gte: Math.floor(startDate.getTime() / 1000) };
      }

      if (endDate) {
        if (!params.created) params.created = {};
        params.created.lte = Math.floor(endDate.getTime() / 1000);
      }

      const charges = await stripe.charges.list(params);
      
      const stats = {
        totalTransactions: charges.data.length,
        successfulTransactions: charges.data.filter(charge => charge.status === 'succeeded').length,
        failedTransactions: charges.data.filter(charge => charge.status === 'failed').length,
        totalAmount: charges.data.reduce((sum, charge) => sum + (charge.amount / 100), 0),
        refundedAmount: charges.data.reduce((sum, charge) => sum + (charge.amount_refunded / 100), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw new Error('Failed to retrieve payment statistics');
    }
  }

  // Validate webhook signature
  validateWebhookSignature(payload, signature, secret) {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      throw new Error('Invalid webhook signature');
    }
  }
}

module.exports = new PaymentService();