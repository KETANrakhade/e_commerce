const express = require('express');
const app = express();

app.use(express.json());

// Add CORS headers to allow requests from localhost:8080
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Simple test working!' });
});

// Test PDF export with real-looking data
app.get('/test-pdf', (req, res) => {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="perfect_alignment_demo.pdf"');
  
  doc.pipe(res);
  
  // Enhanced Header with Perfect Alignment
  doc.fillColor('#2c3e50');
  doc.fontSize(28).font('Helvetica-Bold').text('PYRAMID FASHION', { align: 'center' });
  doc.fontSize(18).font('Helvetica').text('Orders Export Report', { align: 'center' });
  
  // Add decorative line
  doc.moveTo(40, doc.y + 15).lineTo(555, doc.y + 15).strokeColor('#3498db').lineWidth(3).stroke();
  doc.moveDown(2);
  
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
  
  doc.fillColor('#34495e').fontSize(12);
  doc.text(`Generated on: ${formatDate(reportDate)}`, { align: 'center' });
  doc.text(`Report Time: ${reportDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`, { align: 'center' });
  doc.moveDown(1.5);
  
  // Summary Statistics Box
  doc.rect(40, doc.y, 515, 90).fillAndStroke('#e8f5e8', '#27ae60');
  doc.fillColor('#27ae60').fontSize(16).font('Helvetica-Bold');
  doc.text('Report Summary', 50, doc.y - 80);
  
  doc.fontSize(12).font('Helvetica').fillColor('#2c3e50');
  const summaryY = doc.y - 55;
  
  // Sample statistics
  doc.text(`Total Orders: 5`, 50, summaryY);
  doc.text(`Total Revenue: Rs.12,450.00`, 200, summaryY);
  doc.text(`Paid Orders: 4 (80.0%)`, 400, summaryY);
  
  doc.text(`Average Order Value: Rs.2,490.00`, 50, summaryY + 20);
  doc.text(`Pending Payment: 1`, 200, summaryY + 20);
  doc.text(`Outstanding: Rs.2,100.00`, 400, summaryY + 20);
  
  doc.y += 40;
  doc.moveDown(1.5);
  
  // Perfect Table Header
  const drawTableHeader = (y) => {
    doc.rect(40, y, 515, 32).fillAndStroke('#2c3e50', '#34495e');
    
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
    
    // Perfect alignment - FIXED HEADERS
    doc.text('Order ID', 45, y + 10, { width: 90, align: 'left' });
    doc.text('Customer', 140, y + 10, { width: 120, align: 'left' });
    doc.text('Status', 265, y + 10, { width: 70, align: 'center' });
    doc.text('Payment', 340, y + 10, { width: 70, align: 'center' });
    doc.text('Amount', 415, y + 10, { width: 80, align: 'right' });
    doc.text('Date', 500, y + 10, { width: 55, align: 'center' });
    
    doc.moveTo(40, y + 32).lineTo(555, y + 32).strokeColor('#bdc3c7').lineWidth(1).stroke();
    
    return y + 35;
  };
  
  const drawOrderRow = (orderData, index, y) => {
    const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
    doc.rect(40, y, 515, 25).fillAndStroke(bgColor, '#dee2e6');
    
    const statusColors = {
      'pending': '#f39c12',
      'confirmed': '#3498db', 
      'processing': '#17a2b8',
      'shipped': '#6c757d',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    
    doc.fillColor('#2c3e50').fontSize(10).font('Helvetica');
    
    // Perfect positioning
    doc.text(orderData.id, 45, y + 7, { width: 90, align: 'left' });
    doc.text(orderData.customer, 140, y + 7, { width: 120, align: 'left' });
    
    // Status with color
    doc.fillColor(statusColors[orderData.status.toLowerCase()] || '#6c757d');
    doc.text(orderData.status.toUpperCase(), 265, y + 7, { width: 70, align: 'center' });
    
    // Payment with color
    doc.fillColor(orderData.isPaid ? '#28a745' : '#dc3545');
    doc.text(orderData.payment, 340, y + 7, { width: 70, align: 'center' });
    
    // Amount and date
    doc.fillColor('#2c3e50');
    doc.text(orderData.amount, 415, y + 7, { width: 80, align: 'right' });
    doc.text(orderData.date, 500, y + 7, { width: 55, align: 'center' });
    
    return y + 25;
  };
  
  // Sample data showing the improvements
  const sampleOrders = [
    { id: 'ORD-2026-001', customer: 'Rajesh Kumar', status: 'delivered', payment: 'Paid', amount: 'Rs.2,450', date: '19/01/2026', isPaid: true },
    { id: 'ORD-2026-002', customer: 'Priya Sharma', status: 'processing', payment: 'Paid', amount: 'Rs.1,890', date: '19/01/2026', isPaid: true },
    { id: 'ORD-2026-003', customer: 'Amit Patel', status: 'confirmed', payment: 'Unpaid', amount: 'Rs.3,250', date: '18/01/2026', isPaid: false },
    { id: 'ORD-2026-004', customer: 'Sneha Gupta', status: 'shipped', payment: 'Paid', amount: 'Rs.1,675', date: '18/01/2026', isPaid: true },
    { id: 'ORD-2026-005', customer: 'Vikram Singh', status: 'pending', payment: 'Unpaid', amount: 'Rs.2,100', date: '17/01/2026', isPaid: false }
  ];
  
  let currentY = drawTableHeader(doc.y);
  
  // Draw sample orders
  sampleOrders.forEach((order, index) => {
    currentY = drawOrderRow(order, index, currentY);
  });
  
  // Add improvement notes
  doc.moveDown(2);
  currentY = doc.y + 20;
  
  doc.rect(40, currentY, 515, 100).fillAndStroke('#fff3cd', '#ffc107');
  doc.fillColor('#856404').fontSize(14).font('Helvetica-Bold');
  doc.text('✅ Improvements Applied', 50, currentY + 10);
  
  doc.fontSize(11).font('Helvetica').fillColor('#856404');
  doc.text('• Header changed from "Order #" to "Order ID"', 50, currentY + 30);
  doc.text('• Header changed from "Total" to "Amount"', 50, currentY + 45);
  doc.text('• Date format changed to DD/MM/YYYY (Indian standard)', 50, currentY + 60);
  doc.text('• Perfect column alignment with precise positioning', 50, currentY + 75);
  
  // Footer
  doc.moveTo(40, doc.page.height - 90).lineTo(555, doc.page.height - 90).strokeColor('#bdc3c7').lineWidth(1).stroke();
  
  doc.fontSize(9).fillColor('#7f8c8d').font('Helvetica');
  doc.text(`Pyramid Fashion - Perfect Alignment Demo`, 40, doc.page.height - 75);
  doc.text(`Generated: ${formatDate(reportDate)}`, 40, doc.page.height - 60);
  doc.text('Page 1 of 1', 0, doc.page.height - 75, { align: 'center' });
  doc.text('Perfect Alignment Achieved', 0, doc.page.height - 60, { align: 'center' });
  doc.text(`Demo Report`, 555, doc.page.height - 75, { align: 'right' });
  doc.text(`Rs.12,450`, 555, doc.page.height - 60, { align: 'right' });
  
  doc.end();
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Simple test server running on http://localhost:${PORT}`);
  console.log('Test routes:');
  console.log(`- http://localhost:${PORT}/test`);
  console.log(`- http://localhost:${PORT}/test-pdf`);
});