# 🚀 Starting Pyramid Admin Panel

## Quick Start

### 1. Create Environment File

Create a `.env` file in `pyramid-admin/backend/` directory:

```bash
cd pyramid-admin/backend
cp .env.example .env
```

Or create it manually with:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5001
FRONTEND_URL=http://localhost
```

### 2. Install Dependencies (if not done)

```bash
cd pyramid-admin/backend
npm install
```

### 3. Start MongoDB (if not running)

**macOS:**
```bash
brew services start mongodb-community
# or
mongod
```

**Linux:**
```bash
sudo systemctl start mongod
# or
mongod
```

**Windows:**
```bash
net start MongoDB
```

### 4. Start the Backend Server

```bash
cd pyramid-admin/backend
node server.js
```

You should see:
```
MongoDB connected: localhost
Server running on 5001
```

### 5. Access the Admin Panel

1. Open your browser
2. Go to: `http://localhost/pyramid-admin/login.php` (or your PHP server URL)
3. Login with:
   - **Email:** `admin@admin.com`
   - **Password:** `admin123`

## Alternative: Use the Start Script

**macOS/Linux:**
```bash
cd pyramid-admin
chmod +x start-admin.sh
./start-admin.sh
```

**Windows:**
```bash
cd pyramid-admin
start-admin.bat
```

## Troubleshooting

### Backend won't start
- Check if MongoDB is running: `mongosh` or `mongo`
- Check if port 5001 is available: `lsof -i :5001`
- Check `.env` file exists and has correct values

### Can't connect to database
- Verify MongoDB is running
- Check `MONGO_URI` in `.env` file
- Try: `mongodb://127.0.0.1:27017/ecommerce`

### Authentication fails
- Make sure admin user exists
- Run: `node pyramid-admin/create-admin-user.js`
- Check JWT_SECRET is set in `.env`

### Dashboard shows no data
- Check backend is running on port 5001
- Check browser console for errors
- Visit `pyramid-admin/quick-test.php` for diagnostics

## Default Credentials

- **Email:** admin@admin.com
- **Password:** admin123

**⚠️ Change these in production!**


