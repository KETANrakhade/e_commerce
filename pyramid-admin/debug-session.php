<?php
session_start();

echo "<h1>Admin Session Debug</h1>";

echo "<h2>Session Data:</h2>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

echo "<h2>Session Status:</h2>";
echo "<ul>";
echo "<li><strong>Logged in:</strong> " . (isset($_SESSION['admin_logged_in']) ? 'Yes' : 'No') . "</li>";
echo "<li><strong>Has token:</strong> " . (isset($_SESSION['admin_token']) ? 'Yes' : 'No') . "</li>";
if (isset($_SESSION['admin_token'])) {
    echo "<li><strong>Token preview:</strong> " . substr($_SESSION['admin_token'], 0, 20) . "...</li>";
}
echo "<li><strong>Admin name:</strong> " . ($_SESSION['admin_name'] ?? 'Not set') . "</li>";
echo "<li><strong>Admin email:</strong> " . ($_SESSION['admin_email'] ?? 'Not set') . "</li>";
echo "<li><strong>Login time:</strong> " . (isset($_SESSION['admin_login_time']) ? date('Y-m-d H:i:s', $_SESSION['admin_login_time']) : 'Not set') . "</li>";
echo "</ul>";

if (isset($_SESSION['admin_token'])) {
    echo "<h2>Testing API with Token:</h2>";
    
    require_once 'config/api_client.php';
    
    try {
        $apiClient = getApiClient();
        
        // Test a simple API call
        $result = $apiClient->getDashboardStats();
        
        echo "<h3>Dashboard Stats API Test:</h3>";
        echo "<pre>";
        print_r($result);
        echo "</pre>";
        
        if ($result['success']) {
            echo "<p>✅ Token is working!</p>";
        } else {
            echo "<p>❌ Token failed. Error: " . htmlspecialchars($result['error'] ?? 'Unknown') . "</p>";
            if (isset($result['http_code'])) {
                echo "<p>HTTP Code: " . $result['http_code'] . "</p>";
            }
        }
        
    } catch (Exception $e) {
        echo "<p>❌ Exception: " . htmlspecialchars($e->getMessage()) . "</p>";
    }
} else {
    echo "<h2>❌ No Token Available</h2>";
    echo "<p>The admin session doesn't have a backend API token. This means:</p>";
    echo "<ul>";
    echo "<li>Admin logged in using fallback PHP authentication, or</li>";
    echo "<li>Backend server was not available during login, or</li>";
    echo "<li>Token was not properly saved during login</li>";
    echo "</ul>";
    echo "<p><strong>Solution:</strong> <a href='login.php'>Re-login</a> to get a fresh token.</p>";
}

echo "<hr>";
echo "<p><a href='index.php'>Back to Admin Panel</a></p>";
?>