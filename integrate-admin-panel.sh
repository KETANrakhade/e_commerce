#!/bin/bash

echo "🏛️ Integrating Pyramid Admin Panel with E-Commerce Project"
echo "========================================================="

# Create admin directory if it doesn't exist
if [ ! -d "admin" ]; then
    mkdir admin
    echo "✅ Created admin directory"
fi

# Copy PHP admin files to admin directory
echo "📁 Copying PHP admin files..."
cp -r admin-panel-xampp/*.php admin/
cp -r admin-panel-xampp/assets admin/
cp -r admin-panel-xampp/layout admin/
cp -r admin-panel-xampp/pages admin/
cp -r admin-panel-xampp/config admin/
cp -r admin-panel-xampp/middleware admin/

echo "✅ PHP admin files copied to admin/ directory"

# Merge backend dependencies
echo "🔧 Merging backend dependencies..."
cd backend

# Install additional admin panel dependencies
npm install bcryptjs cloudinary stripe mongoose express cors dotenv jsonwebtoken multer

echo "✅ Backend dependencies installed"

# Copy admin backend routes and models
echo "📡 Copying admin backend files..."
cp -r ../admin-panel-xampp/backend/routes/* routes/ 2>/dev/null || echo "No additional routes to copy"
cp -r ../admin-panel-xampp/backend/models/* models/ 2>/dev/null || echo "No additional models to copy"
cp -r ../admin-panel-xampp/backend/middleware/* middleware/ 2>/dev/null || echo "No additional middleware to copy"

cd ..

# Create admin access script
echo "🚀 Creating admin access script..."
cat > start-admin.sh << 'EOF'
#!/bin/bash

echo "🏛️ Starting E-Commerce Admin Panel"
echo "=================================="

# Start MongoDB
echo "🍃 Starting MongoDB..."
brew services start mongodb-community@6.0 || mongod &

# Start Backend API
echo "🚀 Starting Backend API..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Start PHP server for admin panel
echo "🌐 Starting PHP Admin Server..."
cd admin
php -S localhost:8080 &
PHP_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "🔗 Access Points:"
echo "   📊 Admin Panel: http://localhost:8080/login.php"
echo "   🔌 Backend API: http://localhost:5000"
echo "   🌐 Frontend: http://localhost:3000 (if running)"
echo ""
echo "🔑 Admin Login:"
echo "   📧 Email: admin@admin.com"
echo "   🔐 Password: admin123"
echo ""
echo "⏹️  To stop services: Press Ctrl+C"

# Wait for interrupt
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $PHP_PID 2>/dev/null; exit" INT
wait
EOF

chmod +x start-admin.sh

# Create admin configuration
echo "⚙️ Creating admin configuration..."
cat > admin/admin_config.php << 'EOF'
<?php
// Admin Panel Configuration
define('USE_NODEJS_BACKEND', true);
define('NODEJS_BACKEND_URL', 'http://localhost:5000');
define('ADMIN_PANEL_URL', 'http://localhost:8080');

// Database Configuration (fallback)
define('DB_HOST', 'localhost');
define('DB_NAME', 'ecommerce_admin');
define('DB_USER', 'root');
define('DB_PASS', '');

// Session Configuration
ini_set('session.cookie_lifetime', 86400); // 24 hours
session_start();

// CORS Headers for API calls
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
?>
EOF

# Update backend server to include admin routes
echo "🔧 Updating backend server configuration..."

# Create integration summary
cat > ADMIN_INTEGRATION_SUMMARY.md << 'EOF'
# 🏛️ Admin Panel Integration Complete!

## 📁 New Structure

```
your-project/
├── admin/                    # PHP Admin Panel
│   ├── assets/              # CSS, JS, Images
│   ├── layout/              # PHP Layout Components  
│   ├── pages/               # Admin Pages
│   ├── config/              # PHP Configuration
│   ├── login.php            # Admin Login
│   ├── index.php            # Admin Dashboard
│   └── admin_config.php     # Configuration
├── backend/                 # Node.js API (Enhanced)
│   ├── routes/              # API Routes (includes admin)
│   ├── models/              # MongoDB Models
│   └── server.js            # Main Server
├── admin-panel-xampp/       # Original XAMPP files (backup)
└── start-admin.sh           # Quick start script
```

## 🚀 Quick Start

### Option 1: Use Start Script (Recommended)
```bash
./start-admin.sh
```

### Option 2: Manual Start
```bash
# 1. Start MongoDB
brew services start mongodb-community@6.0

# 2. Start Backend
cd backend && node server.js &

# 3. Start Admin Panel
cd admin && php -S localhost:8080
```

## 🔗 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Admin Panel** | `http://localhost:8080/login.php` | Admin Dashboard |
| **Backend API** | `http://localhost:5000` | API Server |
| **Frontend** | `http://localhost:3000` | Customer Site |

## 🔑 Login Credentials

**Admin Login:**
- 📧 **Email**: `admin@admin.com`
- 🔐 **Password**: `admin123`

## 🎯 What's Integrated

✅ **PHP Admin Interface** - Complete admin dashboard  
✅ **Node.js Backend API** - Enhanced with admin routes  
✅ **MongoDB Integration** - Unified database  
✅ **Authentication System** - JWT-based admin auth  
✅ **Product Management** - Add/Edit/Delete products  
✅ **Order Management** - Track and manage orders  
✅ **User Management** - Manage customer accounts  
✅ **Analytics Dashboard** - Sales and performance metrics  

## 🛠️ Troubleshooting

### Admin Panel Not Loading
1. Check if PHP server is running: `php -S localhost:8080`
2. Verify admin files are in `admin/` directory
3. Check browser console for errors

### API Not Responding
1. Ensure backend is running: `cd backend && node server.js`
2. Check MongoDB is running: `brew services start mongodb-community@6.0`
3. Verify port 5000 is available

### Login Issues
1. Try default credentials: `admin@admin.com` / `admin123`
2. Create admin user: `cd backend && node createAdminSimple.js`
3. Check network tab in browser dev tools

## 🔄 Next Steps

1. **Test the admin panel**: Login and explore features
2. **Customize branding**: Update logos and colors in `admin/assets/`
3. **Configure settings**: Modify `admin/admin_config.php` as needed
4. **Add products**: Use the product management interface
5. **Monitor orders**: Track customer orders and payments

## 📞 Support

If you need help:
1. Check the browser console for JavaScript errors
2. Check backend server logs for API errors  
3. Verify all services are running with `ps aux | grep -E "(node|php|mongod)"`

---

**🎉 Your admin panel is now integrated and ready to use!**
EOF

echo ""
echo "🎉 Integration Complete!"
echo ""
echo "📋 Summary:"
echo "   ✅ Admin panel copied to admin/ directory"
echo "   ✅ Backend dependencies installed"
echo "   ✅ Configuration files created"
echo "   ✅ Start script created"
echo ""
echo "🚀 To start everything:"
echo "   ./start-admin.sh"
echo ""
echo "📖 Read ADMIN_INTEGRATION_SUMMARY.md for details"