<?php
/**
 * Test User View Functionality
 */

require_once 'pyramid-admin/config/admin_config.php';
require_once 'pyramid-admin/config/api_client.php';

echo "<h1>🧪 User View Test</h1>";

// Test API connection
$apiClient = getApiClient();

echo "<h3>📊 Testing User API Endpoints</h3>";

// Test getting users list
echo "<h4>1. Testing getAdminUsers()</h4>";
$usersResult = $apiClient->getAdminUsers(['limit' => 5]);
echo "<pre>" . htmlspecialchars(json_encode($usersResult, JSON_PRETTY_PRINT)) . "</pre>";

if ($usersResult['success'] && isset($usersResult['data']['users']) && !empty($usersResult['data']['users'])) {
    $testUser = $usersResult['data']['users'][0];
    $testUserId = $testUser['_id'];
    
    echo "<h4>2. Testing getUserById() with ID: {$testUserId}</h4>";
    $userResult = $apiClient->getUserById($testUserId);
    echo "<pre>" . htmlspecialchars(json_encode($userResult, JSON_PRETTY_PRINT)) . "</pre>";
    
    echo "<h4>3. Testing getUserOrders() with ID: {$testUserId}</h4>";
    $ordersResult = $apiClient->getUserOrders($testUserId);
    echo "<pre>" . htmlspecialchars(json_encode($ordersResult, JSON_PRETTY_PRINT)) . "</pre>";
    
    echo "<h4>4. Testing User View URL</h4>";
    $viewUrl = "pyramid-admin/index.php?page=users&action=view&id={$testUserId}";
    echo "<p><a href='{$viewUrl}' target='_blank'>Click here to test user view page</a></p>";
    
} else {
    echo "<p>❌ No users found or API error. Cannot test individual user view.</p>";
}

echo "<hr>";
echo "<h3>💡 Troubleshooting</h3>";
echo "<ul>";
echo "<li>Make sure backend server is running on port 5001</li>";
echo "<li>Make sure admin panel server is running on port 8000</li>";
echo "<li>Check if you're logged in to the admin panel</li>";
echo "<li>Verify that users exist in the database</li>";
echo "</ul>";
?>