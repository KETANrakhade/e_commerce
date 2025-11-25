<?php
/**
 * Test API Connection and Data Fetching
 */
session_start();
require_once 'config/admin_config.php';
require_once 'config/api_client.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; overflow-x: auto; }
        h2 { border-bottom: 2px solid #333; padding-bottom: 5px; }
    </style>
</head>
<body>
    <h1>🔍 API Connection Test</h1>
    
    <h2>1. Session Status</h2>
    <pre>
Logged In: <?php echo isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>'; ?>

Admin Token: <?php 
    if (isset($_SESSION['admin_token'])) {
        echo '<span class="success">SET</span> (' . substr($_SESSION['admin_token'], 0, 30) . '...)';
    } else {
        echo '<span class="error">NOT SET</span>';
    }
?>

Admin Email: <?php echo $_SESSION['admin_email'] ?? 'NOT SET'; ?>
    </pre>

    <?php if (!isset($_SESSION['admin_token'])): ?>
        <p class="error"><strong>⚠️ No token found!</strong> Please <a href="login.php">login first</a>.</p>
    <?php else: ?>
        <h2>2. Test API Calls</h2>
        
        <?php
        $apiClient = getApiClient();
        
        // Test Products
        echo "<h3>📦 Products API</h3>";
        $productsData = $apiClient->getAdminProducts(['limit' => 5]);
        echo "<pre>";
        echo "Success: " . ($productsData['success'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>') . "\n";
        echo "HTTP Code: " . ($productsData['http_code'] ?? 'N/A') . "\n";
        if ($productsData['success']) {
            $productCount = 0;
            if (isset($productsData['data']['products'])) {
                $productCount = count($productsData['data']['products']);
            } elseif (is_array($productsData['data']) && isset($productsData['data'][0])) {
                $productCount = count($productsData['data']);
            }
            echo "Products Found: <span class='success'>$productCount</span>\n";
            if ($productCount > 0) {
                echo "\nFirst Product:\n";
                if (isset($productsData['data']['products'][0])) {
                    print_r($productsData['data']['products'][0]);
                } elseif (isset($productsData['data'][0])) {
                    print_r($productsData['data'][0]);
                }
            }
        } else {
            echo "Error: " . ($productsData['data']['error'] ?? $productsData['error'] ?? 'Unknown') . "\n";
        }
        echo "</pre>";
        
        // Test Users
        echo "<h3>👥 Users API</h3>";
        $usersData = $apiClient->getAdminUsers(['limit' => 5]);
        echo "<pre>";
        echo "Success: " . ($usersData['success'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>') . "\n";
        echo "HTTP Code: " . ($usersData['http_code'] ?? 'N/A') . "\n";
        if ($usersData['success']) {
            $userCount = 0;
            if (isset($usersData['data']['users'])) {
                $userCount = count($usersData['data']['users']);
            } elseif (is_array($usersData['data']) && isset($usersData['data'][0])) {
                $userCount = count($usersData['data']);
            }
            echo "Users Found: <span class='success'>$userCount</span>\n";
            if ($userCount > 0) {
                echo "\nFirst User:\n";
                if (isset($usersData['data']['users'][0])) {
                    print_r($usersData['data']['users'][0]);
                } elseif (isset($usersData['data'][0])) {
                    print_r($usersData['data'][0]);
                }
            }
        } else {
            echo "Error: " . ($usersData['data']['error'] ?? $usersData['error'] ?? 'Unknown') . "\n";
        }
        echo "</pre>";
        
        // Test Dashboard Stats
        echo "<h3>📊 Dashboard Stats API</h3>";
        $statsData = $apiClient->getDashboardStats();
        echo "<pre>";
        echo "Success: " . ($statsData['success'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>') . "\n";
        echo "HTTP Code: " . ($statsData['http_code'] ?? 'N/A') . "\n";
        if ($statsData['success'] && isset($statsData['data'])) {
            echo "Stats:\n";
            print_r($statsData['data']);
        } else {
            echo "Error: " . ($statsData['data']['error'] ?? $statsData['error'] ?? 'Unknown') . "\n";
        }
        echo "</pre>";
        ?>
        
        <h2>3. Raw Response (Debug)</h2>
        <details>
            <summary>Click to expand raw responses</summary>
            <pre><?php 
                echo "Products Response:\n";
                print_r($productsData);
                echo "\n\nUsers Response:\n";
                print_r($usersData);
            ?></pre>
        </details>
    <?php endif; ?>
    
    <hr>
    <p><a href="login.php">← Back to Login</a> | <a href="index.php">Go to Admin Panel</a></p>
</body>
</html>








