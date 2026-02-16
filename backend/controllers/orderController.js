const asyncHandler = require('express-async-handler');
const orderService = require('../services/orderService');
const PDFDocument = require('pdfkit');

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = asyncHandler(async (req, res) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: req.query.search || '',
    status: req.query.status || '',
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    excludeCompleted: req.query.excludeCompleted === 'true' // Filter for pending orders only
  };

  const result = await orderService.getAllOrders(filters);
  
  const Order = require('../models/orderModel');
  const statuses = await Order.distinct('status');

  res.json({
    success: true,
    data: {
      orders: result.orders,
      pagination: result.pagination,
      statuses
    }
  });
});

// @desc    Get single order details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, null, true);
  res.json({ success: true, data: order });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updatedOrder = await orderService.updateOrderStatus(req.params.id, status);
  
  res.json({ 
    success: true, 
    data: updatedOrder,
    message: `Order status updated to ${status}` 
  });
});

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };
  
  const stats = await orderService.getOrderStats(filters);
  
  res.json({
    success: true,
    data: stats
  });
});

// @desc    Export orders
// @route   GET /api/admin/orders/export
// @access  Private/Admin
const exportOrders = asyncHandler(async (req, res) => {
  const { format = 'pdf', startDate, endDate, status } = req.query;

  const filters = { status, startDate, endDate };
  const orders = await orderService.exportOrders(filters);

  if (format === 'pdf') {
    try {
      // Validate orders data
      if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid orders data' 
        });
      }
      
      // Create a simple PDF without complex page management
      const doc = new PDFDocument({ 
        margin: 40, 
        size: 'A4'
      });
      
      // Set response headers for PDF
      const dateStr = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="orders_report_${dateStr}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');
      
      // Pipe PDF to response immediately
      doc.pipe(res);
      
      // Simple header
      doc.fontSize(20).text('PYRAMID FASHION', 40, 40, { align: 'center' });
      doc.fontSize(14).text('Orders Export Report', 40, 70, { align: 'center' });
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 90, { align: 'center' });
      
      let currentY = 120;
      
      // Summary
      const totalRevenue = orders.reduce((sum, order) => {
        const price = Number(order.totalPrice) || 0;
        return sum + (isNaN(price) ? 0 : price);
      }, 0);
      
      doc.fontSize(12).text(`Total Orders: ${orders.length}`, 40, currentY);
      currentY += 20;
      doc.text(`Total Revenue: Rs.${totalRevenue.toLocaleString('en-IN')}`, 40, currentY);
      currentY += 40;
      
      // Handle empty orders
      if (!orders || orders.length === 0) {
        doc.fontSize(14).text('No orders found matching the criteria.', 40, currentY);
        doc.end();
        return;
      }
      
      // Simple table header - Updated to match the image layout
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Order ID', 40, currentY);
      doc.text('Customer', 160, currentY);
      doc.text('Date', 280, currentY);
      doc.text('Amount', 360, currentY);
      doc.text('Payment', 450, currentY);
      currentY += 20;
      
      // Draw line under header
      doc.moveTo(40, currentY).lineTo(520, currentY).stroke();
      currentY += 10;
      
      // Simple order rows
      doc.font('Helvetica').fontSize(9);
      
      orders.forEach((order, index) => {
        try {
          // Check for page break (adjusted for taller rows)
          if (currentY > 720) {
            doc.addPage();
            currentY = 40;
            
            // Repeat header on new page - Updated layout
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Order ID', 40, currentY);
            doc.text('Customer', 160, currentY);
            doc.text('Date', 280, currentY);
            doc.text('Amount', 360, currentY);
            doc.text('Payment', 450, currentY);
            currentY += 20;
            doc.moveTo(40, currentY).lineTo(520, currentY).stroke();
            currentY += 10;
            doc.font('Helvetica').fontSize(9);
          }
          
          // Format data safely - Updated to match image layout
          const orderID = (order.orderNumber || order._id?.toString() || 'N/A').toString().substring(0, 20);
          
          // Customer info - name and email on separate lines
          const customerName = (order.user?.name || 'N/A').toString().substring(0, 20);
          const customerEmail = (order.user?.email || 'N/A').toString().substring(0, 25);
          
          const totalPrice = order.totalPrice ? `Rs. ${Number(order.totalPrice).toLocaleString('en-IN')}` : 'Rs. 0';
          
          // Payment status with proper formatting
          const paymentStatus = order.isPaid ? 'Paid' : 'Unpaid';
          
          let orderDate = 'N/A';
          try {
            if (order.createdAt) {
              const date = new Date(order.createdAt);
              if (!isNaN(date.getTime())) {
                // Format as "Jan 22, 2026" to match the image
                orderDate = date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
              }
            }
          } catch (dateErr) {
            orderDate = 'N/A';
          }
          
          // Draw row data with updated positions
          doc.text(orderID, 40, currentY);
          
          // Customer column - name and email
          doc.text(customerName, 160, currentY);
          doc.fontSize(8).fillColor('#666666');
          doc.text(customerEmail, 160, currentY + 10);
          doc.fontSize(9).fillColor('#000000');
          
          doc.text(orderDate, 280, currentY);
          doc.text(totalPrice, 360, currentY);
          
          // Payment status with color coding
          if (paymentStatus === 'Paid') {
            doc.fillColor('#28a745'); // Green for paid
          } else {
            doc.fillColor('#dc3545'); // Red for unpaid
          }
          doc.text(paymentStatus, 450, currentY);
          doc.fillColor('#000000'); // Reset to black
          
          currentY += 25; // Increased spacing for two-line customer info
          
        } catch (rowErr) {
          console.error(`Error rendering order at index ${index}:`, rowErr);
          // Continue with next order
        }
      });
      
      // Simple footer
      const pageHeight = doc.page.height;
      doc.fontSize(8).text(`Pyramid Fashion - Generated: ${new Date().toLocaleDateString()}`, 40, pageHeight - 40);
      
      // End the document
      doc.end();
      
    } catch (error) {
      console.error('PDF generation error:', error);
      
      // Send error response only if headers haven't been sent
      if (!res.headersSent) {
        try {
          res.status(500).json({ 
            success: false, 
            message: 'PDF generation failed', 
            error: error.message || 'Unknown error occurred'
          });
        } catch (responseErr) {
          console.error('Error sending error response:', responseErr);
        }
      }
    }
    
  } else if (format === 'csv') {
    // CSV export
    if (!orders || orders.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      res.send('Order ID,Customer Name,Customer Email,Date,Amount,Payment Status\n');
      return;
    }

    const csvData = orders.map(order => ({
      'Order ID': order.orderNumber || 'N/A',
      'Customer Name': order.user?.name || 'N/A',
      'Customer Email': order.user?.email || 'N/A',
      'Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) : 'N/A',
      'Amount': order.totalPrice || 0,
      'Payment Status': order.isPaid ? 'Paid' : 'Unpaid'
    }));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="orders_' + new Date().toISOString().split('T')[0] + '.csv"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ];
    
    res.send(csvRows.join('\n'));
  } else {
    // JSON export
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const createdOrder = await orderService.createOrder(req.user._id, req.body);
  res.status(201).json({ success: true, data: createdOrder });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    status: req.query.status || ''
  };
  
  const result = await orderService.getUserOrders(req.user._id, filters);
  res.json({ success: true, data: result.orders });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer?.email_address
  };
  
  const updatedOrder = await orderService.updateOrderToPaid(req.params.id, paymentResult);
  res.json({ success: true, data: updatedOrder });
});

// @desc    Track order by ID
// @route   GET /api/orders/track/:id
// @access  Private
const trackOrder = asyncHandler(async (req, res) => {
  const Order = require('../models/orderModel');
  
  const order = await Order.findOne({
    $or: [
      { orderNumber: req.params.id },
      { _id: req.params.id }
    ],
    user: req.user._id
  }).populate('orderItems.productId', 'name image');
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  res.json({ success: true, data: order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const Order = require('../models/orderModel');
  
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if order can be cancelled
  if (order.status === 'delivered' || order.status === 'cancelled') {
    res.status(400);
    throw new Error(`Cannot cancel order with status: ${order.status}`);
  }
  
  if (order.status === 'shipped') {
    res.status(400);
    throw new Error('Cannot cancel order that has already been shipped. Please contact customer support.');
  }
  
  order.status = 'cancelled';
  await order.save();
  
  res.json({ 
    success: true, 
    data: order,
    message: 'Order cancelled successfully' 
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  updateOrderToPaid,
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrders,
  trackOrder,
  cancelOrder
};