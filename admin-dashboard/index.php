<?php
require_once 'config/admin_config.php';

// Debug session
debugSession('Index.php loaded');

// Force logout if requested
if (isset($_GET['force_logout'])) {
    session_destroy();
    header('Location: login.php?message=session_cleared');
    exit();
}

// Check authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    debugSession('Not logged in, redirecting to login');
    header('Location: login.php');
    exit();
}

debugSession('User is logged in');

// Handle logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    header('Location: login.php');
    exit();
}

// Get admin user info
$admin_user = [
    'name' => $_SESSION['admin_name'] ?? 'Admin User',
    'email' => $_SESSION['admin_email'] ?? 'admin@pyramid.com',
    'id' => $_SESSION['admin_id'] ?? ''
];

// Initialize API client with token if available
if (USE_NODEJS_BACKEND && isset($_SESSION['admin_token'])) {
    $apiClient = getApiClient();
    $apiClient->setToken($_SESSION['admin_token']);
}

// Get current page
$page = $_GET['page'] ?? 'dashboard';

// Validate page
$allowed_pages = ['dashboard', 'products', 'orders', 'users', 'settings'];
if (!in_array($page, $allowed_pages)) {
    $page = 'dashboard';
}

include("layout/header.php");
include("layout/sidebar.php");

// Include the requested page
switch($page) {
    case 'dashboard':
        include("pages/dashboard.php");
        break;
    case 'products':
        include("pages/products.php");
        break;
    case 'orders':
        include("pages/orders.php");
        break;
    case 'users':
        include("pages/users.php");
        break;
    case 'settings':
        include("pages/settings.php");
        break;
    default:
        include("pages/dashboard.php");
}

include("layout/footer.php");
?>

