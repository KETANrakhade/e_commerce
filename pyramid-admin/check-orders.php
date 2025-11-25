<?php
/**
 * Check Orders in Database
 */
session_start();
require_once 'config/admin_config.php';
require_once 'config/api_client.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Check Orders</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; overflow-x: auto; }
        h2 { border-bottom: 2px solid #333; padding-bottom: 5px; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🛒 Orders Check</h1>
    
    <h2>1. Authentication Status</h2>
    <pre>
Logged In: <?php echo isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>'; ?>

Admin Token: <?php 
    if (isset($_SESSION['admin_token'])) {
        echo '<span class="success">SET</span> (' . substr($_SESSION['admin_token'], 0, 30) . '...)';
    } else {
        echo '<span class="error">NOT SET</span>';
    }
?>
    </pre>

    <?php if (!isset($_SESSION['admin_token'])): ?>
        <p class="error"><strong>⚠️ No token found!</strong> Please <a href="login.php">login first</a>.</p>
    <?php else: ?>
        <h2>2. Test Orders API</h2>
        
        <?php
        $apiClient = getApiClient();
        
        // Test Orders API
        echo "<h3>📦 Orders API</h3>";
        $ordersData = $apiClient->getAdminOrders(['limit' => 10]);
        echo "<pre>";
        echo "Success: " . ($ordersData['success'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>') . "\n";
        echo "HTTP Code: " . ($ordersData['http_code'] ?? 'N/A') . "\n";
        
        if ($ordersData['success']) {
            $orderCount = 0;
            $orders = [];
            
            if (isset($ordersData['data']['orders'])) {
                $orders = $ordersData['data']['orders'];
                $orderCount = count($orders);
            } elseif (is_array($ordersData['data']) && isset($ordersData['data'][0])) {
                $orders = $ordersData['data'];
                $orderCount = count($orders);
            }
            
            echo "Orders Found: <span class='" . ($orderCount > 0 ? 'success' : 'warning') . "'>$orderCount</span>\n";
            
            if (isset($ordersData['data']['pagination'])) {
                echo "Total in Database: " . ($ordersData['data']['pagination']['total'] ?? 'N/A') . "\n";
            }
            
            if ($orderCount > 0) {
                echo "\nFirst Order:\n";
                print_r($orders[0]);
            } else {
                echo "\n<span class='warning'>No orders found in database.</span>\n";
                echo "Orders will appear here after customers make purchases.\n";
            }
        } else {
            echo "Error: " . ($ordersData['data']['error'] ?? $ordersData['error'] ?? 'Unknown') . "\n";
            if (isset($ordersData['data'])) {
                echo "\nFull Error Response:\n";
                print_r($ordersData['data']);
            }
        }
        echo "</pre>";
        
        // Test Recent Orders
        echo "<h3>📋 Recent Orders API</h3>";
        $recentOrdersData = $apiClient->getRecentOrders();
        echo "<pre>";
        echo "Success: " . ($recentOrdersData['success'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>') . "\n";
        echo "HTTP Code: " . ($recentOrdersData['http_code'] ?? 'N/A') . "\n";
        
        if ($recentOrdersData['success']) {
            $recentCount = 0;
            if (is_array($recentOrdersData['data']) && isset($recentOrdersData['data'][0])) {
                $recentCount = count($recentOrdersData['data']);
            } elseif (isset($recentOrdersData['data']['orders'])) {
                $recentCount = count($recentOrdersData['data']['orders']);
            }
            echo "Recent Orders Found: <span class='" . ($recentCount > 0 ? 'success' : 'warning') . "'>$recentCount</span>\n";
        } else {
            echo "Error: " . ($recentOrdersData['data']['error'] ?? $recentOrdersData['error'] ?? 'Unknown') . "\n";
        }
        echo "</pre>";
        ?>
        
        <h2>3. Raw Response (Debug)</h2>
        <details>
            <summary>Click to expand raw responses</summary>
            <pre><?php 
                echo "Orders Response:\n";
                print_r($ordersData);
                echo "\n\nRecent Orders Response:\n";
                print_r($recentOrdersData);
            ?></pre>
        </details>
    <?php endif; ?>
    
    <hr>
    <p><a href="login.php">← Back to Login</a> | <a href="index.php?page=orders">Go to Orders Page</a> | <a href="test-api.php">Test All APIs</a></p>
</body>
</html>








