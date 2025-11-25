# 🚀 Starting Pyramid Admin Panel

## Quick Start Guide

### Step 1: Start Backend Server

The backend server should be running on **port 5001**.

**If server is NOT running:**

```bash
cd pyramid-admin/backend

# Make sure .env file exists
# If not, create it with:
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=pyramid_admin_jwt_secret_key_change_in_production_2024
PORT=5001
FRONTEND_URL=http://localhost
EOF

# Start the server
node server.js
```

You should see:
```
MongoDB connected: localhost
Server running on 5001
```

### Step 2: Access Admin Panel

1. **Open your web browser**
2. **Navigate to:** `http://localhost/pyramid-admin/login.php`
   - Or your PHP server URL + `/pyramid-admin/login.php`
   - If using XAMPP: `http://localhost/pyramid-admin/login.php`
   - If using PHP built-in server: `http://localhost:8000/pyramid-admin/login.php`

### Step 3: Login

**Default Credentials:**
- **Email:** `admin@admin.com`
- **Password:** `admin123`

### Step 4: Access Dashboard

After login, you'll be redirected to the dashboard at:
- `http://localhost/pyramid-admin/index.php`

## Troubleshooting

### Backend Not Starting?

1. **Check MongoDB is running:**
   ```bash
   # macOS
   brew services start mongodb-community
   # or
   mongod
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

2. **Check if port 5001 is available:**
   ```bash
   lsof -i :5001
   # If something is using it, kill it:
   kill -9 <PID>
   ```

3. **Check .env file exists:**
   ```bash
   cd pyramid-admin/backend
   ls -la .env
   ```

### Can't Access Login Page?

1. **Make sure PHP server is running**
2. **Check the correct URL path**
3. **Check file permissions**

### Login Not Working?

1. **Check backend is running:** `curl http://localhost:5001/api/admin/stats`
2. **Verify admin user exists:** Run `node pyramid-admin/create-admin-user.js`
3. **Check browser console for errors (F12)**

### Dashboard Shows No Data?

1. **Run diagnostic:** Open `pyramid-admin/diagnose-no-data.php` in browser
2. **Check authentication:** Make sure you're logged in
3. **Check database:** Database might be empty (normal if no products/users/orders yet)

## Quick Commands

```bash
# Start backend
cd pyramid-admin/backend && node server.js

# Check if running
curl http://localhost:5001/api/admin/stats

# Create admin user
cd pyramid-admin && node create-admin-user.js

# Run diagnostics
# Open: pyramid-admin/diagnose-no-data.php in browser
```

## Admin Panel URLs

- **Login:** `http://localhost/pyramid-admin/login.php`
- **Dashboard:** `http://localhost/pyramid-admin/index.php`
- **Products:** `http://localhost/pyramid-admin/index.php?page=products`
- **Orders:** `http://localhost/pyramid-admin/index.php?page=orders`
- **Users:** `http://localhost/pyramid-admin/index.php?page=users`

## Status Check

To verify everything is working:

1. **Backend:** `curl http://localhost:5001/api/admin/stats`
   - Should return: `{"success":false,"error":"Not authorized, no token"}` (this is normal without auth)

2. **Admin Panel:** Open `http://localhost/pyramid-admin/login.php`
   - Should show login form

3. **After Login:** Dashboard should load with data (or zeros if database is empty)

---

**Need Help?** Run the diagnostic tool: `pyramid-admin/diagnose-no-data.php`


