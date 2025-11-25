<?php
/**
 * Quick Test - Shows exactly what's wrong with the dashboard
 */
session_start();
require_once __DIR__ . '/config/admin_config.php';
require_once __DIR__ . '/config/api_client.php';

?>
<!DOCTYPE html>
<html>
<head>
    <title>Quick Dashboard Test</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f0f0f0; }
        .box { background: white; padding: 20px; margin: 10px 0; border-radius: 5px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
        h2 { margin-top: 0; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
    </style>
</head>
<body>
    <h1>🔍 Quick Dashboard Test</h1>
    
    <?php
    // Test 1: Check if backend is running
    echo '<div class="box">';
    echo '<h2>1. Backend Connection</h2>';
    $testUrl = NODEJS_BACKEND_URL . '/admin/stats';
    $ch = curl_init($testUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 3,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json']
    ]);
    if (isset($_SESSION['admin_token'])) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $_SESSION['admin_token']
        ]);
    }
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo '<p class="error">❌ Cannot connect to backend: ' . htmlspecialchars($error) . '</p>';
        echo '<p><strong>Fix:</strong> Start your backend server:</p>';
        echo '<pre>cd pyramid-admin/backend
node app.js</pre>';
        echo '<p>Make sure it\'s running on port 5001</p>';
    } elseif ($httpCode === 401) {
        echo '<p class="error">❌ Authentication failed (401)</p>';
        echo '<p><strong>Fix:</strong> <a href="login.php">Login again</a></p>';
    } elseif ($httpCode === 200) {
        echo '<p class="success">✅ Backend is running!</p>';
        $data = json_decode($response, true);
        if ($data && isset($data['success']) && $data['success']) {
            echo '<p class="success">✅ API is responding correctly</p>';
        }
    } else {
        echo '<p class="error">❌ Backend returned HTTP ' . $httpCode . '</p>';
    }
    echo '</div>';
    
    // Test 2: Check API Client
    echo '<div class="box">';
    echo '<h2>2. API Client Test</h2>';
    $apiClient = getApiClient();
    if (isset($_SESSION['admin_token'])) {
        $apiClient->setToken($_SESSION['admin_token']);
        echo '<p>✅ Token is set</p>';
    } else {
        echo '<p class="error">❌ No token - <a href="login.php">Login first</a></p>';
    }
    
    $stats = $apiClient->getDashboardStats();
    echo '<h3>getDashboardStats() Result:</h3>';
    echo '<p><strong>Success:</strong> ' . ($stats['success'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</p>';
    echo '<p><strong>HTTP Code:</strong> ' . ($stats['http_code'] ?? 'N/A') . '</p>';
    
    if ($stats['success'] && isset($stats['data'])) {
        echo '<p class="success">✅ Data received!</p>';
        echo '<h4>Data Structure:</h4>';
        echo '<pre>' . print_r($stats['data'], true) . '</pre>';
        
        if (isset($stats['data']['totalOrders'])) {
            echo '<p class="success">✅ Found totalOrders: ' . $stats['data']['totalOrders'] . '</p>';
            echo '<p class="success">✅ Found totalProducts: ' . ($stats['data']['totalProducts'] ?? 0) . '</p>';
            echo '<p class="success">✅ Found totalUsers: ' . ($stats['data']['totalUsers'] ?? 0) . '</p>';
            
            if (($stats['data']['totalOrders'] ?? 0) === 0 && ($stats['data']['totalProducts'] ?? 0) === 0) {
                echo '<p class="warning">⚠️ Database is empty - no products, orders, or users</p>';
            }
        } else {
            echo '<p class="error">❌ Data structure is wrong - totalOrders not found</p>';
            echo '<p>Expected: $stats[\'data\'][\'totalOrders\']</p>';
        }
    } else {
        echo '<p class="error">❌ No data received</p>';
        if (isset($stats['error'])) {
            echo '<p>Error: ' . htmlspecialchars($stats['error']) . '</p>';
        }
    }
    echo '</div>';
    
    // Test 3: Products
    echo '<div class="box">';
    echo '<h2>3. Products Test</h2>';
    $products = $apiClient->getAdminProducts();
    echo '<p><strong>Success:</strong> ' . ($products['success'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</p>';
    if ($products['success'] && isset($products['data'])) {
        if (isset($products['data']['products'])) {
            $count = count($products['data']['products']);
            echo '<p class="success">✅ Found ' . $count . ' products</p>';
            if ($count === 0) {
                echo '<p class="warning">⚠️ No products in database</p>';
            }
        } else {
            echo '<p class="error">❌ Products structure wrong</p>';
            echo '<pre>' . print_r($products['data'], true) . '</pre>';
        }
    }
    echo '</div>';
    
    // Test 4: Users
    echo '<div class="box">';
    echo '<h2>4. Users Test</h2>';
    $users = $apiClient->getAdminUsers();
    echo '<p><strong>Success:</strong> ' . ($users['success'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</p>';
    if ($users['success'] && isset($users['data'])) {
        if (isset($users['data']['users'])) {
            $count = count($users['data']['users']);
            echo '<p class="success">✅ Found ' . $count . ' users</p>';
            if ($count === 0) {
                echo '<p class="warning">⚠️ No users in database</p>';
            }
        } else {
            echo '<p class="error">❌ Users structure wrong</p>';
            echo '<pre>' . print_r($users['data'], true) . '</pre>';
        }
    }
    echo '</div>';
    
    // Summary
    echo '<div class="box">';
    echo '<h2>Summary & Next Steps</h2>';
    if ($error) {
        echo '<p class="error"><strong>Main Issue:</strong> Backend server is not running</p>';
        echo '<ol>';
        echo '<li>Open terminal</li>';
        echo '<li>cd pyramid-admin/backend</li>';
        echo '<li>node app.js</li>';
        echo '<li>Wait for "Server running on 5001"</li>';
        echo '<li>Refresh this page</li>';
        echo '</ol>';
    } elseif ($httpCode === 401) {
        echo '<p class="error"><strong>Main Issue:</strong> Authentication required</p>';
        echo '<p><a href="login.php">Click here to login</a></p>';
    } elseif ($stats['success'] && isset($stats['data']['totalOrders']) && $stats['data']['totalOrders'] === 0) {
        echo '<p class="warning"><strong>Main Issue:</strong> Database is empty</p>';
        echo '<p>Your backend is working, but there\'s no data. You need to:</p>';
        echo '<ul>';
        echo '<li>Create products in the Products page</li>';
        echo '<li>Create users (or they will be created when they register)</li>';
        echo '<li>Create orders (or they will be created when customers purchase)</li>';
        echo '</ul>';
    } elseif ($stats['success']) {
        echo '<p class="success"><strong>✅ Everything looks good!</strong></p>';
        echo '<p>If dashboard still shows empty, check browser console for JavaScript errors.</p>';
        echo '<p><a href="index.php">Go to Dashboard</a></p>';
    } else {
        echo '<p class="error"><strong>Issue detected:</strong> Check the errors above</p>';
    }
    echo '</div>';
    ?>
    
    <div class="box">
        <p><a href="index.php">← Back to Dashboard</a> | <a href="debug-dashboard-api.php">Full Debug</a></p>
    </div>
</body>
</html>


