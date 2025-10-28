# 🚀 Complete Setup Instructions

## Step-by-Step Implementation Guide

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install stripe
```

#### Create Missing Files
1. Create `backend/models/orderModel.js` (from file 1)
2. Create `backend/controllers/orderController.js` (from file 2)
3. Create `backend/controllers/paymentController.js` (from file 3)
4. Create `backend/middleware/authMiddleware.js` (from file 4)
5. Create `backend/middleware/errorMiddleware.js` (from file 4)
6. Create `backend/routes/orderRoutes.js` (from file 4)
7. Create `backend/routes/payment.js` (from file 3)

#### Update Existing Files

**Update `backend/server.js`:**
```javascript
// Add these route imports
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/payment'));

// Update error handlers
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);
```

**Update `backend/.env`:**
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Update `backend/package.json` dependencies:**
```json
"stripe": "^14.21.0"
```

#### Update Seed Data
**Update `backend/seedData.js`:**
```javascript
// Add Order model import
const Order = require('./models/orderModel');

// Add sample orders to seedDatabase function
const sampleOrders = [
  {
    user: createdUsers[1]._id, // Regular user
    orderItems: [
      {
        productId: createdProducts[0]._id,
        name: createdProducts[0].name,
        price: createdProducts[0].price,
        quantity: 2,
        image: createdProducts[0].images[0]
      }
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      city: "Mumbai",
      pincode: "400001",
      phone: "9876543210"
    },
    paymentMethod: "COD",
    itemsPrice: createdProducts[0].price * 2,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: createdProducts[0].price * 2,
    isPaid: false,
    status: "confirmed"
  }
];

const createdOrders = await Order.insertMany(sampleOrders);
console.log(`${createdOrders.length} orders seeded`);
```

### 2. Frontend Setup

#### Update Checkout Page
Replace the `placeOrder()` function in `checkout.html` with the code from file 5.

#### Create New Pages
1. Create `admin.html` (from file 6)
2. Create `profile.html` (from file 7)

#### Update Navigation
Add the navigation updates from file 7 to `script.js`.

### 3. Stripe Setup

#### Get Stripe Keys
1. Sign up at https://stripe.com
2. Get your test keys from the dashboard
3. Add them to your `.env` file

#### Set Up Webhook
1. In Stripe dashboard, go to Webhooks
2. Add endpoint: `http://localhost:5000/api/payment/webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook secret to `.env`

### 4. Testing

#### Test Accounts
- **Admin**: admin@pyramid.com / admin123
- **User**: user@test.com / user123

#### Test Payment
Use Stripe test card: `4242 4242 4242 4242`

#### Test Flow
1. Login as user
2. Add items to cart
3. Go to checkout
4. Fill address details
5. Choose payment method:
   - **COD**: Order created immediately
   - **Online**: Redirected to Stripe checkout

### 5. Production Deployment

#### Environment Variables
```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
FRONTEND_URL=https://yourdomain.com
```

#### Webhook URL
Update webhook URL to: `https://yourdomain.com/api/payment/webhook`

### 6. Features Included

#### Payment System
- ✅ Stripe integration
- ✅ COD support
- ✅ Automatic order creation
- ✅ Payment status tracking

#### Order Management
- ✅ Complete order workflow
- ✅ Status tracking
- ✅ Order history
- ✅ Admin order management

#### Admin Panel
- ✅ Dashboard with statistics
- ✅ Order management
- ✅ Product management 
- ✅ Status updates

#### User Profile
- ✅ Profile information
- ✅ Order history
- ✅ Security settings
- ✅ Account management

### 7. API Endpoints

#### Orders
```
POST   /api/orders              - Create order
GET    /api/orders              - Get all orders (admin)
GET    /api/orders/myorders     - Get user orders
GET    /api/orders/:id          - Get single order
PUT    /api/orders/:id/status   - Update order status
```

#### Payment
```
POST   /api/payment/create-checkout-session  - Create Stripe session
POST   /api/payment/webhook                  - Stripe webhook
```

### 8. Database Schema

#### Order Collection
```javascript
{
  user: ObjectId,
  orderItems: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  shippingAddress: {
    name: String,
    address: String,
    city: String,
    pincode: String,
    phone: String
  },
  paymentMethod: String,
  paymentResult: Object,
  totalPrice: Number,
  isPaid: Boolean,
  status: String,
  orderNumber: String,
  createdAt: Date
}
```

## 🎉 Final Result

After implementing all these files and updates, you'll have:

- ✅ **Complete Payment System** (Stripe + COD)
- ✅ **Full Order Management** (Creation to Delivery)
- ✅ **Professional Admin Panel** (Product & Order Management)
- ✅ **User Profile System** (Profile & Order History)
- ✅ **Production-Ready Features** (Security, Error Handling)

**Your e-commerce platform will be fully functional and ready for real customers!** 🚀