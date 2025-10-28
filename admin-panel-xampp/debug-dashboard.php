<?php
session_start();

// Force login for testing
$_SESSION['admin_logged_in'] = true;
$_SESSION['admin_email'] = 'admin@admin.com';

echo "<h1>🔍 Dashboard Debug</h1>";

// Include the sample data
require_once 'config/sample_data.php';

echo "<h3>Testing Sample Data:</h3>";

// Test each function
echo "<h4>1. Dashboard Stats:</h4>";
$stats = getSampleDashboardStats();
if ($stats['success']) {
    echo "<p>✅ Total Orders: " . $stats['data']['totalOrders'] . "</p>";
    echo "<p>✅ Total Revenue: $" . number_format($stats['data']['totalRevenue'], 2) . "</p>";
    echo "<p>✅ Total Products: " . $stats['data']['totalProducts'] . "</p>";
    echo "<p>✅ Total Users: " . $stats['data']['totalUsers'] . "</p>";
} else {
    echo "<p>❌ Dashboard stats failed</p>";
}

echo "<h4>2. Recent Orders:</h4>";
$orders = getSampleRecentOrders();
if ($orders['success'] && !empty($orders['data'])) {
    echo "<p>✅ Found " . count($orders['data']) . " orders</p>";
    foreach ($orders['data'] as $order) {
        echo "<p>- Order " . $order['id'] . ": " . $order['customer'] . " - $" . $order['total'] . "</p>";
    }
} else {
    echo "<p>❌ No orders found</p>";
}

echo "<h4>3. makeApiCall Function:</h4>";
$apiResult = makeApiCall('/admin/stats');
if ($apiResult['success']) {
    echo "<p>✅ makeApiCall working - Total Orders: " . $apiResult['data']['totalOrders'] . "</p>";
} else {
    echo "<p>❌ makeApiCall failed</p>";
}

echo "<h3>Dashboard Page Test:</h3>";
echo "<p>Now testing the actual dashboard page...</p>";

// Include the dashboard page logic
ob_start();
include 'pages/dashboard.php';
$dashboardContent = ob_get_clean();

if (strpos($dashboardContent, '156') !== false) {
    echo "<p>✅ Dashboard page contains sample data (found '156')</p>";
} else {
    echo "<p>❌ Dashboard page doesn't contain expected sample data</p>";
}

echo "<h3>Quick Actions:</h3>";
echo "<a href='index.php' style='padding: 10px; background: #28a745; color: white; text-decoration: none; margin: 5px;'>View Dashboard</a>";
echo "<a href='login.php' style='padding: 10px; background: #007bff; color: white; text-decoration: none; margin: 5px;'>Login Page</a>";
?>