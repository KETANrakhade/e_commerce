# 🏛️ Pyramid Admin Panel - Complete Package

A complete e-commerce admin panel with PHP frontend and Node.js backend.

## 📦 What's Included

- ✅ **PHP Admin Frontend** - Complete admin interface
- ✅ **Node.js Backend API** - RESTful API server
- ✅ **MongoDB Integration** - Database models and connections
- ✅ **Authentication System** - JWT-based admin auth
- ✅ **All Dependencies** - Ready to install and run

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod
```

### 3. Create Admin User
```bash
npm run create-admin
```

### 4. Start Backend Server
```bash
npm start
```
Server will run on: `http://localhost:5000`

### 5. Setup PHP Frontend

#### Option A: XAMPP
```bash
# Copy to XAMPP
cp -r pyramid-admin-complete /Applications/XAMPP/htdocs/pyramid-admin
# Start Apache in XAMPP Control Panel
# Visit: http://localhost/pyramid-admin/login.php
```

#### Option B: PHP Built-in Server
```bash
cd pyramid-admin-complete
php -S localhost:8080
# Visit: http://localhost:8080/login.php
```

## 🔑 Login Credentials

**Default Admin:**
- **Email**: `admin@admin.com`
- **Password**: `admin123`

**PHP Fallback:**
- **Email**: `admin@pyramid.com`
- **Password**: `pyramid123`

## 📁 Folder Structure

```
pyramid-admin-complete/
├── assets/              # CSS, JS, Images
├── backend/             # Node.js API Server
│   ├── models/          # MongoDB Models
│   ├── routes/          # API Routes
│   ├── middleware/      # Auth & Validation
│   └── server.js        # Main Server File
├── config/              # PHP Configuration
├── layout/              # PHP Layout Components
├── pages/               # Admin Pages
├── login.php            # Login Page
├── index.php            # Dashboard
├── package.json         # Node.js Dependencies
├── .env                 # Environment Variables
└── create-admin-user.js # Admin User Creator
```

## 🔧 Configuration

### Backend Configuration (.env)
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Backend server port (default: 5000)
- `JWT_SECRET` - JWT signing secret
- `ADMIN_EMAIL` & `ADMIN_PASSWORD` - Default admin credentials

### PHP Configuration (config/admin_config.php)
- `USE_NODEJS_BACKEND` - Enable/disable Node.js backend
- `NODEJS_BACKEND_URL` - Backend API URL
- Database fallback settings

## 🌟 Features

### Admin Dashboard
- 📊 Sales analytics and statistics
- 📈 Revenue charts and graphs
- 🔢 Key performance indicators

### Product Management
- ➕ Add/Edit/Delete products
- 🖼️ Image upload and management
- 📂 Category organization
- 💰 Pricing and inventory

### Order Management
- 📋 Order listing and details
- 🔄 Status updates
- 💳 Payment tracking
- 📦 Shipping management

### User Management
- 👥 Customer accounts
- 📊 User analytics
- 🔒 Account management

## 🛠️ Troubleshooting

### Backend Not Connecting
1. Check if Node.js server is running: `npm start`
2. Verify MongoDB is running: `mongod`
3. Check port 5000 is available: `lsof -i :5000`

### Login Issues
1. Try default credentials: `admin@admin.com` / `admin123`
2. Create new admin: `npm run create-admin`
3. Check browser console for errors

### No Data Showing
1. Ensure backend is running
2. Check network tab in browser dev tools
3. Verify API endpoints are responding

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check backend server logs
3. Verify all services are running
4. Check file permissions

## 🔄 Updates

To update the admin panel:
1. Backup your current installation
2. Replace files with new version
3. Run `npm install` for new dependencies
4. Restart backend server

---

**Ready to use!** 🎉 Just follow the setup steps above.