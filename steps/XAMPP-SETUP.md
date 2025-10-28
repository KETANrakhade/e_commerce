# E-Commerce Admin Panel - XAMPP Setup Guide

## 📋 Prerequisites

1. **XAMPP installed** at `/Applications/XAMPP/`
2. **MongoDB running** (for the backend API)
3. **Node.js backend** (for API endpoints)

## 🚀 Quick Start

### Step 1: Start Everything
```bash
chmod +x start-admin-xampp.sh
./start-admin-xampp.sh
```

### Step 2: Access Admin Panel
- **🔐 Login Page**: `http://localhost/E-COMMERCE-PYRAMID/login.php`
- **📊 Dashboard**: `http://localhost/E-COMMERCE-PYRAMID/`

### Step 3: Login Credentials
- **📧 Email**: `admin@admin.com`
- **🔑 Password**: `admin123`

## 🔧 Manual Setup (if script doesn't work)

### 1. Start XAMPP Apache
```bash
sudo /Applications/XAMPP/bin/apache start
```

### 2. Start MongoDB
```bash
brew services start mongodb-community@6.0
```

### 3. Start Node.js Backend
```bash
cd backend
node server.js
```

### 4. Access Admin Panel
Open browser: `http://localhost/E-COMMERCE-PYRAMID/login.php`

## 📁 File Structure
```
/Applications/XAMPP/htdocs/
└── E-COMMERCE-PYRAMID/
    ├── assets/
    ├── layout/
    ├── middleware/
    ├── pages/
    ├── index.php
    └── login.php

your-project/
└── backend/
    ├── server.js
    └── ...
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| **Admin Login** | `http://localhost/E-COMMERCE-PYRAMID/login.php` |
| **Admin Dashboard** | `http://localhost/E-COMMERCE-PYRAMID/` |
| **Backend API** | `http://localhost:5000` |
| **XAMPP Control** | `http://localhost` |

## 🛠 Troubleshooting

### Issue: "This site can't be reached"
**Solution**: Make sure XAMPP Apache is running
```bash
sudo /Applications/XAMPP/bin/apache start
```

### Issue: "Invalid email or password"
**Solution**: Make sure backend is running and admin user exists
```bash
cd backend
node createAdminSimple.js
node server.js
```

### Issue: API calls failing
**Solution**: Check if backend is running on port 5000
```bash
curl http://localhost:5000/api/admin/stats
```

## 🔄 Stop Services

### Stop Backend
Press `Ctrl+C` in the terminal running the backend

### Stop XAMPP Apache
```bash
sudo /Applications/XAMPP/bin/apache stop
```

### Stop MongoDB
```bash
brew services stop mongodb-community@6.0
```

## ✅ Verification Checklist

- [ ] XAMPP Apache running on port 80
- [ ] MongoDB running
- [ ] Node.js backend running on port 5000
- [ ] Admin panel accessible at `http://localhost/E-COMMERCE-PYRAMID/`
- [ ] Can login with admin credentials
- [ ] Dashboard loads with data

## 🎯 Next Steps

Once everything is running:
1. Login to admin panel
2. Check dashboard statistics
3. Manage products, orders, and users
4. Customize settings as needed