const express = require('express');
const router = express.Router();
const axios = require('axios');

// Backend API configuration
const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.redirect('/admin/login');
    }
    // Add token to request headers for API calls
    req.apiHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    next();
};

// Login page
router.get('/login', (req, res) => {
    res.render('login', { error: req.query.error });
});

// Login POST
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const response = await axios.post(`${API_BASE}/admin/login`, {
            email,
            password
        });
        
        if (response.data.token) {
            res.cookie('adminToken', response.data.token, { 
                httpOnly: true, 
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            res.redirect('/admin');
        } else {
            res.redirect('/admin/login?error=Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error.message);
        res.redirect('/admin/login?error=Login failed');
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
});

// Dashboard
router.get('/', requireAuth, async (req, res) => {
    try {
        const [statsRes, ordersRes, analyticsRes] = await Promise.all([
            axios.get(`${API_BASE}/admin/stats`, { headers: req.apiHeaders }),
            axios.get(`${API_BASE}/admin/recent-orders`, { headers: req.apiHeaders }),
            axios.get(`${API_BASE}/admin/sales-analytics`, { headers: req.apiHeaders })
        ]);
        
        res.render('dashboard', {
            stats: statsRes.data,
            orders: ordersRes.data,
            analytics: analyticsRes.data,
            currentPage: 'dashboard'
        });
    } catch (error) {
        console.error('Dashboard error:', error.message);
        res.redirect('/admin/login?error=Session expired');
    }
});

// Products
router.get('/products', requireAuth, async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/admin/products`, { 
            headers: req.apiHeaders,
            params: req.query
        });
        
        res.render('products', {
            products: response.data,
            currentPage: 'products',
            query: req.query
        });
    } catch (error) {
        console.error('Products error:', error.message);
        res.render('products', { 
            products: { products: [], pagination: {} }, 
            error: 'Failed to load products',
            currentPage: 'products'
        });
    }
});

// Orders
router.get('/orders', requireAuth, async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/admin/orders`, { 
            headers: req.apiHeaders,
            params: req.query
        });
        
        res.render('orders', {
            orders: response.data,
            currentPage: 'orders',
            query: req.query
        });
    } catch (error) {
        console.error('Orders error:', error.message);
        res.render('orders', { 
            orders: { orders: [], pagination: {} }, 
            error: 'Failed to load orders',
            currentPage: 'orders'
        });
    }
});

// Users
router.get('/users', requireAuth, async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/admin/users`, { 
            headers: req.apiHeaders,
            params: req.query
        });
        
        res.render('users', {
            users: response.data,
            currentPage: 'users',
            query: req.query
        });
    } catch (error) {
        console.error('Users error:', error.message);
        res.render('users', { 
            users: { users: [], pagination: {} }, 
            error: 'Failed to load users',
            currentPage: 'users'
        });
    }
});

module.exports = router;