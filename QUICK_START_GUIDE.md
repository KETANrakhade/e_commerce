# 🚀 Quick Start Guide

## Starting Your E-Commerce System

### Prerequisites
- Node.js installed
- PHP installed (for admin panel)
- MongoDB running

---

## 🎯 Start Servers

### Option 1: Start All Servers at Once
```bash
# From project root
./start-all-servers.sh
```

### Option 2: Start Servers Individually

#### 1. Start Backend Server (Port 5001)
```bash
cd backend
npm start
```
**Expected Output**: `Server running on port 5001`

#### 2. Start Admin Panel (Port 9000)
```bash
cd pyramid-admin
php -S localhost:9000
```
**Expected Output**: `PHP development server started`

---

## 🌐 Access the Application

### Frontend Pages:
- **Home**: `http://localhost:5001/index-backup.html`
- **Men's Products**: `http://localhost:5001/men-product.html`
- **Women's Products**: `http://localhost:5001/women-product.html`
- **Product Detail**: `http://localhost:5001/product.html?id=PRODUCT_ID`
- **Orders**: `http://localhost:5001/orders.html`
- **Cart**: `http://localhost:5001/cart.html`
- **Wishlist**: `http://localhost:5001/wishlist.html`
- **Login**: `http://localhost:5001/login.html`

### Admin Panel:
- **Admin Dashboard**: `http://localhost:9000`

---

## 👤 Test User Accounts

### Regular User:
```
Email: test@example.com
Password: password123
```

### Admin User:
```
Email: admin@pyramid.com
Password: admin123
```

---

## 🧪 Testing the Features

### 1. Test Product Filtering
1. Go to `men-product.html` or `women-product.html`
2. Click the "Filter" button
3. Try different filters:
   - Categories (Shirts, Jeans, etc.)
   - Price range
   - Discount percentage
   - Rating (5★, 4★ & Up, etc.)
4. Verify products filter correctly

### 2. Test Order History
1. Login with test user
2. Click the orders icon (📦) in navbar
3. View your orders
4. Try filter tabs (All, Pending, Delivered, etc.)

### 3. Test Product Rating
1. Ensure you have a delivered order
2. Go to orders page
3. Click "Rate Product" on any item
4. Select stars (1-5)
5. Write a review
6. Submit
7. Check product detail page to see your review

### 4. Test Reviews Display
1. Go to any product detail page
2. Scroll to "Customer Reviews" section
3. See rating summary with breakdown
4. View individual reviews
5. Click "Load More" if available

---

## 🔍 Troubleshooting

### Backend Server Won't Start
```bash
# Check if port 5001 is in use
lsof -i :5001

# Kill process if needed
kill -9 <PID>

# Try starting again
cd backend
npm start
```

### Admin Panel Won't Start
```bash
# Check if port 9000 is in use
lsof -i :9000

# Kill process if needed
kill -9 <PID>

# Try starting again
cd pyramid-admin
php -S localhost:9000
```

### MongoDB Not Running
```bash
# Start MongoDB
mongod

# Or if using brew on macOS
brew services start mongodb-community
```

### Can't Login
1. Check backend server is running
2. Check MongoDB is running
3. Clear browser cache and localStorage
4. Try creating a new user

### Orders Not Loading
1. Verify you're logged in
2. Check backend server logs
3. Open browser console for errors
4. Verify token in localStorage

### Reviews Not Submitting
1. Check you're logged in
2. Verify backend server is running
3. Check browser console for errors
4. Ensure you haven't already reviewed the product

---

## 📊 API Endpoints Reference

### Products
```
GET  /api/products              - Get all products
GET  /api/products/:id          - Get single product
POST /api/products              - Create product (admin)
PUT  /api/products/:id          - Update product (admin)
DELETE /api/products/:id        - Delete product (admin)
```

### Orders
```
GET  /api/orders/myorders       - Get user orders
POST /api/orders                - Create order
GET  /api/orders/:id            - Get order details
PUT  /api/orders/:id            - Update order (admin)
```

### Reviews
```
GET  /api/reviews/:productId    - Get product reviews
POST /api/reviews/:productId    - Create review
PUT  /api/reviews/:reviewId     - Update review
DELETE /api/reviews/:reviewId   - Delete review
```

### Auth
```
POST /api/auth/register         - Register user
POST /api/auth/login            - Login user
GET  /api/auth/profile          - Get user profile
PUT  /api/auth/profile          - Update profile
```

### Cart
```
GET  /api/cart                  - Get cart
POST /api/cart/add              - Add to cart
PUT  /api/cart/update           - Update cart item
DELETE /api/cart/remove/:id     - Remove from cart
```

### Wishlist
```
GET  /api/wishlist              - Get wishlist
POST /api/wishlist/add          - Add to wishlist
DELETE /api/wishlist/remove/:id - Remove from wishlist
```

---

## 🎨 Feature Highlights

### ✨ Women's Product Page
- Beautiful pink/rose gradient theme
- Advanced filter panel
- Category, price, discount, rating filters
- Responsive design

### ✨ Men's Product Page
- Dark blue professional theme
- Same advanced filtering
- Consistent user experience

### ✨ Order History
- Purple gradient theme
- Color-coded status badges
- Filter by order status
- Rate delivered products

### ✨ Product Reviews
- 5-star rating system
- Verified purchase badges
- Rating breakdown with percentages
- Load more pagination

---

## 📱 Mobile Testing

### Test on Different Devices:
1. Desktop (1920x1080)
2. Tablet (768x1024)
3. Mobile (375x667)

### Use Browser DevTools:
1. Open Chrome DevTools (F12)
2. Click device toolbar icon
3. Select different devices
4. Test all features

---

## 🔐 Security Notes

- All protected routes require JWT token
- Tokens stored in localStorage
- Automatic redirect to login if not authenticated
- Users can only access their own data
- Admin routes protected with role check

---

## 📝 Development Tips

### Viewing Logs:
```bash
# Backend logs
cd backend
npm start
# Watch console output

# MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Clearing Data:
```javascript
// Clear localStorage
localStorage.clear();

// Clear specific items
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('cart_v1');
```

### Testing API with cURL:
```bash
# Get products
curl http://localhost:5001/api/products

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get orders (with token)
curl http://localhost:5001/api/orders/myorders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎉 You're All Set!

Your e-commerce system is ready to use with:
- ✅ Advanced product filtering
- ✅ Order history management
- ✅ Product rating and reviews
- ✅ Beautiful responsive design
- ✅ Complete user authentication

**Happy Shopping! 🛍️**

---

## 📞 Need Help?

Check these files for more information:
- `ORDER_RATING_SYSTEM.md` - Rating system details
- `SYSTEM_STATUS_SUMMARY.md` - Complete feature list
- `PROJECT_DOCUMENTATION.md` - Overall project docs

---

**Last Updated**: February 6, 2026  
**Version**: 1.0.0
