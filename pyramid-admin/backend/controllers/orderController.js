const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const search = req.query.search || '';
  const status = req.query.status || '';
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Build query
  let query = {};
  
  if (search) {
    // Search by order number or customer email/name
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    
    const userIds = users.map(user => user._id);
    
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { user: { $in: userIds } }
    ];
  }
  
  if (status) {
    query.status = status;
  }
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const count = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('orderItems.productId', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  // Get order statuses for filter
  const statuses = await Order.distinct('status');

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
        limit: pageSize
      },
      statuses
    }
  });
});

// @desc    Get single order details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone address')
    .populate('orderItems.productId', 'name images');

  if (order) {
    res.json({ success: true, data: order });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    
    // Update delivery status if delivered
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    
    res.json({ 
      success: true, 
      data: updatedOrder,
      message: `Order status updated to ${status}` 
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const processingOrders = await Order.countDocuments({ status: 'processing' });
  const shippedOrders = await Order.countDocuments({ status: 'shipped' });
  const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
  const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

  // Revenue statistics
  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  const monthlyRevenue = await Order.aggregate([
    { 
      $match: { 
        isPaid: true,
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }
    },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      revenue: {
        total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthly: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0
      }
    }
  });
});

// @desc    Export orders
// @route   GET /api/admin/orders/export
// @access  Private/Admin
const exportOrders = asyncHandler(async (req, res) => {
  const { format = 'pdf', startDate, endDate, status, groupBy = 'none' } = req.query;

  let query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('orderItems.productId', 'name')
    .sort({ createdAt: -1 });

  if (format === 'pdf') {
    try {
      // Generate Enhanced PDF with Perfect Alignment
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      
      // Set response headers for PDF
      const dateStr = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="orders_report_${dateStr}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');
      
      // Handle PDF errors
      doc.on('error', (err) => {
        console.error('PDF generation error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'PDF generation failed' });
        }
      });
      
      // Handle response errors
      res.on('error', (err) => {
        console.error('Response error:', err);
        try {
          if (doc && !doc.destroyed) {
            doc.destroy();
          }
        } catch (destroyErr) {
          console.error('Error destroying PDF:', destroyErr);
        }
      });
      
      res.on('close', () => {
        if (!res.writableEnded) {
          try {
            if (doc && !doc.destroyed) {
              doc.destroy();
            }
          } catch (destroyErr) {
            console.error('Error destroying PDF on close:', destroyErr);
          }
        }
      });
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Clean Header Design
      let currentY = 60;
    
      // Main Title
      doc.fillColor('#2c3e50').fontSize(24).font('Helvetica-Bold');
      doc.text('PYRAMID FASHION', 40, currentY, { width: 515, align: 'center' });
      currentY += 30;
      
      // Subtitle
      doc.fontSize(16).font('Helvetica');
      doc.text('Orders Export Report', 40, currentY, { width: 515, align: 'center' });
      currentY += 25;
      
      // Decorative line
      doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#3498db').lineWidth(2).stroke();
      currentY += 20;
      
      // Report metadata
      const reportDate = new Date();
      const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', { 
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          timeZone: 'Asia/Kolkata'
        });
      };
      
      doc.fillColor('#666666').fontSize(11).font('Helvetica');
      doc.text(`Generated on: ${formatDate(reportDate)}`, 40, currentY, { width: 515, align: 'center' });
      currentY += 15;
      doc.text(`Report Time: ${reportDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 40, currentY, { width: 515, align: 'center' });
      currentY += 25;
      
      // Filters Section (if any)
      if (status || startDate || endDate) {
        doc.rect(40, currentY, 515, 60).fillAndStroke('#f8f9fa', '#dee2e6');
        doc.fillColor('#2c3e50').fontSize(12).font('Helvetica-Bold');
        doc.text('Applied Filters', 50, currentY + 10);
        
        doc.fontSize(10).font('Helvetica').fillColor('#666666');
        let filterY = currentY + 25;
        
        if (status) {
          doc.text(`Status: ${status.toUpperCase()}`, 50, filterY);
          filterY += 12;
        }
        if (startDate) {
          doc.text(`From: ${new Date(startDate).toLocaleDateString('en-IN')}`, 50, filterY);
          filterY += 12;
        }
        if (endDate) {
          doc.text(`To: ${new Date(endDate).toLocaleDateString('en-IN')}`, 50, filterY);
        }
        
        currentY += 70;
      }
      
      // Summary Statistics Box
      const totalRevenue = orders.reduce((sum, order) => {
        const price = Number(order.totalPrice) || 0;
        return sum + (isNaN(price) ? 0 : price);
      }, 0);
      const paidOrders = orders.filter(order => order.isPaid === true).length;
      
      doc.rect(40, currentY, 515, 80).fillAndStroke('#e8f5e8', '#27ae60');
      doc.fillColor('#27ae60').fontSize(14).font('Helvetica-Bold');
      doc.text('Report Summary', 50, currentY + 10);
      
      doc.fontSize(11).font('Helvetica').fillColor('#2c3e50');
      const summaryY = currentY + 30;
      
      // Summary data in organized layout
      doc.text(`Total Orders: ${orders.length}`, 50, summaryY);
      doc.text(`Paid Orders: ${paidOrders}`, 200, summaryY);
      doc.text(`Pending: ${orders.length - paidOrders}`, 350, summaryY);
      
      doc.text(`Total Revenue: Rs.${totalRevenue.toLocaleString('en-IN')}`, 50, summaryY + 15);
      doc.text(`Avg Order: Rs.${(totalRevenue/orders.length || 0).toLocaleString('en-IN')}`, 200, summaryY + 15);
      
      const outstanding = orders
        .filter(o => !o.isPaid)
        .reduce((sum, o) => {
          const price = Number(o.totalPrice) || 0;
          return sum + (isNaN(price) ? 0 : price);
        }, 0);
      doc.text(`Outstanding: Rs.${outstanding.toLocaleString('en-IN')}`, 350, summaryY + 15);
      
      currentY += 90;
      
      // Handle empty orders
      if (!orders || orders.length === 0) {
        doc.fontSize(16).fillColor('#e74c3c').text('No orders found matching the criteria.', 40, currentY, { width: 515, align: 'center' });
        currentY += 20;
        doc.fontSize(12).fillColor('#7f8c8d').text('Try adjusting your filters or date range.', 40, currentY, { width: 515, align: 'center' });
        doc.end();
        return;
      }
      
      // Clean Table Design with Proper Spacing
      const drawTableHeader = (y) => {
        // Header background
        doc.rect(40, y, 515, 40).fillAndStroke('#2c3e50', '#2c3e50');
        
        doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
        
        // Column headers with proper alignment
        doc.text('Order ID', 50, y + 15, { width: 80, align: 'left' });
        doc.text('Customer', 135, y + 15, { width: 100, align: 'left' });
        doc.text('Status', 240, y + 15, { width: 80, align: 'center' });
        doc.text('Payment', 325, y + 15, { width: 70, align: 'center' });
        doc.text('Amount', 400, y + 15, { width: 80, align: 'right' });
        doc.text('Date', 485, y + 15, { width: 65, align: 'center' });
        
        return y + 40;
      };
      
      const drawOrderRow = (order, index, y) => {
        const rowHeight = 35;
        
        // Alternate row colors
        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(40, y, 515, rowHeight).fillAndStroke(bgColor, '#e9ecef');
        
        // Status colors
        const statusColors = {
          'pending': '#f39c12',
          'confirmed': '#3498db', 
          'processing': '#17a2b8',
          'shipped': '#6c757d',
          'delivered': '#28a745',
          'cancelled': '#dc3545'
        };
        
        // Format data with safety checks
        const orderID = (order.orderNumber || order._id?.toString() || 'N/A').toString().substring(0, 12);
        const customerName = ((order.user?.name || order.user?.email || 'N/A') || 'N/A').toString().substring(0, 14);
        const orderStatus = (order.status || 'N/A').toString();
        const totalPrice = order.totalPrice ? `Rs.${Number(order.totalPrice).toLocaleString('en-IN')}` : 'Rs.0';
        const paymentStatus = order.isPaid ? 'Paid' : 'Unpaid';
        
        let orderDate = 'N/A';
        try {
          if (order.createdAt) {
            const date = new Date(order.createdAt);
            if (!isNaN(date.getTime())) {
              orderDate = date.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              });
            }
          }
        } catch (dateErr) {
          console.warn('Error formatting date:', dateErr);
          orderDate = 'N/A';
        }
        
        // Text positioning (vertically centered)
        const textY = y + (rowHeight / 2) - 4;
        
        // Draw data
        doc.fillColor('#2c3e50').fontSize(10).font('Helvetica');
        doc.text(orderID, 50, textY, { width: 80, align: 'left' });
        doc.text(customerName, 135, textY, { width: 100, align: 'left' });
        
        // Status with color
        doc.fillColor(statusColors[orderStatus.toLowerCase()] || '#6c757d');
        doc.text(orderStatus.toUpperCase(), 240, textY, { width: 80, align: 'center' });
        
        // Payment status with color
        doc.fillColor(order.isPaid ? '#28a745' : '#dc3545');
        doc.text(paymentStatus, 325, textY, { width: 70, align: 'center' });
        
        // Amount and date
        doc.fillColor('#2c3e50');
        doc.text(totalPrice, 400, textY, { width: 80, align: 'right' });
        doc.text(orderDate, 485, textY, { width: 65, align: 'center' });
        
        return y + rowHeight;
      };
      
      // Track pages for footer
      let currentPageNum = 1;
      let totalPagesEstimate = 1;
      
      // Estimate total pages based on order count
      const estimatedRowsPerPage = 15;
      totalPagesEstimate = Math.max(1, Math.ceil(orders.length / estimatedRowsPerPage));
      
      // Helper function to add footer to current page
      const addFooter = (pageNum, totalPages) => {
        const pageHeight = doc.page.height;
        const footerY = pageHeight - 80;
        
        // Save current Y position
        const savedY = doc.y;
        
        // Footer line
        doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#bdc3c7').lineWidth(1).stroke();
        
        // Footer content
        doc.fontSize(9).fillColor('#7f8c8d').font('Helvetica');
        
        // Left side
        doc.text(`Pyramid Fashion - Orders Report`, 40, footerY + 10, { width: 200, align: 'left' });
        doc.text(`Generated: ${formatDate(reportDate)}`, 40, footerY + 25, { width: 200, align: 'left' });
        
        // Center - show page number with total
        doc.text(`Page ${pageNum} of ${totalPages}`, 0, footerY + 10, { width: 595, align: 'center' });
        doc.text('Confidential Document', 0, footerY + 25, { width: 595, align: 'center' });
        
        // Right side
        doc.text(`Total: ${orders.length} orders`, 355, footerY + 10, { width: 200, align: 'right' });
        doc.text(`Rs.${totalRevenue.toLocaleString('en-IN')}`, 355, footerY + 25, { width: 200, align: 'right' });
        
        // Restore Y position
        doc.y = savedY;
      };
      
      let tableY = drawTableHeader(currentY);
      
      // Render orders with proper spacing
      orders.forEach((order, index) => {
        try {
          if (tableY > 700) { // Check for page break
            // Add footer to current page before adding new page
            addFooter(currentPageNum, totalPagesEstimate);
            
            doc.addPage();
            currentPageNum++;
            totalPagesEstimate = Math.max(totalPagesEstimate, currentPageNum);
            tableY = drawTableHeader(60);
          }
          tableY = drawOrderRow(order, index, tableY);
        } catch (rowErr) {
          console.error(`Error rendering order at index ${index}:`, rowErr);
          // Continue with next order even if one fails
        }
      });
      
      // Add footer to last page
      const finalPageCount = currentPageNum;
      addFooter(currentPageNum, finalPageCount);
      
      // Finalize PDF with error handling
      // Note: We don't try to update page numbers after content is written
      // to avoid the "switchToPage out of bounds" error
      doc.end();
      
    } catch (error) {
      console.error('PDF generation error:', error);
      
      // Clean up document if it exists
      try {
        if (typeof doc !== 'undefined' && doc && !doc.destroyed) {
          doc.destroy();
        }
      } catch (cleanupErr) {
        console.error('Error during cleanup:', cleanupErr);
      }
      
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
      } else {
        console.error('PDF generation failed after headers were sent:', error);
      }
    }
    return;
  } else if (format === 'csv') {
      
      // Set response headers for PDF
      const dateStr = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="orders_report_${dateStr}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');
      
      // Handle PDF errors
      doc.on('error', (err) => {
        console.error('PDF generation error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'PDF generation failed' });
        }
      });
      
      // Pipe PDF to response with error handling
      doc.pipe(res);
    
    // Clean Header Design
    let currentY = 60;
    
    // Main Title
    doc.fillColor('#2c3e50').fontSize(24).font('Helvetica-Bold');
    doc.text('PYRAMID FASHION', 40, currentY, { width: 515, align: 'center' });
    currentY += 30;
    
    // Subtitle
    doc.fontSize(16).font('Helvetica');
    doc.text('Orders Export Report', 40, currentY, { width: 515, align: 'center' });
    currentY += 25;
    
    // Decorative line
    doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#3498db').lineWidth(2).stroke();
    currentY += 20;
    
    // Report metadata
    const reportDate = new Date();
    const formatDate = (date) => {
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    };
    
    doc.fillColor('#666666').fontSize(11).font('Helvetica');
    doc.text(`Generated on: ${formatDate(reportDate)}`, 40, currentY, { width: 515, align: 'center' });
    currentY += 15;
    doc.text(`Report Time: ${reportDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 40, currentY, { width: 515, align: 'center' });
    currentY += 25;
    
    // Filters Section (if any)
    if (status || startDate || endDate) {
      doc.rect(40, currentY, 515, 60).fillAndStroke('#f8f9fa', '#dee2e6');
      doc.fillColor('#2c3e50').fontSize(12).font('Helvetica-Bold');
      doc.text('Applied Filters', 50, currentY + 10);
      
      doc.fontSize(10).font('Helvetica').fillColor('#666666');
      let filterY = currentY + 25;
      
      if (status) {
        doc.text(`Status: ${status.toUpperCase()}`, 50, filterY);
        filterY += 12;
      }
      if (startDate) {
        doc.text(`From: ${new Date(startDate).toLocaleDateString('en-IN')}`, 50, filterY);
        filterY += 12;
      }
      if (endDate) {
        doc.text(`To: ${new Date(endDate).toLocaleDateString('en-IN')}`, 50, filterY);
      }
      
      currentY += 70;
    }
    
    // Summary Statistics Box
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const paidOrders = orders.filter(order => order.isPaid).length;
    
    doc.rect(40, currentY, 515, 80).fillAndStroke('#e8f5e8', '#27ae60');
    doc.fillColor('#27ae60').fontSize(14).font('Helvetica-Bold');
    doc.text('Report Summary', 50, currentY + 10);
    
    doc.fontSize(11).font('Helvetica').fillColor('#2c3e50');
    const summaryY = currentY + 30;
    
    // Summary data in organized layout
    doc.text(`Total Orders: ${orders.length}`, 50, summaryY);
    doc.text(`Paid Orders: ${paidOrders}`, 200, summaryY);
    doc.text(`Pending: ${orders.length - paidOrders}`, 350, summaryY);
    
    doc.text(`Total Revenue: Rs.${totalRevenue.toLocaleString('en-IN')}`, 50, summaryY + 15);
    doc.text(`Avg Order: Rs.${(totalRevenue/orders.length || 0).toLocaleString('en-IN')}`, 200, summaryY + 15);
    doc.text(`Outstanding: Rs.${(orders.filter(o => !o.isPaid).reduce((sum, o) => sum + (o.totalPrice || 0), 0)).toLocaleString('en-IN')}`, 350, summaryY + 15);
    
    currentY += 90;
    
    // Handle empty orders
    if (!orders || orders.length === 0) {
      doc.fontSize(16).fillColor('#e74c3c').text('No orders found matching the criteria.', 40, currentY, { width: 515, align: 'center' });
      currentY += 20;
      doc.fontSize(12).fillColor('#7f8c8d').text('Try adjusting your filters or date range.', 40, currentY, { width: 515, align: 'center' });
      doc.end();
      return;
    }
    
    // Clean Table Design with Proper Spacing
    const drawTableHeader = (y) => {
      // Header background
      doc.rect(40, y, 515, 40).fillAndStroke('#2c3e50', '#2c3e50');
      
      doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
      
      // Column headers with proper alignment
      doc.text('Order ID', 50, y + 15, { width: 80, align: 'left' });
      doc.text('Customer', 135, y + 15, { width: 100, align: 'left' });
      doc.text('Status', 240, y + 15, { width: 80, align: 'center' });
      doc.text('Payment', 325, y + 15, { width: 70, align: 'center' });
      doc.text('Amount', 400, y + 15, { width: 80, align: 'right' });
      doc.text('Date', 485, y + 15, { width: 65, align: 'center' });
      
      return y + 40;
    };
    
    const drawOrderRow = (order, index, y) => {
      const rowHeight = 35; // Increased row height for better spacing
      
      // Alternate row colors
      const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      doc.rect(40, y, 515, rowHeight).fillAndStroke(bgColor, '#e9ecef');
      
      // Status colors
      const statusColors = {
        'pending': '#f39c12',
        'confirmed': '#3498db', 
        'processing': '#17a2b8',
        'shipped': '#6c757d',
        'delivered': '#28a745',
        'cancelled': '#dc3545'
      };
      
      // Format data
      const orderID = (order.orderNumber || 'N/A').substring(0, 12);
      const customerName = (order.user?.name || 'N/A').substring(0, 14);
      const orderStatus = order.status || 'N/A';
      const totalPrice = order.totalPrice ? `Rs.${order.totalPrice.toLocaleString('en-IN')}` : 'Rs.0';
      const paymentStatus = order.isPaid ? 'Paid' : 'Unpaid';
      const orderDate = order.createdAt ? 
        new Date(order.createdAt).toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }) : 'N/A';
      
      // Text positioning (vertically centered)
      const textY = y + (rowHeight / 2) - 4;
      
      // Draw data
      doc.fillColor('#2c3e50').fontSize(10).font('Helvetica');
      doc.text(orderID, 50, textY, { width: 80, align: 'left' });
      doc.text(customerName, 135, textY, { width: 100, align: 'left' });
      
      // Status with color
      doc.fillColor(statusColors[orderStatus.toLowerCase()] || '#6c757d');
      doc.text(orderStatus.toUpperCase(), 240, textY, { width: 80, align: 'center' });
      
      // Payment status with color
      doc.fillColor(order.isPaid ? '#28a745' : '#dc3545');
      doc.text(paymentStatus, 325, textY, { width: 70, align: 'center' });
      
      // Amount and date
      doc.fillColor('#2c3e50');
      doc.text(totalPrice, 400, textY, { width: 80, align: 'right' });
      doc.text(orderDate, 485, textY, { width: 65, align: 'center' });
      
      return y + rowHeight;
    };
    
    let tableY = drawTableHeader(currentY);
    
    // Track pages for footer
    let currentPageNum = 1;
    let totalPagesEstimate = 1;
    
    // Estimate total pages based on order count
    const estimatedRowsPerPage = 15;
    totalPagesEstimate = Math.max(1, Math.ceil(orders.length / estimatedRowsPerPage));
    
    // Helper function to add footer to current page
    const addFooter = (pageNum, totalPages) => {
      const pageHeight = doc.page.height;
      const footerY = pageHeight - 80;
      
      // Save current Y position
      const savedY = doc.y;
      
      // Footer line
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#bdc3c7').lineWidth(1).stroke();
      
      // Footer content
      doc.fontSize(9).fillColor('#7f8c8d').font('Helvetica');
      
      // Left side
      doc.text(`Pyramid Fashion - Orders Report`, 40, footerY + 10, { width: 200, align: 'left' });
      doc.text(`Generated: ${formatDate(reportDate)}`, 40, footerY + 25, { width: 200, align: 'left' });
      
      // Center - show page number with total
      doc.text(`Page ${pageNum} of ${totalPages}`, 0, footerY + 10, { width: 595, align: 'center' });
      doc.text('Confidential Document', 0, footerY + 25, { width: 595, align: 'center' });
      
      // Right side
      doc.text(`Total: ${orders.length} orders`, 355, footerY + 10, { width: 200, align: 'right' });
      doc.text(`Rs.${totalRevenue.toLocaleString('en-IN')}`, 355, footerY + 25, { width: 200, align: 'right' });
      
      // Restore Y position
      doc.y = savedY;
    };
    
    // Render orders with proper spacing
    orders.forEach((order, index) => {
      try {
        if (tableY > 700) { // Check for page break
          // Add footer to current page before adding new page
          addFooter(currentPageNum, totalPagesEstimate);
          
          doc.addPage();
          currentPageNum++;
          totalPagesEstimate = Math.max(totalPagesEstimate, currentPageNum);
          tableY = drawTableHeader(60);
        }
        tableY = drawOrderRow(order, index, tableY);
      } catch (rowErr) {
        console.error(`Error rendering order at index ${index}:`, rowErr);
        // Continue with next order even if one fails
      }
    });
    
    // Add footer to last page
    const finalPageCount = currentPageNum;
    addFooter(currentPageNum, finalPageCount);
    
    // Finalize PDF with error handling
    // Note: We don't try to update page numbers after content is written
    // to avoid the "switchToPage out of bounds" error
    doc.end();
    
    } catch (error) {
      console.error('PDF generation error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'PDF generation failed', error: error.message });
      }
    }
    
  } else if (format === 'csv') {
    // Enhanced CSV export with new headers
    const csvData = orders.map(order => ({
      'Order ID': order.orderNumber || 'N/A',
      'Customer Name': order.user?.name || 'N/A',
      'Customer Email': order.user?.email || 'N/A',
      'Status': order.status || 'N/A',
      'Amount': order.totalPrice || 0,
      'Payment Status': order.isPaid ? 'Paid' : 'Unpaid',
      'Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }) : 'N/A',
      'Items Count': order.orderItems?.length || 0
    }));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders_${new Date().toISOString().split('T')[0]}.csv"`);
    
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header];
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(','))
    ].join('\n');
    
    res.send(csvContent);
  } else {
    // JSON export
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  }
});

module.exports = {
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrders
};