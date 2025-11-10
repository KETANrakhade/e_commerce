# PYRAMID E-Commerce Backend Flow Architecture

## 🏗️ **Complete Backend Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PYRAMID E-COMMERCE FRONTEND                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  index.html  │  login.html  │  men-product.html  │  women-product.html  │ ...   │ 
│     👑       │      🔐      │        👔         │         👗           │         │ 
│  (Crown Icon)│   (Auth)     │    (Products)     │      (Products)      │        │
└─────────────┬───────────────┬───────────────────┬──────────────────────┬───────┘
              │               │                   │                      │
              ▼               ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EXPRESS.JS SERVER                                    │
│                         (Port: 5001 / 5000)                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              MIDDLEWARE LAYER                                   │
│  🔒 CORS  │  📝 JSON Parser  │  🛡️ Auth  │  👑 Admin Auth  │  📤 File Upload      │  
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API ROUTES LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  /api/users          /api/products       /api/orders        /api/admin          │
│  ├─ POST /register   ├─ GET /            ├─ POST /          ├─ POST /login      │
│  ├─ POST /login      ├─ GET /featured    ├─ GET /myorders   ├─ GET /stats       │
│  ├─ GET /profile     ├─ GET /category/:  ├─ PUT /:id/pay    ├─ GET /products    │
│  └─ PUT /profile     ├─ GET /:id         └─ GET /:id        ├─ GET /orders      │
│                      ├─ POST / (admin)                      ├─ GET /users       │
│  /api/wishlist       ├─ PUT /:id (admin)                   └─ GET /analytics    │
│  ├─ GET /            └─ DELETE /:id                                             │
│  ├─ POST /add                                                                   │
│  ├─ DELETE /remove   /api/upload         /api/payment                           │
│  └─ DELETE /clear    ├─ POST /single     ├─ POST /create-checkout-session       │ 
│                      ├─ POST /multiple   └─ POST /webhook                       │
│                      ├─ POST /product                                           │
│                      └─ DELETE /:id                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CONTROLLERS LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  userController.js    productController.js   orderController.js                 │
│  ├─ registerUser      ├─ getProducts         ├─ createOrder                     │
│  ├─ authUser          ├─ getProductById      ├─ getMyOrders                     │
│  ├─ getProfile        ├─ getFeaturedProducts ├─ updateOrderToPaid               │
│  ├─ updateProfile     ├─ getProductsByCategory ├─ getAdminOrders                │
│  ├─ getAdminUsers     ├─ createProduct       ├─ updateOrderStatus               │
│  ├─ getUserById       ├─ updateProduct       ├─ getOrderStats                   │
│  └─ updateUserStatus  ├─ deleteProduct       └─ exportOrders                    │
│                       └─ bulkProductAction                                      │
│                                                                                 │
│  adminController.js   wishlistController.js  paymentController.js               │
│  ├─ adminLogin        ├─ getWishlist         ├─ createCheckoutSession           │
│  ├─ getAdminProfile   ├─ addToWishlist       └─ handleStripeWebhook             │
│  ├─ getDashboardStats ├─ removeFromWishlist                                     │
│  ├─ getRecentOrders   └─ clearWishlist       uploadController.js                │
│  └─ getSalesAnalytics                        ├─ uploadSingleImage               │
│                                              ├─ uploadMultipleImages            │
│                                              ├─ uploadProductImages             │
│                                              └─ deleteImage                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              MODELS LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  userModel.js         productModel.js       orderModel.js                       │
│  ├─ name              ├─ name               ├─ user (ref)                       │
│  ├─ email             ├─ description        ├─ orderItems[]                     │
│  ├─ password          ├─ price              ├─ shippingAddress                  │
│  ├─ role              ├─ category           ├─ paymentMethod                    │
│  ├─ isActive          ├─ stock              ├─ paymentResult                    │
│  ├─ wishlist[]        ├─ images[]           ├─ itemsPrice                       │
│  ├─ address           ├─ brand              ├─ shippingPrice                    │ 
│  ├─ phone             ├─ weight             ├─ taxPrice                         │
│  └─ lastLogin         ├─ dimensions         ├─ totalPrice                       │
│                       ├─ tags[]             ├─ isPaid                           │
│                       ├─ featured           ├─ paidAt                           │
│                       ├─ isActive           ├─ isDelivered                      │
│                       ├─ seoTitle           ├─ deliveredAt                      │
│                       └─ seoDescription     ├─ status                           │
│                                             ├─ orderNumber                      │
│                                             └─ createdAt                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE & SERVICES                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  📊 MongoDB Atlas          ☁️ Cloudinary           💳 Stripe                     │
│  ├─ Users Collection       ├─ Image Storage         ├─ Payment Processing       │
│  ├─ Products Collection    ├─ Auto Optimization     ├─ Checkout Sessions        │
│  ├─ Orders Collection      ├─ CDN Delivery          ├─ Webhook Handling         │
│  └─ Indexes & Relations    └─ Folder Organization   └─ Payment Confirmation     │
│                                                                                 │
│  🔐 JWT Authentication     📧 Email Service         📱 SMS Service               │
│  ├─ Token Generation       ├─ Order Confirmations   ├─ Order Updates            │
│  ├─ Token Verification     ├─ Password Resets       └─ Delivery Notifications   │
│  └─ Role-based Access      └─ Marketing Emails                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 **User Journey Flow**

