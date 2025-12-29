<?php
require_once 'config/admin_config.php';
require_once 'config/api_client.php';

echo "<h1>🔍 Admin Panel API Debug</h1>";

// Check session
echo "<h2>Session Status:</h2>";
echo "<p><strong>Admin Logged In:</strong> " . (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] ? 'YES' : 'NO') . "</p>";
echo "<p><strong>Admin Token:</strong> " . (isset($_SESSION['admin_token']) ? 'YES (' . substr($_SESSION['admin_token'], 0, 20) . '...)' : 'NO') . "</p>";
echo "<p><strong>Admin Name:</strong> " . ($_SESSION['admin_name'] ?? 'Not set') . "</p>";
echo "<p><strong>Admin Email:</strong> " . ($_SESSION['admin_email'] ?? 'Not set') . "</p>";

echo "<h2>API Connection Test:</h2>";

// Test API connection
$apiClient = getApiClient();

// Test 1: Basic connection
echo "<h3>Test 1: Backend Health Check</h3>";
try {
    $result = $apiClient->makeRequest('health', 'GET');
    echo "<div style='background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>✅ Backend Connection:</strong> SUCCESS<br>";
    echo "<strong>Response:</strong> " . htmlspecialchars(is_array($result) ? json_encode($result) : $result) . "<br>";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>❌ Backend Connection:</strong> FAILED<br>";
    echo "<strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "</div>";
}

// Test 2: Admin login to get token
echo "<h3>Test 2: Admin Authentication</h3>";
try {
    $loginResult = $apiClient->adminLogin('admin@admin.com', 'admin123');
    echo "<div style='background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>✅ Admin Login:</strong> SUCCESS<br>";
    echo "<strong>Response:</strong> <pre>" . htmlspecialchars(json_encode($loginResult, JSON_PRETTY_PRINT)) . "</pre>";
    
    // Update session with token if login successful
    if ($loginResult['success'] && isset($loginResult['data']['data']['token'])) {
        $_SESSION['admin_token'] = $loginResult['data']['data']['token'];
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_name'] = $loginResult['data']['data']['name'] ?? 'Admin';
        $_SESSION['admin_email'] = $loginResult['data']['data']['email'] ?? 'admin@admin.com';
        echo "<strong>🔄 Session Updated:</strong> Token saved to session<br>";
    }
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>❌ Admin Login:</strong> FAILED<br>";
    echo "<strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "</div>";
}

// Test 3: Dashboard data with token
echo "<h3>Test 3: Dashboard Data (with token)</h3>";
try {
    $apiClient = getApiClient(); // Reinitialize with new token
    $dashboardResult = $apiClient->getDashboardStats();
    echo "<div style='background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>✅ Dashboard Data:</strong> SUCCESS<br>";
    echo "<strong>Response:</strong> <pre>" . htmlspecialchars(json_encode($dashboardResult, JSON_PRETTY_PRINT)) . "</pre>";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>❌ Dashboard Data:</strong> FAILED<br>";
    echo "<strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "</div>";
}

// Test 4: Products data
echo "<h3>Test 4: Products Data</h3>";
try {
    $productsResult = $apiClient->getProducts();
    echo "<div style='background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>✅ Products Data:</strong> SUCCESS<br>";
    echo "<strong>Count:</strong> " . (isset($productsResult['data']['products']) ? count($productsResult['data']['products']) : 'Unknown') . " products<br>";
    echo "<strong>Response:</strong> <pre>" . htmlspecialchars(json_encode($productsResult, JSON_PRETTY_PRINT)) . "</pre>";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>❌ Products Data:</strong> FAILED<br>";
    echo "<strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "</div>";
}

echo "<h2>Quick Actions:</h2>";
echo "<a href='index.php' style='padding: 10px; background: #007bff; color: white; text-decoration: none; margin: 5px; border-radius: 3px;'>Go to Dashboard</a>";
echo "<a href='login.php' style='padding: 10px; background: #28a745; color: white; text-decoration: none; margin: 5px; border-radius: 3px;'>Login Page</a>";
echo "<a href='logout.php' style='padding: 10px; background: #dc3545; color: white; text-decoration: none; margin: 5px; border-radius: 3px;'>Logout</a>";

echo "<h2>Session Data:</h2>";
echo "<pre>" . htmlspecialchars(print_r($_SESSION, true)) . "</pre>";
?>