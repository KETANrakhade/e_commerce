const express = require('express');
const router = express.Router();

console.log('Admin routes loaded!'); // Debug log

const {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  getRecentOrders,
  getSalesAnalytics
} = require('../controllers/adminController');
const {
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkProductAction
} = require('../controllers/productController');
const {
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrders
} = require('../controllers/orderController');
const {
  getAdminUsers,
  getUserById,
  updateUserStatus,
  getUserOrders,
  getUserStats
} = require('../controllers/userController');
const { adminProtect } = require('../middleware/adminAuth');

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

// Public routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/profile', adminProtect, getAdminProfile);
router.get('/stats', adminProtect, getDashboardStats);
router.get('/recent-orders', adminProtect, getRecentOrders);
router.get('/sales-analytics', adminProtect, getSalesAnalytics);

// Product management routes
router.get('/products', adminProtect, getAdminProducts);
router.get('/products/:id', adminProtect, getProductById);
router.post('/products', adminProtect, createProduct);
router.put('/products/:id', adminProtect, updateProduct);
router.delete('/products/:id', adminProtect, deleteProduct);
router.post('/products/bulk-action', adminProtect, bulkProductAction);

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

// Test route for export without authentication
router.get('/test/orders/export', async (req, res) => {
  try {
    const { format = 'pdf' } = req.query;
    
    // Import the Order model
    const Order = require('../models/orderModel');
    
    // Get orders without authentication
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.productId', 'name')
      .sort({ createdAt: -1 });

    if (format === 'pdf') {
      // Generate Enhanced PDF with Perfect Alignment
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      
      // Set response headers for PDF
      const dateStr = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="orders_report_${dateStr}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Enhanced Header with Perfect Alignment
      doc.fillColor('#2c3e50');
      doc.fontSize(28).font('Helvetica-Bold').text('PYRAMID FASHION', { align: 'center' });
      doc.fontSize(18).font('Helvetica').text('Orders Export Report', { align: 'center' });
      
      // Add decorative line
      doc.moveTo(40, doc.y + 15).lineTo(555, doc.y + 15).strokeColor('#3498db').lineWidth(3).stroke();
      doc.moveDown(2);
      
      // Report metadata with perfect formatting
      const reportDate = new Date();
      const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', { 
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          timeZone: 'Asia/Kolkata'
        });
      };
      
      doc.fillColor('#34495e').fontSize(12);
      doc.text(`Generated on: ${formatDate(reportDate)}`, { align: 'center' });
      doc.text(`Report Time: ${reportDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`, { align: 'center' });
      doc.moveDown(1.5);
      
      // Summary Statistics Box with Perfect Alignment
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      const paidOrders = orders.filter(order => order.isPaid).length;
      
      doc.rect(40, doc.y, 515, 90).fillAndStroke('#e8f5e8', '#27ae60');
      doc.fillColor('#27ae60').fontSize(16).font('Helvetica-Bold');
      doc.text('Report Summary', 50, doc.y - 80);
      
      doc.fontSize(12).font('Helvetica').fillColor('#2c3e50');
      const summaryY = doc.y - 55;
      
      // First row of summary
      doc.text(`Total Orders: ${orders.length}`, 50, summaryY);
      doc.text(`Total Revenue: Rs.${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 200, summaryY);
      doc.text(`Paid Orders: ${paidOrders} (${orders.length > 0 ? ((paidOrders/orders.length)*100).toFixed(1) : 0}%)`, 400, summaryY);
      
      // Second row of summary
      doc.text(`Average Order Value: Rs.${(totalRevenue/orders.length || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 50, summaryY + 20);
      doc.text(`Pending Payment: ${orders.length - paidOrders}`, 200, summaryY + 20);
      doc.text(`Outstanding: Rs.${(orders.filter(o => !o.isPaid).reduce((sum, o) => sum + (o.totalPrice || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 400, summaryY + 20);
      
      doc.y += 40;
      doc.moveDown(1.5);
      
      // Handle empty orders
      if (!orders || orders.length === 0) {
        doc.fontSize(18).fillColor('#e74c3c').text('No orders found matching the criteria.', { align: 'center' });
        doc.fontSize(14).fillColor('#7f8c8d').text('Try adjusting your filters or date range.', { align: 'center' });
        doc.end();
        return;
      }
      
      // Perfect Table Design with Precise Alignment
      const drawTableHeader = (y) => {
        // Header background with gradient effect
        doc.rect(40, y, 515, 32).fillAndStroke('#2c3e50', '#34495e');
        
        doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
        
        // Draw column headers with perfect alignment - FIXED HEADERS
        doc.text('Order ID', 45, y + 10, { width: 90, align: 'left' });
        doc.text('Customer', 140, y + 10, { width: 120, align: 'left' });
        doc.text('Status', 265, y + 10, { width: 70, align: 'center' });
        doc.text('Payment', 340, y + 10, { width: 70, align: 'center' });
        doc.text('Amount', 415, y + 10, { width: 80, align: 'right' });
        doc.text('Date', 500, y + 10, { width: 55, align: 'center' });
        
        // Add separator line
        doc.moveTo(40, y + 32).lineTo(555, y + 32).strokeColor('#bdc3c7').lineWidth(1).stroke();
        
        return y + 35;
      };
      
      const drawOrderRow = (order, index, y) => {
        // Alternate row colors with better contrast
        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(40, y, 515, 25).fillAndStroke(bgColor, '#dee2e6');
        
        // Status color coding
        const statusColors = {
          'pending': '#f39c12',
          'confirmed': '#3498db', 
          'processing': '#17a2b8',
          'shipped': '#6c757d',
          'delivered': '#28a745',
          'cancelled': '#dc3545'
        };
        
        doc.fillColor('#2c3e50').fontSize(10).font('Helvetica');
        
        // Format data with perfect alignment
        const orderID = (order.orderNumber || 'N/A').substring(0, 15);
        const customerName = (order.user?.name || 'Test Customer').substring(0, 18);
        const orderStatus = order.status || 'N/A';
        const totalPrice = order.totalPrice ? `Rs.${order.totalPrice.toLocaleString('en-IN')}` : 'Rs.0';
        const paymentStatus = order.isPaid ? 'Paid' : 'Unpaid';
        
        // Format date as DD/MM/YYYY
        const orderDate = order.createdAt ? 
          new Date(order.createdAt).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          }) : 'N/A';
        
        // Draw data with precise positioning
        doc.text(orderID, 45, y + 7, { width: 90, align: 'left' });
        doc.text(customerName, 140, y + 7, { width: 120, align: 'left' });
        
        // Status with color
        doc.fillColor(statusColors[orderStatus.toLowerCase()] || '#6c757d');
        doc.text(orderStatus.toUpperCase(), 265, y + 7, { width: 70, align: 'center' });
        
        // Payment status with color
        doc.fillColor(order.isPaid ? '#28a745' : '#dc3545');
        doc.text(paymentStatus, 340, y + 7, { width: 70, align: 'center' });
        
        // Amount and date
        doc.fillColor('#2c3e50');
        doc.text(totalPrice, 415, y + 7, { width: 80, align: 'right' });
        doc.text(orderDate, 500, y + 7, { width: 55, align: 'center' });
        
        return y + 25;
      };
      
      let currentY = drawTableHeader(doc.y);
      
      // Render orders
      orders.forEach((order, index) => {
        if (currentY > 720) {
          doc.addPage();
          currentY = drawTableHeader(60);
        }
        currentY = drawOrderRow(order, index, currentY);
      });
      
      // Enhanced Footer with perfect alignment
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        
        // Footer line
        doc.moveTo(40, doc.page.height - 90).lineTo(555, doc.page.height - 90).strokeColor('#bdc3c7').lineWidth(1).stroke();
        
        doc.fontSize(9).fillColor('#7f8c8d').font('Helvetica');
        doc.text(`Pyramid Fashion - Orders Report`, 40, doc.page.height - 75);
        doc.text(`Generated: ${formatDate(reportDate)}`, 40, doc.page.height - 60);
        doc.text(`Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 75, { align: 'center' });
        doc.text('Confidential Document', 0, doc.page.height - 60, { align: 'center' });
        doc.text(`Total: ${orders.length} orders`, 555, doc.page.height - 75, { align: 'right' });
        doc.text(`Rs.${totalRevenue.toLocaleString('en-IN')}`, 555, doc.page.height - 60, { align: 'right' });
      }
      
      // Finalize PDF
      doc.end();
      
    } else {
      // JSON response
      res.json({
        success: true,
        data: orders,
        count: orders.length
      });
    }
  } catch (error) {
    console.error('Test export error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Order management routes
router.get('/orders', adminProtect, getAdminOrders);
router.get('/orders/stats', adminProtect, getOrderStats);
router.get('/orders/export', adminProtect, exportOrders); // Re-enable authentication for production
router.get('/orders/export-test', exportOrders); // Test route without auth (keep for debugging)
router.get('/orders/:id', adminProtect, getOrderById);
router.put('/orders/:id/status', adminProtect, updateOrderStatus);

// User management routes
router.get('/users', adminProtect, getAdminUsers);
router.get('/users/stats', adminProtect, getUserStats);
router.get('/users/:id', adminProtect, getUserById);
router.get('/users/:id/orders', adminProtect, getUserOrders);
router.put('/users/:id/status', adminProtect, updateUserStatus);

module.exports = router;