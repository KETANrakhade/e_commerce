# 🏗️ System Architecture

## Overview

This document provides a comprehensive overview of the e-commerce system architecture, data flow, and component relationships.

---

## 🎯 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Men's      │  │   Women's    │  │   Product    │        │
│  │   Products   │  │   Products   │  │   Detail     │        │
│  │              │  │              │  │              │        │
│  │  - Filters   │  │  - Filters   │  │  - Images    │        │
│  │  - Rating    │  │  - Rating    │  │  - Reviews   │        │
│  │  - Sort      │  │  - Sort      │  │  - Rating    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Orders     │  │    Cart      │  │  Wishlist    │        │
│  │   History    │  │              │  │              │        │
│  │              │  │  - Add Item  │  │  - Add Item  │        │
│  │  - Filter    │  │  - Update    │  │  - Remove    │        │
│  │  - Rate      │  │  - Remove    │  │  - View      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │   Login /    │  │    Admin     │                           │
│  │   Register   │  │    Panel     │                           │
│  │              │  │              │                           │
│  │  - Auth      │  │  - Products  │                           │
│  │  - Profile   │  │  - Orders    │                           │
│  └──────────────┘  └──────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Express.js Server                     │  │
│  │                      (Port 5001)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────┴────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │   Product    │  │    Order     │  │   Review     │ │   │
│  │  │  Controller  │  │  Controller  │  │  Controller  │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │    Auth      │  │    Cart      │  │  Wishlist    │ │   │
│  │  │  Controller  │  │  Controller  │  │  Controller  │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────┴────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │   Product    │  │    Order     │  │   Review     │ │   │
│  │  │    Model     │  │    Model     │  │    Model     │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │    User      │  │    Cart      │  │  Wishlist    │ │   │
│  │  │    Model     │  │    Model     │  │    Model     │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────┴────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │     JWT      │  │   Multer     │  │  Cloudinary  │ │   │
│  │  │    Auth      │  │   Upload     │  │   Images     │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Driver
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Database                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────┴────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │   products   │  │    orders    │  │   reviews    │ │   │
│  │  │  collection  │  │  collection  │  │  collection  │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │    users     │  │    carts     │  │  wishlists   │ │   │
│  │  │  collection  │  │  collection  │  │  collection  │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Product Browsing Flow

```
User → Men's/Women's Page → Apply Filters → API Request
                                                  │
                                                  ▼
                                          Backend Server
                                                  │
                                                  ▼
                                          MongoDB Query
                                                  │
                                                  ▼
                                          Filtered Products
                                                  │
                                                  ▼
                                          Display Results
```

### 2. Order & Rating Flow

```
User Places Order → Order Created → Status: Pending
                                          │
                                          ▼
                                    Status: Processing
                                          │
                                          ▼
                                    Status: Shipped
                                          │
                                          ▼
                                    Status: Delivered
                                          │
                                          ▼
                              "Rate Product" Button Appears
                                          │
                                          ▼
                              User Clicks & Rates (1-5 ★)
                                          │
                                          ▼
                              Review Saved to Database
                                          │
                                          ▼
                              Product Rating Updated
                                          │
                                          ▼
                              Review Appears on Product Page
```

### 3. Review Display Flow

```
User Views Product → Load Product Details → Load Reviews API
                                                  │
                                                  ▼
                                          Get Reviews from DB
                                                  │
                                                  ▼
                                          Calculate Statistics
                                                  │
                                                  ▼
                                          Display Summary
                                          - Average Rating
                                          - Total Reviews
                                          - Rating Breakdown
                                                  │
                                                  ▼
                                          Display Review Cards
                                          - User Name
                                          - Rating Stars
                                          - Comment
                                          - Verified Badge
                                                  │
                                                  ▼
                                          Load More Button
                                          (if more reviews exist)
```

### 4. Authentication Flow

