# PYRAMID E-Commerce API Documentation

## Complete API Endpoints Summary

### 🔐 **User Authentication APIs (4 endpoints)**
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)

### 📦 **Product APIs (9 endpoints)**
- `GET /api/products` - Get all products (Public, with search & pagination)
- `GET /api/products/featured` - Get featured products (Public)
- `GET /api/products/category/:category` - Get products by category (Public)
- `GET /api/products/:id` - Get single product (Public)
- `GET /api/admin/products` - Get products for admin (Admin, with filters)
- `POST /api/admin/products` - Create product (Admin)
- `PUT /api/admin/products/:id` - Update product (Admin)
- `DELETE /api/admin/products/:id` - Delete product (Admin)
- `POST /api/admin/products/bulk-action` - Bulk actions on products (Admin)

### 🛒 **Order APIs (8 endpoints)**
- `POST /api/orders` - Create new order (Protected)
- `GET /api/orders/myorders` - Get user's orders (Protected)
- `PUT /api/orders/:id/pay` - Update order to paid (Protected)
- `GET /api/admin/orders` - Get all orders (Admin, with filters)
- `GET /api/admin/orders/:id` - Get single order details (Admin)
- `PUT /api/admin/orders/:id/status` - Update order status (Admin)
- `GET /api/admin/orders/stats` - Get order statistics (Admin)
- `GET /api/admin/orders/export` - Export orders (Admin, JSON/CSV)

### ❤️ **Wishlist APIs (4 endpoints)**
- `GET /api/wishlist` - Get user wishlist (Protected)
- `POST /api/wishlist/add` - Add product to wishlist (Protected)
- `DELETE /api/wishlist/remove/:productId` - Remove from wishlist (Protected)
- `DELETE /api/wishlist/clear` - Clear entire wishlist (Protected)

### 👑 **Admin APIs (5 endpoints)**
- `POST /api/admin/login` - Admin login (Public)
- `GET /api/admin/profile` - Get admin profile (Admin)
- `GET /api/admin/stats` - Get dashboard statistics (Admin)
- `GET /api/admin/recent-orders` - Get recent orders (Admin)
- `GET /api/admin/sales-analytics` - Get sales analytics (Admin)

### 👥 **User Management APIs (Admin - 5 endpoints)**
- `GET /api/admin/users` - Get all users (Admin, with filters)
- `GET /api/admin/users/stats` - Get user statistics (Admin)
- `GET /api/admin/users/:id` - Get single user details (Admin)
- `GET /api/admin/users/:id/orders` - Get user's orders (Admin)
- `PUT /api/admin/users/:id/status` - Update user status (Admin)

### 💳 **Payment APIs (2 endpoints)**
- `POST /api/payment/create-checkout-session` - Create Stripe checkout session (Protected)
- `POST /api/payment/webhook` - Stripe webhook handler (Public)

### 📸 **Upload APIs (1 endpoint)**
- `POST /api/upload` - Upload image to Cloudinary (Protected)

## Total API Count: **38 Complete APIs**

### API Categories Breakdown:
- **User APIs**: 9 endpoints (4 auth + 5 admin management)
- **Product APIs**: 9 endpoints (4 public + 5 admin)
- **Order APIs**: 8 endpoints (3 user + 5 admin)
- **Wishlist APIs**: 4 endpoints
- **Admin APIs**: 5 endpoints
- **Payment APIs**: 2 endpoints
- **Upload APIs**: 1 endpoint

### Security Features:
- JWT token authentication
- Role-based access control (User/Admin)
- Protected routes with middleware
- Admin-only endpoints
- Input validation and sanitization

### Advanced Features:
- Search and filtering
- Pagination support
- Bulk operations
- Data export (JSON/CSV)
- File upload to cloud storage
- Payment processing with Stripe
- Real-time webhook handling
- Comprehensive statistics and analytics

## Status: ✅ **ALL APIS COMPLETE**

The e-commerce platform has a comprehensive set of APIs covering all major functionality including user management, product catalog, order processing, wishlist, payments, and admin operations. No additional APIs are required for basic e-commerce functionality.