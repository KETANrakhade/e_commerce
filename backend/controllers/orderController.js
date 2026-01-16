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
    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="orders_${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add header
    doc.fontSize(20).text('Orders Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    // Add filters info if any
    if (status || startDate || endDate) {
      doc.moveDown();
      doc.fontSize(10).text('Filters Applied:', { underline: true });
      if (status) doc.text(`Status: ${status}`);
      if (startDate) doc.text(`Start Date: ${new Date(startDate).toLocaleDateString()}`);
      if (endDate) doc.text(`End Date: ${new Date(endDate).toLocaleDateString()}`);
    }
    
    doc.moveDown();
    doc.fontSize(12).text(`Total Orders: ${orders.length}`, { align: 'left' });
    doc.moveDown();
    
    // Handle empty orders
    if (!orders || orders.length === 0) {
      doc.fontSize(14).text('No orders found.', { align: 'center' });
      doc.end();
      return;
    }
    
    // Add table header
    const tableTop = doc.y;
    const colWidths = {
      orderNo: 80,
      customer: 120,
      status: 70,
      price: 70,
      payment: 60,
      date: 80
    };
    
    let currentY = tableTop;
    
    // Draw header row
    doc.fontSize(9).fillColor('#000');
    doc.rect(50, currentY, 495, 20).fillAndStroke('#e0e0e0', '#000');
    
    doc.fillColor('#000');
    doc.text('Order #', 55, currentY + 5, { width: colWidths.orderNo, align: 'left' });
    doc.text('Customer', 135, currentY + 5, { width: colWidths.customer, align: 'left' });
    doc.text('Status', 255, currentY + 5, { width: colWidths.status, align: 'left' });
    doc.text('Total', 325, currentY + 5, { width: colWidths.price, align: 'right' });
    doc.text('Payment', 395, currentY + 5, { width: colWidths.payment, align: 'center' });
    doc.text('Date', 455, currentY + 5, { width: colWidths.date, align: 'left' });
    
    currentY += 25;
    
    // Add orders data
    orders.forEach((order, index) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
        
        // Redraw header on new page
        doc.rect(50, currentY, 495, 20).fillAndStroke('#e0e0e0', '#000');
        doc.fillColor('#000');
        doc.text('Order #', 55, currentY + 5, { width: colWidths.orderNo, align: 'left' });
        doc.text('Customer', 135, currentY + 5, { width: colWidths.customer, align: 'left' });
        doc.text('Status', 255, currentY + 5, { width: colWidths.status, align: 'left' });
        doc.text('Total', 325, currentY + 5, { width: colWidths.price, align: 'right' });
        doc.text('Payment', 395, currentY + 5, { width: colWidths.payment, align: 'center' });
        doc.text('Date', 455, currentY + 5, { width: colWidths.date, align: 'left' });
        currentY += 25;
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.rect(50, currentY - 2, 495, 20).fill('#f9f9f9');
      }
      
      doc.fillColor('#000');
      doc.fontSize(8);
      
      const orderNo = order.orderNumber || 'N/A';
      const customerName = order.user?.name || 'N/A';
      const orderStatus = order.status || 'N/A';
      const totalPrice = order.totalPrice ? `₹${order.totalPrice.toFixed(2)}` : '₹0.00';
      const paymentStatus = order.isPaid ? 'Paid' : 'Unpaid';
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
      
      doc.text(orderNo, 55, currentY, { width: colWidths.orderNo, align: 'left' });
      doc.text(customerName, 135, currentY, { width: colWidths.customer, align: 'left', ellipsis: true });
      doc.text(orderStatus, 255, currentY, { width: colWidths.status, align: 'left' });
      doc.text(totalPrice, 325, currentY, { width: colWidths.price, align: 'right' });
      doc.text(paymentStatus, 395, currentY, { width: colWidths.payment, align: 'center' });
      doc.text(orderDate, 455, currentY, { width: colWidths.date, align: 'left' });
      
      currentY += 20;
    });
    
    // Add summary at the bottom
    doc.moveDown(2);
    currentY = doc.y + 20;
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const paidOrders = orders.filter(order => order.isPaid).length;
    
    doc.fontSize(10).fillColor('#000');
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 50, currentY);
    doc.text(`Paid Orders: ${paidOrders} / ${orders.length}`, 50, currentY + 15);
    
    // Add footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#666');
      doc.text(
        `Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }
    
    // Finalize PDF
    doc.end();
    
  } else if (format === 'csv') {
    // CSV export (keeping as backup option)
    if (!orders || orders.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      res.send('Order Number,Customer Name,Customer Email,Status,Total Price,Payment Status,Created Date,Items Count\n');
      return;
    }

    const csvData = orders.map(order => ({
      'Order Number': order.orderNumber || 'N/A',
      'Customer Name': order.user?.name || 'N/A',
      'Customer Email': order.user?.email || 'N/A',
      'Status': order.status || 'N/A',
      'Total Price': order.totalPrice || 0,
      'Payment Status': order.isPaid ? 'Paid' : 'Unpaid',
      'Created Date': order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : 'N/A',
      'Items Count': order.orderItems?.length || 0
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

module.exports = {
  createOrder,
  getMyOrders,
  updateOrderToPaid,
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  exportOrders
};