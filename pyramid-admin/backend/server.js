require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

connectDB();

const app = express();

// CORS must be before other middleware - allow all origins
app.use(cors());

app.use(express.json());
app.use(morgan('dev'));

// Disable helmet for now to avoid blocking requests
// app.use(helmet());

// rate limiter - disabled for testing
// app.use(rateLimit({ windowMs: 1*60*1000, max: 100 }));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payments', require('./routes/payment'));

// serve uploads (if using local storage)  
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// error handlers
app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
