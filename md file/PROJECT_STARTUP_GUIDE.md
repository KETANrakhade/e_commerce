# 🚀 PYRAMID E-Commerce Project Startup Guide

## 📋 **Prerequisites**

Before starting, make sure you have:
- ✅ **Node.js** (v16 or higher)
- ✅ **MongoDB** (local installation or MongoDB Atlas)
- ✅ **Git** (for version control)
- ✅ **Code Editor** (VS Code recommended)

## 🔧 **Step-by-Step Startup Instructions**

### **Step 1: Install MongoDB (if not installed)**

#### For macOS:
```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0
```

#### For Windows:
```bash
# Download MongoDB Community Server from mongodb.com
# Install and start MongoDB service
net start MongoDB
```

#### For Linux (Ubuntu):
```bash
# Install MongoDB
sudo apt update
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### **Step 2: Clone and Setup Project**

```bash
# Navigate to your project directory
cd /path/to/your/e-commerce-project

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### **Step 3: Environment Configuration**

Your `.env` file in the `backend` folder is already configured:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/pyramid-ecommerce
JWT_SECRET=pyramid_super_secret_jwt_key_2024_make_it_very_long_and_secure
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:5500
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=dqqkfjufa
CLOUDINARY_API_KEY=631853314537277
CLOUDINARY_API_SECRET=slhpgxGK6G_bDn6RoVB4J2BWAkE
```

### **Step 4: Database Setup**

```bash
# Create admin user (run from project root)
node create-admin-user.js

# Check database status (optional)
node check-database-status.js

# Add sample products (optional)
node add-sample-product.js
```

### **Step 5: Start the Backend Server**

```bash
# Navigate to backend directory
cd backend

# Start the server (choose one option)
npm start          # Production mode
# OR
npm run dev        # Development mode with auto-restart
```

You should see:
```
Server running on 5001
MongoDB connected: localhost:27017
✅ Cloudinary connected successfully
```

### **Step 6: Start the Frontend**

#### Option A: Using Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Frontend will open at `http://localhost:5500`

#### Option B: Using Python (if installed)
```bash
# From project root directory
python -m http.server 5500
# OR
python3 -m http.server 5500
```

#### Option C: Using Node.js serve
```bash
# Install serve globally
npm install -g serve

# Start frontend server
serve -s . -l 5500
```

## 🌐 **Access Your Application**

### **Frontend URLs:**
- **Main Website**: http://localhost:5500
- **Admin Panel**: http://localhost:5500/admin.html

### **Backend API:**
- **API Base URL**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/products

### **Default Admin Credentials:**
- **Email**: admin@pyramid.com
- **Password**: admin123

## 🔍 **Verify Everything is Working**

### **1. Check Backend Status:**
```bash
curl http://localhost:5001/api/products
```

### **2. Check Frontend:**
- Open http://localhost:5500
- You should see the PYRAMID homepage
- Crown icon should be hidden (only visible after admin login)

### **3. Test Admin Login:**
- Click crown icon (if visible) or go to `/admin.html`
- Login with admin credentials
- Crown icon should become visible after login

## 🛠️ **Development Workflow**

### **Daily Development:**
```bash
# Terminal 1: Start MongoDB (if not running as service)
mongod

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Start Frontend (Live Server or serve)
# Use VS Code Live Server or serve command
```

### **Making Changes:**
- **Frontend**: Edit HTML/CSS/JS files, changes auto-reload with Live Server
- **Backend**: Edit controllers/routes/models, nodemon auto-restarts server
- **Database**: Use MongoDB Compass for GUI management

## 📊 **Project Structure**
```
e-commerce/
├── backend/                 # Node.js API server
│   ├── controllers/         # Business logic
│   ├── models/             # Database schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & validation
│   ├── config/             # Database & services
│   └── server.js           # Main server file
├── css/                    # Stylesheets
├── img/                    # Images
├── video/                  # Video files
├── index.html              # Homepage
├── admin.html              # Admin panel
├── login.html              # User login
├── men-product.html        # Men's products
├── women-product.html      # Women's products
├── cart.html               # Shopping cart
├── checkout.html           # Checkout page
└── script.js               # Frontend JavaScript
```

## 🚨 **Troubleshooting**

### **MongoDB Connection Issues:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Restart MongoDB
brew services restart mongodb-community@7.0  # macOS
sudo systemctl restart mongod                # Linux
```

### **Port Already in Use:**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 5500
lsof -ti:5500 | xargs kill -9
```

### **Backend Not Starting:**
- Check if all dependencies are installed: `cd backend && npm install`
- Verify MongoDB is running
- Check `.env` file exists in backend folder

### **Frontend Not Loading:**
- Ensure Live Server is running on port 5500
- Check browser console for errors
- Verify `api-config.js` has correct backend URL

## 🎉 **Success Indicators**

✅ **Backend Running**: Console shows "Server running on 5001"  
✅ **Database Connected**: Console shows "MongoDB connected"  
✅ **Frontend Loading**: Homepage displays at localhost:5500  
✅ **API Working**: Products load on homepage  
✅ **Admin Access**: Crown icon appears after admin login  

## 🚀 **Next Steps**

1. **Add Products**: Use admin panel to add your products
2. **Test Orders**: Place test orders to verify checkout flow
3. **Customize Design**: Modify CSS and HTML to match your brand
4. **Setup Payments**: Configure real Stripe keys for payments
5. **Deploy**: Use Vercel/Netlify for frontend, Vercel/Railway for backend

Your PYRAMID e-commerce project is now ready to run! 🎊