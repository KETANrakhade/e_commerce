<?php
// Admin Configuration
define('ADMIN_EMAIL', 'admin@admin.com');
define('ADMIN_PASSWORD', 'admin123'); // Change this to your desired password
define('ADMIN_NAME', 'Admin User');
define('DEBUG_MODE', true); // Set to false in production

// Node.js Backend Configuration
define('NODEJS_BACKEND_URL', 'http://localhost:3003/api');
define('USE_NODEJS_BACKEND', true); // Set to false to use PHP fallback only

// Session configurationkil
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Debug function
function debugSession($message = '') {
    if (DEBUG_MODE) {
        echo "<!-- DEBUG: $message | Session Status: " . session_status() . " | Logged In: " . (isset($_SESSION['admin_logged_in']) ? 'YES' : 'NO') . " | Backend: " . (USE_NODEJS_BACKEND ? 'Node.js' : 'PHP') . " -->\n";
    }
}

// Include API client for Node.js backend connectivity
if (USE_NODEJS_BACKEND) {
    require_once __DIR__ . '/api_client.php';
}
?>