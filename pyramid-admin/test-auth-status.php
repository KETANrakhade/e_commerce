<?php
require_once 'config/admin_config.php';

echo "<h1>Admin Authentication Status</h1>";

echo "<h2>Session Information:</h2>";
echo "<ul>";
echo "<li><strong>Session Status:</strong> " . (session_status() === PHP_SESSION_ACTIVE ? 'Active' : 'Inactive') . "</li>";
echo "<li><strong>Admin Logged In:</strong> " . (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] ? 'YES' : 'NO') . "</li>";
echo "<li><strong>Admin Token:</strong> " . (isset($_SESSION['admin_token']) ? 'SET (' . substr($_SESSION['admin_token'], 0, 20) . '...)' : 'NOT SET') . "</li>";
echo "<li><strong>Admin Name:</strong> " . ($_SESSION['admin_name'] ?? 'Not set') . "</li>";
echo "<li><strong>Admin Email:</strong> " . ($_SESSION['admin_email'] ?? 'Not set') . "</li>";
echo "</ul>";

if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
    echo "<div style='color: red; font-weight: bold; padding: 15px; border: 2px solid red; margin: 10px 0;'>";
    echo "❌ NOT LOGGED IN!<br>";
    echo "You need to login to access the admin panel.<br>";
    echo "<a href='login.php'>Click here to login</a>";
    echo "</div>";
} else {
    echo "<div style='color: green; font-weight: bold; padding: 15px; border: 2px solid green; margin: 10px 0;'>";
    echo "✅ LOGGED IN SUCCESSFULLY!<br>";
    echo "You can access admin panel features.";
    echo "</div>";
    
    // Test API connection
    if (isset($_SESSION['admin_token'])) {
        echo "<h2>API Connection Test:</h2>";
        
        $apiClient = getApiClient();
        $apiClient->setToken($_SESSION['admin_token']);
        
        // Test getting a product
        $testProductId = '6965fca99eedf986e2c18a53'; // Use the ID from the screenshot
        $result = $apiClient->getProductById($testProductId);
        
        echo "<h3>Test Product Retrieval (ID: $testProductId):</h3>";
        echo "<pre>";
        print_r($result);
        echo "</pre>";
        
        if ($result['success'] && isset($result['data'])) {
            echo "<div style='color: green; padding: 10px; border: 1px solid green;'>";
            echo "✅ API Connection Working! Product data retrieved successfully.";
            echo "</div>";
        } else {
            echo "<div style='color: red; padding: 10px; border: 1px solid red;'>";
            echo "❌ API Connection Failed: " . ($result['error'] ?? 'Unknown error');
            echo "</div>";
        }
    }
}

echo "<h2>Quick Actions:</h2>";
echo "<ul>";
echo "<li><a href='login.php'>Go to Login Page</a></li>";
echo "<li><a href='index.php'>Go to Admin Dashboard</a></li>";
echo "<li><a href='index.php?page=products'>Go to Products Page</a></li>";
echo "<li><a href='index.php?page=products&action=edit&id=6965fca99eedf986e2c18a53'>Test Product Edit Form</a></li>";
echo "</ul>";
?>