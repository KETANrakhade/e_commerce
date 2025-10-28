// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json()); 

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Stripe webhook route needs raw body - mount separately
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), require('./controllers/paymentController').webhookHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