```
User → Login Page → Enter Credentials → POST /api/auth/login
                                                  │
                                                  ▼
                                          Verify Credentials
                                                  │
                                                  ▼
                                          Generate JWT Token
                                                  │
                                                  ▼
                                          Return Token + User Data
                                                  │
                                                  ▼
                                          Store in localStorage
                                          - token
                                          - user
                                                  │
                                                  ▼
                                          Redirect to Home
                                                  │
                                                  ▼
                                          Token Sent with All Requests
                                          (Authorization: Bearer TOKEN)
```

---

## 📊 Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  discountedPrice: Number,
  category: ObjectId (ref: Category),
  subcategory: ObjectId (ref: Subcategory),
  brand: ObjectId (ref: Brand),
  images: [{
    url: String,
    isPrimary: Boolean
  }],
  hasColorVariants: Boolean,
  colorVariants: [{
    colorName: String,
    colorCode: String,
    images: [{ url: String, isPrimary: Boolean }],
    stock: Number,
    isDefault: Boolean
  }],
  sizes: [String],
  stock: Number,
  rating: Number,
  numReviews: Number,
  discount: {
    isOnSale: Boolean,
    percentage: Number,
    salePrice: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String,
  user: ObjectId (ref: User),
  orderItems: [{
    productId: ObjectId (ref: Product),
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    hasReview: Boolean,
    userRating: Number
  }],
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: String,
  paymentResult: {
    id: String,
    status: String,
    update_time: String
  },
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  status: String, // pending, processing, shipped, delivered, cancelled
  isPaid: Boolean,
  paidAt: Date,
  isDelivered: Boolean,
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection
```javascript
{
  _id: ObjectId,
  product: ObjectId (ref: Product),
  user: ObjectId (ref: User),
  rating: Number, // 1-5
  comment: String,
  isVerifiedPurchase: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String, // user, admin
  isVerified: Boolean,
  phone: String,
  addresses: [{
    address: String,
    city: String,
    postalCode: String,
    country: String,
    isDefault: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Architecture

### Authentication
```
┌─────────────────────────────────────────────────────────┐
│                   Authentication Flow                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User Login                                          │
│     ↓                                                   │
│  2. Verify Credentials (bcrypt)                         │
│     ↓                                                   │
│  3. Generate JWT Token                                  │
│     - Payload: { userId, email, role }                  │
│     - Secret: process.env.JWT_SECRET                    │
│     - Expiry: 30 days                                   │
│     ↓                                                   │
│  4. Return Token to Client                              │
│     ↓                                                   │
│  5. Client Stores Token (localStorage)                  │
│     ↓                                                   │
│  6. Client Sends Token with Requests                    │
│     - Header: Authorization: Bearer TOKEN               │
│     ↓                                                   │
│  7. Server Verifies Token (middleware)                  │
│     ↓                                                   │
│  8. Grant/Deny Access                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Protected Routes
- `/api/orders/*` - Requires authentication
- `/api/reviews/*` - Requires authentication (POST, PUT, DELETE)
- `/api/cart/*` - Requires authentication
- `/api/wishlist/*` - Requires authentication
- `/api/auth/profile` - Requires authentication
- `/api/admin/*` - Requires admin role

---

## 🎨 Frontend Architecture

### Component Structure
```
Frontend
├── Pages
│   ├── index-backup.html (Home)
│   ├── men-product.html (Men's Products)
│   ├── women-product.html (Women's Products)
│   ├── product.html (Product Detail)
│   ├── orders.html (Order History)
│   ├── cart.html (Shopping Cart)
│   ├── wishlist.html (Wishlist)
│   └── login.html (Authentication)
│
├── Scripts
│   ├── api-config.js (API Configuration)
│   ├── orders.js (Order Management)
│   ├── men-products-loader.js (Men's Products)
│   ├── women-products-loader.js (Women's Products)
│   └── cart-api-handler.js (Cart Operations)
│
├── Styles
│   ├── css/style.css (Global Styles)
│   ├── css/product.css (Product Styles)
│   ├── css/men.css (Men's Page Styles)
│   ├── css/women.css (Women's Page Styles)
│   └── css/cart.css (Cart Styles)
│
└── Assets
    └── img/ (Product Images)
```

### State Management
```javascript
// LocalStorage Keys
{
  token: "JWT_TOKEN",
  user: {
    _id: "user_id",
    name: "User Name",
    email: "user@email.com",
    role: "user"
  },
  cart_v1: [
    {
      _id: "product_id",
      name: "Product Name",
      price: 1999,
      quantity: 2,
      image: "image_url"
    }
  ]
}
```

---

## 🚀 API Architecture

### RESTful Endpoints

#### Products
```
GET    /api/products              - List all products
GET    /api/products/:id          - Get single product
POST   /api/products              - Create product (admin)
PUT    /api/products/:id          - Update product (admin)
DELETE /api/products/:id          - Delete product (admin)
```

#### Orders
```
GET    /api/orders/myorders       - Get user orders
GET    /api/orders/:id            - Get order details
POST   /api/orders                - Create order
PUT    /api/orders/:id            - Update order (admin)
DELETE /api/orders/:id            - Delete order (admin)
```

#### Reviews
```
GET    /api/reviews/:productId    - Get product reviews
POST   /api/reviews/:productId    - Create review
PUT    /api/reviews/:reviewId     - Update review
DELETE /api/reviews/:reviewId     - Delete review
```

#### Authentication
```
POST   /api/auth/register         - Register user
POST   /api/auth/login            - Login user
GET    /api/auth/profile          - Get profile
PUT    /api/auth/profile          - Update profile
POST   /api/auth/logout           - Logout user
```

### Response Format
```javascript
// Success Response
{
  success: true,
  data: { ... },
  message: "Optional message"
}

// Error Response
{
  success: false,
  message: "Error message",
  error: "Detailed error (dev mode only)"
}
```

---

## 📱 Responsive Design Breakpoints

```
Desktop:  > 992px
Tablet:   768px - 992px
Mobile:   < 768px
```

### Responsive Features
- Fluid layouts
- Flexible images
- Media queries
- Mobile-first approach
- Touch-friendly buttons
- Collapsible navigation

---

## 🔄 State Synchronization

### Cart Synchronization
```
LocalStorage Cart ←→ Backend Cart
     │                    │
     ├─ Add Item ────────→│
     │←─ Confirm ─────────┤
     │                    │
     ├─ Update Qty ──────→│
     │←─ Confirm ─────────┤
     │                    │
     ├─ Remove Item ─────→│
     │←─ Confirm ─────────┤
```

### Review Synchronization
```
Submit Review → Backend → Update Product Rating
                   │
                   ├─→ Save Review
                   │
                   ├─→ Calculate New Average
                   │
                   └─→ Update Product Document
```

---

## 🎯 Performance Optimization

### Frontend
- Lazy loading images
- Pagination for products and reviews
- Debounced search/filter
- Cached API responses
- Minified CSS/JS

### Backend
- MongoDB indexing
- Query optimization
- Response compression
- Rate limiting
- Caching strategies

### Database
- Indexed fields:
  - products: name, category, price, rating
  - orders: user, status, createdAt
  - reviews: product, user, createdAt
  - users: email

---

## 🔍 Monitoring & Logging

### Backend Logging
```javascript
// Request logging
console.log('📡 API Request:', method, url);

// Success logging
console.log('✅ Success:', message);

// Error logging
console.error('❌ Error:', error);
```

### Frontend Logging
```javascript
// API calls
console.log('🚀 Fetching:', url);

// User actions
console.log('👤 User action:', action);

// Errors
console.error('❌ Error:', error);
```

---

## 🎉 Conclusion

This architecture provides:
- ✅ Scalable structure
- ✅ Clear separation of concerns
- ✅ RESTful API design
- ✅ Secure authentication
- ✅ Responsive frontend
- ✅ Efficient data flow
- ✅ Maintainable codebase

---

**Last Updated**: February 6, 2026  
**Version**: 1.0.0
