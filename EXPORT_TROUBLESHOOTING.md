# 🔧 Export PDF Troubleshooting Guide

## ❌ "PDF export failed: Failed to fetch"

This error means the browser cannot connect to the test server. Here's how to fix it:

### ✅ **Solution Steps:**

1. **Check if test server is running:**
   ```bash
   # The test server should be running on port 3333
   curl http://localhost:3333/test
   ```
   Should return: `{"message":"Simple test working!"}`

2. **If server is not running, start it:**
   ```bash
   cd pyramid-admin/backend
   node test-simple-server.js
   ```

3. **Check server status in browser:**
   - Visit: `http://localhost:8080/test-export-direct.html`
   - Look for "Server Status" - should show "Connected ✓"
   - If shows "Disconnected ✗", click "Test Server Connection"

4. **Test PDF generation directly:**
   - Open: `http://localhost:3333/test-pdf` in browser
   - Should automatically download a PDF file

### 🔍 **Common Issues:**

#### Issue 1: Port 3333 already in use
```bash
# Kill any process using port 3333
lsof -ti:3333 | xargs kill -9
# Then restart the test server
node test-simple-server.js
```

#### Issue 2: CORS (Cross-Origin) errors
- The test server now includes CORS headers
- If still having issues, try accessing the test page directly:
  `http://localhost:3333/test-pdf`

#### Issue 3: Browser blocking downloads
- Check if browser is blocking automatic downloads
- Allow downloads from localhost in browser settings

### 📊 **What the Test PDF Shows:**

When working correctly, the PDF will demonstrate:

✅ **Perfect Headers:**
- "Order ID" instead of "Order #"
- "Amount" instead of "Total"

✅ **Perfect Alignment:**
```
Order ID        Customer         Status      Payment    Amount      Date
ORD-2026-001   Rajesh Kumar     DELIVERED   Paid       ₹2,450     19/01/2026
ORD-2026-002   Priya Sharma     PROCESSING  Paid       ₹1,890     19/01/2026
```

✅ **Indian Formatting:**
- Date: DD/MM/YYYY format
- Currency: ₹ symbol with proper formatting
- Timezone: Asia/Kolkata (IST)

✅ **Professional Design:**
- Company branding: "PYRAMID FASHION"
- Color-coded status badges
- Enhanced summary statistics
- Perfect column positioning

### 🚀 **Quick Test Commands:**

```bash
# 1. Test server connection
curl http://localhost:3333/test

# 2. Test PDF generation
curl -I http://localhost:3333/test-pdf

# 3. Download PDF directly
curl -o test.pdf http://localhost:3333/test-pdf

# 4. Check running processes
ps aux | grep "test-simple-server"
```

### 📱 **Alternative Testing:**

If the web interface doesn't work, you can test directly:

1. **Command Line:**
   ```bash
   curl -o perfect_alignment.pdf http://localhost:3333/test-pdf
   open perfect_alignment.pdf  # macOS
   ```

2. **Browser Direct:**
   - Go to: `http://localhost:3333/test-pdf`
   - PDF should download automatically

### ✅ **Success Indicators:**

When everything is working:
- Server Status shows "Connected ✓"
- PDF downloads automatically
- File name: `perfect_alignment_demo_YYYY-MM-DD.pdf`
- PDF shows all requested improvements
- No console errors in browser developer tools

The test server is specifically designed to demonstrate the exact improvements you requested, with perfect alignment and all the header/date format changes.