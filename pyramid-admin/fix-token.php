<?php
require_once 'config/admin_config.php';
require_once 'config/api_client.php';

echo "<h1>🔧 Token Fix</h1>";

// Check current status
echo "<h2>Current Status:</h2>";
echo "<p><strong>Admin Logged In:</strong> " . (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] ? 'YES' : 'NO') . "</p>";
echo "<p><strong>Has Token:</strong> " . (isset($_SESSION['admin_token']) && $_SESSION['admin_token'] ? 'YES' : 'NO') . "</p>";

if (!isset($_SESSION['admin_token']) || !$_SESSION['admin_token']) {
    echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>⚠️ Missing Token</strong><br>";
    echo "You're logged in but don't have a backend token. Let me fix this...";
    echo "</div>";
    
    // Get token from backend
    try {
        $apiClient = getApiClient();
        $loginResult = $apiClient->adminLogin('admin@admin.com', 'admin123');
        
        if ($loginResult['success'] && isset($loginResult['data']['data']['token'])) {
            $_SESSION['admin_token'] = $loginResult['data']['data']['token'];
            $_SESSION['admin_name'] = $loginResult['data']['data']['name'] ?? 'Admin User';
            $_SESSION['admin_email'] = $loginResult['data']['data']['email'] ?? 'admin@admin.com';
            
            echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
            echo "<strong>✅ Token Fixed!</strong><br>";
            echo "Backend token has been saved to your session.<br>";
            echo "<strong>Token:</strong> " . substr($_SESSION['admin_token'], 0, 20) . "...<br>";
            echo "</div>";
            
            // Test dashboard data
            echo "<h2>Testing Dashboard Data:</h2>";
            try {
                $dashboardResult = $apiClient->getDashboardStats();
                echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
                echo "<strong>✅ Dashboard Data Retrieved!</strong><br>";
                echo "The admin panel should now show data properly.<br>";
                echo "</div>";
            } catch (Exception $e) {
                echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
                echo "<strong>❌ Dashboard Test Failed:</strong> " . htmlspecialchars($e->getMessage());
                echo "</div>";
            }
            
        } else {
            echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
            echo "<strong>❌ Failed to get token</strong><br>";
            echo "Backend login failed. Response: " . json_encode($loginResult);
            echo "</div>";
        }
        
    } catch (Exception $e) {
        echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>❌ Error getting token:</strong> " . htmlspecialchars($e->getMessage());
        echo "</div>";
    }
} else {
    echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>✅ Token Already Present</strong><br>";
    echo "You have a valid token: " . substr($_SESSION['admin_token'], 0, 20) . "...";
    echo "</div>";
}

echo "<h2>Quick Actions:</h2>";
echo "<a href='index.php' style='padding: 10px; background: #007bff; color: white; text-decoration: none; margin: 5px; border-radius: 3px;'>Go to Dashboard</a>";
echo "<a href='login.php' style='padding: 10px; background: #28a745; color: white; text-decoration: none; margin: 5px; border-radius: 3px;'>Login Page</a>";

echo "<h2>Updated Session:</h2>";
echo "<p><strong>Admin Logged In:</strong> " . (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] ? 'YES' : 'NO') . "</p>";
echo "<p><strong>Has Token:</strong> " . (isset($_SESSION['admin_token']) && $_SESSION['admin_token'] ? 'YES' : 'NO') . "</p>";
echo "<p><strong>Admin Name:</strong> " . ($_SESSION['admin_name'] ?? 'Not set') . "</p>";
echo "<p><strong>Admin Email:</strong> " . ($_SESSION['admin_email'] ?? 'Not set') . "</p>";
?>