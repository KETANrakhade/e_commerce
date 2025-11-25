<?php
/**
 * Quick Debug Script for Dashboard API
 * Shows exactly what the API is returning
 */
session_start();
require_once __DIR__ . '/config/admin_config.php';
require_once __DIR__ . '/config/api_client.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard API Debug</title>
    <style>
        body { font-family: monospace; margin: 20px; background: #f5f5f5; }
        .section { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        pre { background: #f8f8f8; padding: 15px; overflow-x: auto; border-left: 4px solid #2196F3; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        h2 { margin-top: 0; }
    </style>
</head>
<body>
    <h1>🔍 Dashboard API Debug</h1>
    
    <div class="section">
        <h2>1. Configuration</h2>
        <p><strong>Backend URL:</strong> <?php echo NODEJS_BACKEND_URL; ?></p>
        <p><strong>Token Set:</strong> <?php echo isset($_SESSION['admin_token']) ? 'Yes (' . substr($_SESSION['admin_token'], 0, 20) . '...)' : 'No - <a href="login.php">Login First</a>'; ?></p>
    </div>

    <?php
    $apiClient = getApiClient();
    if (isset($_SESSION['admin_token'])) {
        $apiClient->setToken($_SESSION['admin_token']);
    }

    // Test getDashboardStats
    echo '<div class="section">';
    echo '<h2>2. getDashboardStats() Response</h2>';
    $dashboardStats = $apiClient->getDashboardStats();
    echo '<p><strong>Success:</strong> ' . ($dashboardStats['success'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</p>';
    echo '<p><strong>HTTP Code:</strong> ' . ($dashboardStats['http_code'] ?? 'N/A') . '</p>';
    if (isset($dashboardStats['error'])) {
        echo '<p class="error"><strong>Error:</strong> ' . htmlspecialchars($dashboardStats['error']) . '</p>';
    }
    echo '<h3>Full Response:</h3>';
    echo '<pre>' . print_r($dashboardStats, true) . '</pre>';
    
    if ($dashboardStats['success'] && isset($dashboardStats['data'])) {
        echo '<h3>Extracted Data:</h3>';
        echo '<pre>' . print_r($dashboardStats['data'], true) . '</pre>';
        
        if (isset($dashboardStats['data']['totalOrders'])) {
            echo '<p class="success">✅ Data structure is correct! Found totalOrders: ' . $dashboardStats['data']['totalOrders'] . '</p>';
        } else {
            echo '<p class="warning">⚠️ Data structure might be nested. Checking...</p>';
            if (isset($dashboardStats['data']['data'])) {
                echo '<p class="warning">Found nested data structure: $result[\'data\'][\'data\']</p>';
                echo '<pre>' . print_r($dashboardStats['data']['data'], true) . '</pre>';
            }
        }
    }
    echo '</div>';

    // Test raw API call
    echo '<div class="section">';
    echo '<h2>3. Raw API Call (makeRequest)</h2>';
    $rawResult = $apiClient->makeRequest('admin/stats');
    echo '<h3>Raw Response:</h3>';
    echo '<pre>' . print_r($rawResult, true) . '</pre>';
    
    if (isset($rawResult['data'])) {
        echo '<h3>Response Structure Analysis:</h3>';
        if (isset($rawResult['data']['success']) && isset($rawResult['data']['data'])) {
            echo '<p class="success">✅ Backend returns: {success: true, data: {...}}</p>';
            echo '<p>So we need to access: $result[\'data\'][\'data\']</p>';
        } elseif (isset($rawResult['data']['data'])) {
            echo '<p class="warning">⚠️ Found nested data at $result[\'data\'][\'data\']</p>';
        } else {
            echo '<p class="warning">⚠️ Data is directly in $result[\'data\']</p>';
        }
    }
    echo '</div>';

    // Test recent orders
    echo '<div class="section">';
    echo '<h2>4. getRecentOrders() Response</h2>';
    $recentOrders = $apiClient->getRecentOrders();
    echo '<p><strong>Success:</strong> ' . ($recentOrders['success'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</p>';
    if ($recentOrders['success'] && isset($recentOrders['data'])) {
        echo '<p><strong>Orders Count:</strong> ' . (is_array($recentOrders['data']) ? count($recentOrders['data']) : 'Not an array') . '</p>';
    }
    echo '<pre>' . print_r($recentOrders, true) . '</pre>';
    echo '</div>';

    // Recommendations
    echo '<div class="section">';
    echo '<h2>5. Recommendations</h2>';
    
    if (!isset($_SESSION['admin_token'])) {
        echo '<p class="error">❌ No authentication token. <a href="login.php">Please login first</a>.</p>';
    } elseif (!$dashboardStats['success']) {
        if (isset($dashboardStats['http_code']) && $dashboardStats['http_code'] === 0) {
            echo '<p class="error">❌ Cannot connect to backend server.</p>';
            echo '<p>Make sure backend is running:</p>';
            echo '<pre>cd pyramid-admin/backend
node app.js</pre>';
        } elseif (isset($dashboardStats['http_code']) && $dashboardStats['http_code'] === 401) {
            echo '<p class="error">❌ Authentication failed. <a href="login.php">Please login again</a>.</p>';
        } else {
            echo '<p class="error">❌ API call failed. Check the error above.</p>';
        }
    } elseif ($dashboardStats['success'] && isset($dashboardStats['data'])) {
        if (isset($dashboardStats['data']['totalOrders']) || (isset($dashboardStats['data']['data']) && isset($dashboardStats['data']['data']['totalOrders']))) {
            echo '<p class="success">✅ API is working! Data is being returned.</p>';
            $actualData = isset($dashboardStats['data']['data']) ? $dashboardStats['data']['data'] : $dashboardStats['data'];
            if (($actualData['totalOrders'] ?? 0) === 0 && ($actualData['totalProducts'] ?? 0) === 0) {
                echo '<p class="warning">⚠️ Database appears to be empty (all counts are 0).</p>';
                echo '<p>This is normal if you haven\'t created any products, orders, or users yet.</p>';
            }
        } else {
            echo '<p class="warning">⚠️ Data structure issue detected. Check the response structure above.</p>';
        }
    }
    echo '</div>';

    echo '<div class="section">';
    echo '<p><a href="index.php">← Back to Dashboard</a> | <a href="test-api-connection.php">Full Diagnostic</a></p>';
    echo '</div>';
    ?>
</body>
</html>


