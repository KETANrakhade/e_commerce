// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { testConnection } = require('./config/cloudinary');

const app = express();
connectDB();

// Test Cloudinary connection
testConnection();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json()); 

// routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/subcategories', require('./routes/subcategoryRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));

// Stripe webhook route needs raw body - mount separately
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), require('./controllers/paymentController').webhookHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
