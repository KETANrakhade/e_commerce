// Email Service for sending notifications
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure your email service here (Gmail, SendGrid, etc.)
    this.emailProvider = process.env.EMAIL_PROVIDER || 'console'; // 'gmail', 'sendgrid', 'console'
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@pyramid.com';
    this.fromName = process.env.FROM_NAME || 'PYRAMID E-Commerce';
    
    // Initialize Nodemailer transporter for Gmail
    if (this.emailProvider === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Use App Password for Gmail
        }
      });
    }
  }

  // Send email (with Nodemailer support)
  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      if (this.emailProvider === 'console') {
        // For development - log to console
        console.log('📧 EMAIL SENT:');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Content:', textContent || htmlContent);
        console.log('---');
        return { success: true, messageId: 'console-' + Date.now() };
      }

      if (this.emailProvider === 'gmail' && this.transporter) {
        // Send email using Nodemailer
        const mailOptions = {
          from: `"${this.fromName}" <${this.fromEmail}>`,
          to: to,
          subject: subject,
          html: htmlContent,
          text: textContent
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
      }

      // Fallback for other providers
      return { success: true, messageId: 'mock-' + Date.now() };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  // Send OTP verification email
  async sendOTPEmail(user, otp) {
    const subject = 'Verify Your Email - OTP Code';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #65AAC3; text-align: center; margin-bottom: 30px;">Email Verification</h1>
          <p style="font-size: 16px; color: #333;">Hi ${user.name},</p>
          <p style="font-size: 16px; color: #333;">Thank you for signing up with PYRAMID E-Commerce!</p>
          <p style="font-size: 16px; color: #333;">Your verification code is:</p>
          
          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h2 style="color: #65AAC3; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h2>
          </div>
          
          <p style="font-size: 14px; color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #999; text-align: center;">
            Best regards,<br>
            <strong>The PYRAMID Team</strong>
          </p>
        </div>
      </div>
    `;
    const textContent = `Hi ${user.name}, Your verification code is: ${otp}. This code will expire in 10 minutes.`;

    return await this.sendEmail(user.email, subject, htmlContent, textContent);
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    const subject = `Welcome to ${this.fromName}!`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #65AAC3;">Welcome to PYRAMID!</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining PYRAMID E-Commerce. We're excited to have you as part of our community!</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our premium fashion collection</li>
          <li>Add items to your wishlist</li>
          <li>Enjoy secure checkout and fast delivery</li>
        </ul>
        <p>Start shopping now and discover your new favorite styles!</p>
        <a href="${process.env.FRONTEND_URL}" style="background: #65AAC3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Start Shopping</a>
        <p>Best regards,<br>The PYRAMID Team</p>
      </div>
    `;
    const textContent = `Welcome to PYRAMID! Hi ${user.name}, thank you for joining us. Start shopping at ${process.env.FRONTEND_URL}`;

    return await this.sendEmail(user.email, subject, htmlContent, textContent);
  }

  // Order confirmation email
  async sendOrderConfirmation(user, order) {
    const subject = `Order Confirmation - #${order.orderNumber}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #65AAC3;">Order Confirmed!</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for your order! We've received your order and it's being processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
          <p><strong>Payment Status:</strong> ${order.isPaid ? 'Paid' : 'Pending'}</p>
        </div>

        <h3>Items Ordered:</h3>
        <ul>
          ${order.orderItems.map(item => `
            <li>${item.name} - Quantity: ${item.quantity} - ₹${item.price}</li>
          `).join('')}
        </ul>

        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>The PYRAMID Team</p>
      </div>
    `;
    const textContent = `Order Confirmed! Order #${order.orderNumber} for ₹${order.totalPrice} has been received and is being processed.`;

    return await this.sendEmail(user.email, subject, htmlContent, textContent);
  }

  // Order status update email
  async sendOrderStatusUpdate(user, order, newStatus) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      processing: 'Your order is currently being processed.',
      shipped: 'Great news! Your order has been shipped.',
      delivered: 'Your order has been delivered successfully.',
      cancelled: 'Your order has been cancelled.'
    };

    const subject = `Order Update - #${order.orderNumber}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #65AAC3;">Order Update</h1>
        <p>Hi ${user.name},</p>
        <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Status:</strong> ${newStatus.toUpperCase()}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
        </div>

        ${newStatus === 'shipped' ? `
          <p>Your order is on its way! You should receive it within 3-5 business days.</p>
        ` : ''}

        <p>Thank you for shopping with PYRAMID!</p>
        <p>Best regards,<br>The PYRAMID Team</p>
      </div>
    `;
    const textContent = `Order Update: Order #${order.orderNumber} status is now ${newStatus}.`;

    return await this.sendEmail(user.email, subject, htmlContent, textContent);
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    console.log('📧 Sending password reset email to:', user.email);
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/reset-password.html?token=${resetToken}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #65AAC3;">Password Reset</h1>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset for your PYRAMID account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background: #65AAC3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
        <p>This link will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>The PYRAMID Team</p>
      </div>
    `;
    const textContent = `Password reset requested. Visit: ${resetUrl}`;

    return await this.sendEmail(user.email, subject, htmlContent, textContent);
  }

  // Admin notification email
  async sendAdminNotification(subject, message, data = {}) {
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@pyramid.com'];
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #65AAC3;">Admin Notification</h1>
        <p>${message}</p>
        ${Object.keys(data).length > 0 ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Details:</h3>
            ${Object.entries(data).map(([key, value]) => `
              <p><strong>${key}:</strong> ${value}</p>
            `).join('')}
          </div>
        ` : ''}
        <p>Please check the admin panel for more details.</p>
      </div>
    `;

    const promises = adminEmails.map(email => 
      this.sendEmail(email.trim(), subject, htmlContent, message)
    );

    return await Promise.all(promises);
  }

  // Low stock alert
  async sendLowStockAlert(product) {
    const subject = `Low Stock Alert - ${product.name}`;
    const message = `Product "${product.name}" is running low on stock. Current stock: ${product.stock}`;
    
    return await this.sendAdminNotification(subject, message, {
      'Product Name': product.name,
      'Current Stock': product.stock,
      'Product ID': product._id,
      'Category': product.category
    });
  }

  // New order notification for admin
  async sendNewOrderNotification(order, user) {
    const subject = `New Order Received - #${order.orderNumber}`;
    const message = `A new order has been placed by ${user.name}.`;
    
    return await this.sendAdminNotification(subject, message, {
      'Order Number': order.orderNumber,
      'Customer': user.name,
      'Email': user.email,
      'Total Amount': `₹${order.totalPrice}`,
      'Items': order.orderItems.length,
      'Payment Status': order.isPaid ? 'Paid' : 'Pending'
    });
  }
}

module.exports = new EmailService();