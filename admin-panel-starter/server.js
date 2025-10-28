const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/admin', require('./routes/admin'));

// Root redirect
app.get('/', (req, res) => {
    res.redirect('/admin');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

const PORT = process.env.ADMIN_PORT || 3001;
app.listen(PORT, () => {
    console.log(`🎛️  Admin Panel running on http://localhost:${PORT}/admin`);
    console.log(`📊 Make sure backend is running on http://localhost:5000`);
});