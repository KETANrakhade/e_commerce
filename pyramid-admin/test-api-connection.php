<?php
/**
 * API Connection Test Script
 * Use this to diagnose why the dashboard is empty
 */

require_once __DIR__ . '/config/admin_config.php';
require_once __DIR__ . '/config/api_client.php';

echo "<h1>🔍 API Connection Diagnostic</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; }
    .error { color: red; }
    .warning { color: orange; }
    .info { background: #e3f2fd; padding: 10px; margin: 10px 0; border-left: 4px solid #2196F3; }
    pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
</style>";

// Test 1: Check configuration
echo "<h2>1. Configuration Check</h2>";
echo "<div class='info'>";
echo "<strong>Backend URL:</strong> " . NODEJS_BACKEND_URL . "<br>";
echo "<strong>Use Node.js Backend:</strong> " . (USE_NODEJS_BACKEND ? 'Yes' : 'No') . "<br>";
echo "<strong>Session Token:</strong> " . (isset($_SESSION['admin_token']) ? 'Set (' . substr($_SESSION['admin_token'], 0, 20) . '...)' : 'Not set') . "<br>";
echo "</div>";

// Test 2: Test basic connection
echo "<h2>2. Backend Connection Test</h2>";
$testUrl = NODEJS_BACKEND_URL . '/admin/stats';
echo "<p>Testing: <code>$testUrl</code></p>";

$ch = curl_init($testUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 5,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json'
    ]
]);

if (isset($_SESSION['admin_token'])) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . $_SESSION['admin_token']
    ]);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "<p class='error'>❌ Connection Error: $error</p>";
    echo "<p class='warning'>⚠️ Make sure your backend server is running!</p>";
    echo "<p>Expected URL: " . NODEJS_BACKEND_URL . "</p>";
    echo "<p>If your backend runs on a different port, update <code>NODEJS_BACKEND_URL</code> in <code>config/admin_config.php</code></p>";
} else {
    echo "<p class='success'>✅ Connection successful (HTTP $httpCode)</p>";
    
    $data = json_decode($response, true);
    echo "<h3>Response:</h3>";
    echo "<pre>" . print_r($data, true) . "</pre>";
    
    if ($httpCode === 401) {
        echo "<p class='error'>❌ Authentication failed. You need to login first.</p>";
        echo "<p><a href='login.php'>Go to Login</a></p>";
    } elseif ($httpCode === 200 && isset($data['success']) && $data['success']) {
        echo "<p class='success'>✅ API is working correctly!</p>";
        if (isset($data['data'])) {
            echo "<h3>Data Structure:</h3>";
            echo "<pre>" . print_r($data['data'], true) . "</pre>";
        }
    } else {
        echo "<p class='warning'>⚠️ Unexpected response format</p>";
    }
}

// Test 3: Test API Client
echo "<h2>3. API Client Test</h2>";
$apiClient = getApiClient();
if (isset($_SESSION['admin_token'])) {
    $apiClient->setToken($_SESSION['admin_token']);
}

$dashboardStats = $apiClient->getDashboardStats();
echo "<h3>getDashboardStats() Result:</h3>";
echo "<pre>" . print_r($dashboardStats, true) . "</pre>";

if ($dashboardStats['success']) {
    echo "<p class='success'>✅ API Client is working!</p>";
    if (isset($dashboardStats['data'])) {
        $stats = $dashboardStats['data'];
        echo "<h3>Dashboard Stats:</h3>";
        echo "<ul>";
        echo "<li>Total Orders: " . ($stats['totalOrders'] ?? 0) . "</li>";
        echo "<li>Total Revenue: $" . number_format($stats['totalRevenue'] ?? 0, 2) . "</li>";
        echo "<li>Total Products: " . ($stats['totalProducts'] ?? 0) . "</li>";
        echo "<li>Total Users: " . ($stats['totalUsers'] ?? 0) . "</li>";
        echo "</ul>";
        
        if (($stats['totalOrders'] ?? 0) === 0 && ($stats['totalProducts'] ?? 0) === 0) {
            echo "<p class='warning'>⚠️ Database appears to be empty. You may need to:</p>";
            echo "<ul>";
            echo "<li>Seed the database with sample data</li>";
            echo "<li>Create some products, orders, and users</li>";
            echo "</ul>";
        }
    }
} else {
    echo "<p class='error'>❌ API Client failed</p>";
    if (isset($dashboardStats['error'])) {
        echo "<p>Error: " . $dashboardStats['error'] . "</p>";
    }
    if (isset($dashboardStats['http_code']) && $dashboardStats['http_code'] === 401) {
        echo "<p><a href='login.php'>Please login first</a></p>";
    }
}

// Test 4: Check database connection (if we can)
echo "<h2>4. Recommendations</h2>";
echo "<div class='info'>";
if ($error) {
    echo "<p><strong>Backend not running:</strong></p>";
    echo "<ol>";
    echo "<li>Navigate to <code>pyramid-admin/backend</code> directory</li>";
    echo "<li>Run: <code>npm install</code> (if not done already)</li>";
    echo "<li>Create a <code>.env</code> file with:</li>";
    echo "<pre>PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret</pre>";
    echo "<li>Run: <code>node app.js</code> or <code>npm start</code></li>";
    echo "<li>Verify it's running on port 5001 (or update config if different)</li>";
    echo "</ol>";
} elseif ($httpCode === 401) {
    echo "<p><strong>Authentication required:</strong></p>";
    echo "<ol>";
    echo "<li>Go to <a href='login.php'>login.php</a></li>";
    echo "<li>Login with admin credentials</li>";
    echo "<li>Return to dashboard</li>";
    echo "</ol>";
} elseif ($dashboardStats['success'] && isset($dashboardStats['data'])) {
    $stats = $dashboardStats['data'];
    if (($stats['totalOrders'] ?? 0) === 0) {
        echo "<p><strong>Database is empty:</strong></p>";
        echo "<ol>";
        echo "<li>Create some products in the Products page</li>";
        echo "<li>Create some test orders</li>";
        echo "<li>Or run database seed script if available</li>";
        echo "</ol>";
    } else {
        echo "<p class='success'>✅ Everything looks good! If dashboard is still empty, check browser console for JavaScript errors.</p>";
    }
}
echo "</div>";

echo "<hr>";
echo "<p><a href='index.php'>← Back to Dashboard</a> | <a href='login.php'>Login</a></p>";
?>


