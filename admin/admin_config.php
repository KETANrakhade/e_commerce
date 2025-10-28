<?php
// Admin Panel Configuration
define('USE_NODEJS_BACKEND', true);
define('NODEJS_BACKEND_URL', 'http://localhost:5000');
define('ADMIN_PANEL_URL', 'http://localhost:8080');

// Database Configuration (fallback)
define('DB_HOST', 'localhost');
define('DB_NAME', 'ecommerce_admin');
define('DB_USER', 'root');
define('DB_PASS', '');

// Session Configuration
ini_set('session.cookie_lifetime', 86400); // 24 hours
session_start();

// CORS Headers for API calls
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
?>