### 1. **Customer Journey**
```
User visits index.html
       ↓
Views products (men-product.html / women-product.html)
       ↓
Adds to cart/wishlist → API calls to /api/products, /api/wishlist
       ↓
Login/Register → API calls to /api/users/login, /api/users/register
       ↓
Checkout → API calls to /api/orders, /api/payment
       ↓
Payment via Stripe → Webhook to /api/payment/webhook
       ↓
Order confirmation → orderSuccess.html
```

### 2. **Admin Journey**
```
Admin clicks crown icon (👑) → admin.html
       ↓
Admin login → API call to /api/admin/login
       ↓
Dashboard access → API calls to /api/admin/stats, /api/admin/recent-orders
       ↓
Manage products → API calls to /api/admin/products (CRUD operations)
       ↓
Manage orders → API calls to /api/admin/orders (status updates)
       ↓
Manage users → API calls to /api/admin/users (user management)
```

## 🛡️ **Security Flow**

### Authentication Middleware Chain:
```
Request → CORS Check → JSON Parser → JWT Verification → Role Check → Controller
```

### Admin Protection:
```
Crown Icon → Hidden by default → Show only if adminToken exists → Admin routes protected
```

## 📊 **Data Flow Architecture**

### Product Management:
```
Frontend Form → Multer Upload → Cloudinary Storage → MongoDB → API Response
```

### Order Processing:
```
Cart Data → Order Creation → Stripe Payment → Webhook Confirmation → Database Update
```

### Image Upload:
```
File Selection → Multer Processing → Cloudinary Upload → URL Storage → Database Reference
```

## 🔧 **Environment Configuration**

### Development Flow:
```
Local MongoDB → Node.js Server (5001) → Frontend (Live Server) → Cloudinary → Stripe Test
```

### Production Flow:
```
MongoDB Atlas → Vercel Deployment → Frontend Domain → Cloudinary → Stripe Live
```

## 📈 **Performance Optimizations**

1. **Database Indexing**: User email, Product category, Order status
2. **Image Optimization**: Auto WebP conversion, CDN delivery
3. **Caching**: JWT tokens, Product listings
4. **Rate Limiting**: API endpoint protection
5. **Pagination**: Large data sets (products, orders, users)

## 🚀 **Deployment Architecture**

```
GitHub Repository
       ↓
Vercel Deployment (Backend)
       ↓
MongoDB Atlas (Database)
       ↓
Cloudinary (Images)
       ↓
Stripe (Payments)
       ↓
Live Website
```

This backend flow ensures scalable, secure, and efficient e-commerce operations for your PYRAMID website!