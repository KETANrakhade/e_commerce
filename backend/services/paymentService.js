const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orderModel');

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  // Create Razorpay order
  async createRazorpayOrder(orderData, user) {
    const { orderItems, shippingAddress, totalPrice } = orderData;
    
    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items provided');
    }

    try {
      // Create Razorpay order
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(totalPrice * 100), // convert rupees to paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          userId: user._id.toString(),
          userEmail: user.email,
          orderData: JSON.stringify({
            orderItems,
            shippingAddress,
            totalPrice
          })
        }
      });

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Verify Razorpay payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const text = orderId + '|' + paymentId;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      return generated_signature === signature;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  // Handle successful payment and create order
  async handleSuccessfulPayment(paymentData, user) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = paymentData;
    
    try {
      // Verify payment signature
      const isValid = this.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      // Fetch payment details from Razorpay
      const payment = await this.razorpay.payments.fetch(razorpay_payment_id);

      // Create order in database
      const order = new Order({
        user: user._id,
        orderItems: orderData.orderItems.map(item => ({
          productId: item.productId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: 'Online',
        paymentResult: {
          id: razorpay_payment_id,
          orderId: razorpay_order_id,
          status: payment.status,
          method: payment.method,
          update_time: new Date().toISOString(),
          email_address: payment.email || user.email
        },
        itemsPrice: orderData.totalPrice,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: orderData.totalPrice,
        isPaid: true,
        paidAt: new Date(),
        status: 'confirmed'
      });

      const savedOrder = await order.save();
      console.log('Order created successfully:', savedOrder.orderNumber);

      // Send confirmation email (if email service is configured)
      try {
        const emailService = require('./emailService');
        if (emailService) {
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

  // Handle Razorpay webhook
  async handleRazorpayWebhook(rawBody, signature) {
    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Invalid webhook signature');
      }

      const event = JSON.parse(rawBody);

      // Handle different event types
      if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        console.log('Payment captured:', payment.id);
        // Additional processing if needed
      } else if (event.event === 'payment.failed') {
        const payment = event.payload.payment.entity;
        console.log('Payment failed:', payment.id);
        // Handle failed payment
      }

      return { received: true };
    } catch (err) {
      console.error('Webhook processing failed:', err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error retrieving payment details:', error);
      throw new Error('Failed to retrieve payment details');
    }
  }

  // Refund payment
  async refundPayment(paymentId, amount = null, notes = {}) {
    try {
      const refundData = {
        notes: notes
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Get payment statistics from database
  async getPaymentStats(startDate = null, endDate = null) {
    try {
      const query = { isPaid: true };

      if (startDate || endDate) {
        query.paidAt = {};
        if (startDate) query.paidAt.$gte = startDate;
        if (endDate) query.paidAt.$lte = endDate;
      }

      const orders = await Order.find(query);
      
      const stats = {
        totalTransactions: orders.length,
        successfulTransactions: orders.filter(order => order.status === 'confirmed').length,
        failedTransactions: orders.filter(order => order.status === 'cancelled').length,
        totalAmount: orders.reduce((sum, order) => sum + order.totalPrice, 0),
        refundedAmount: orders
          .filter(order => order.status === 'refunded')
          .reduce((sum, order) => sum + order.totalPrice, 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw new Error('Failed to retrieve payment statistics');
    }
  }

  // Validate webhook signature
  validateWebhookSignature(payload, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      throw new Error('Invalid webhook signature');
    }
  }
}

module.exports = new PaymentService();