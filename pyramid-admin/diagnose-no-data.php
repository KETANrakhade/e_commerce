<?php
/**
 * Comprehensive Diagnostic Tool for Admin Panel Data Issues
 */
session_start();
require_once __DIR__ . '/config/admin_config.php';
require_once __DIR__ . '/config/api_client.php';

?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel Data Diagnostic</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        .info { color: #17a2b8; }
        h2 { margin-top: 0; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; border-left: 4px solid #007bff; }
        .fix-box { background: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0; }
        ul { margin: 10px 0; padding-left: 20px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🔍 Admin Panel Data Diagnostic</h1>
    
    <?php
    $issues = [];
    $fixes = [];
    
    // Test 1: Check Session & Authentication
    echo '<div class="section">';
    echo '<h2>1. Authentication Status</h2>';
    
    $loggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
    $hasToken = isset($_SESSION['admin_token']) && !empty($_SESSION['admin_token']);
    
    if ($loggedIn) {
        echo '<p class="success">✅ Session: Logged in</p>';
    } else {
        echo '<p class="error">❌ Session: NOT logged in</p>';
        $issues[] = 'Not logged in';
        $fixes[] = '<a href="login.php">Go to login page</a> and login with admin credentials';
    }
    
    if ($hasToken) {
        echo '<p class="success">✅ Token: Present (' . substr($_SESSION['admin_token'], 0, 20) . '...)</p>';
    } else {
        echo '<p class="error">❌ Token: Missing</p>';
        $issues[] = 'No authentication token';
        $fixes[] = '<a href="login.php">Login again</a> to get a new token';
    }
    
    echo '</div>';
    
    // Test 2: Backend Connection
    echo '<div class="section">';
    echo '<h2>2. Backend Server Connection</h2>';
    
    $backendUrl = NODEJS_BACKEND_URL;
    echo '<p><strong>Backend URL:</strong> <code>' . $backendUrl . '</code></p>';
    
    $ch = curl_init($backendUrl . '/admin/stats');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json']
    ]);
    
    if ($hasToken) {
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
        echo '<p class="error">❌ Connection Error: ' . htmlspecialchars($error) . '</p>';
        $issues[] = 'Backend server not running';
        $fixes[] = 'Start backend: <code>cd pyramid-admin/backend && node server.js</code>';
    } elseif ($httpCode === 0) {
        echo '<p class="error">❌ Cannot connect to backend</p>';
        $issues[] = 'Backend server not accessible';
        $fixes[] = 'Check if backend is running on port 5001';
    } elseif ($httpCode === 401) {
        echo '<p class="warning">⚠️ Authentication required (401)</p>';
        if (!$hasToken) {
            $issues[] = 'No authentication token';
            $fixes[] = '<a href="login.php">Login first</a>';
        } else {
            $issues[] = 'Token invalid or expired';
            $fixes[] = '<a href="login.php">Login again</a> to refresh token';
        }
    } elseif ($httpCode === 200) {
        echo '<p class="success">✅ Backend is running and responding</p>';
        $data = json_decode($response, true);
        if ($data && isset($data['success']) && $data['success']) {
            echo '<p class="success">✅ API is working correctly</p>';
        }
    } else {
        echo '<p class="error">❌ Unexpected response: HTTP ' . $httpCode . '</p>';
        $issues[] = 'Backend returned error: ' . $httpCode;
    }
    
    echo '</div>';
    
    // Test 3: API Client Test
    echo '<div class="section">';
    echo '<h2>3. API Client Test</h2>';
    
    if ($hasToken) {
        $apiClient = getApiClient();
        $apiClient->setToken($_SESSION['admin_token']);
        
        $dashboardStats = $apiClient->getDashboardStats();
        
        echo '<p><strong>getDashboardStats() Result:</strong></p>';
        echo '<p>Success: ' . ($dashboardStats['success'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</p>';
        echo '<p>HTTP Code: ' . ($dashboardStats['http_code'] ?? 'N/A') . '</p>';
        
        if ($dashboardStats['success']) {
            echo '<p class="success">✅ API Client is working!</p>';
            
            if (isset($dashboardStats['data'])) {
                $stats = $dashboardStats['data'];
                echo '<h3>Dashboard Statistics:</h3>';
                echo '<ul>';
                echo '<li>Total Orders: <strong>' . ($stats['totalOrders'] ?? 0) . '</strong></li>';
                echo '<li>Total Revenue: <strong>₹' . number_format($stats['totalRevenue'] ?? 0, 2) . '</strong></li>';
                echo '<li>Total Products: <strong>' . ($stats['totalProducts'] ?? 0) . '</strong></li>';
                echo '<li>Total Users: <strong>' . ($stats['totalUsers'] ?? 0) . '</strong></li>';
                echo '</ul>';
                
                if (($stats['totalOrders'] ?? 0) === 0 && 
                    ($stats['totalProducts'] ?? 0) === 0 && 
                    ($stats['totalUsers'] ?? 0) === 0) {
                    echo '<p class="warning">⚠️ Database appears to be EMPTY</p>';
                    $issues[] = 'No data in database';
                    $fixes[] = 'Create products, users, and orders. Database is working but has no data.';
                } else {
                    echo '<p class="success">✅ Data exists in database</p>';
                }
                
                echo '<h4>Full Response:</h4>';
                echo '<pre>' . print_r($stats, true) . '</pre>';
            } else {
                echo '<p class="error">❌ No data in response</p>';
                echo '<pre>' . print_r($dashboardStats, true) . '</pre>';
            }
        } else {
            echo '<p class="error">❌ API call failed</p>';
            if (isset($dashboardStats['error'])) {
                echo '<p>Error: ' . htmlspecialchars($dashboardStats['error']) . '</p>';
            }
            if (isset($dashboardStats['data']['error'])) {
                echo '<p>Error: ' . htmlspecialchars($dashboardStats['data']['error']) . '</p>';
            }
            echo '<pre>' . print_r($dashboardStats, true) . '</pre>';
        }
    } else {
        echo '<p class="error">❌ Cannot test API - no token available</p>';
    }
    
    echo '</div>';
    
    // Test 4: Database Connection (indirect test)
    echo '<div class="section">';
    echo '<h2>4. Database Status</h2>';
    
    if ($hasToken && isset($dashboardStats) && $dashboardStats['success']) {
        echo '<p class="success">✅ Database connection is working (backend can query it)</p>';
        
        // Test products
        $products = $apiClient->getAdminProducts(['limit' => 1]);
        if ($products['success']) {
            $productCount = 0;
            if (isset($products['data']['products'])) {
                $productCount = count($products['data']['products']);
            } elseif (isset($products['data']['pagination']['total'])) {
                $productCount = $products['data']['pagination']['total'];
            }
            echo '<p>Products in database: <strong>' . $productCount . '</strong></p>';
        }
        
        // Test users
        $users = $apiClient->getAdminUsers(['limit' => 1]);
        if ($users['success']) {
            $userCount = 0;
            if (isset($users['data']['users'])) {
                $userCount = count($users['data']['users']);
            } elseif (isset($users['data']['pagination']['total'])) {
                $userCount = $users['data']['pagination']['total'];
            }
            echo '<p>Users in database: <strong>' . $userCount . '</strong></p>';
        }
    } else {
        echo '<p class="warning">⚠️ Cannot test database - authentication required</p>';
    }
    
    echo '</div>';
    
    // Summary & Fixes
    echo '<div class="section">';
    echo '<h2>📋 Summary & Solutions</h2>';
    
    if (empty($issues)) {
        echo '<p class="success">✅ Everything looks good! If dashboard still shows empty, check:</p>';
        echo '<ul>';
        echo '<li>Browser console for JavaScript errors (F12)</li>';
        echo '<li>Check if data actually exists in database</li>';
        echo '<li>Try refreshing the dashboard page</li>';
        echo '</ul>';
    } else {
        echo '<p class="error"><strong>Issues Found:</strong></p>';
        echo '<ul>';
        foreach ($issues as $issue) {
            echo '<li>' . htmlspecialchars($issue) . '</li>';
        }
        echo '</ul>';
        
        echo '<div class="fix-box">';
        echo '<p class="info"><strong>How to Fix:</strong></p>';
        echo '<ol>';
        foreach ($fixes as $fix) {
            echo '<li>' . $fix . '</li>';
        }
        echo '</ol>';
        echo '</div>';
    }
    
    echo '</div>';
    
    // Quick Actions
    echo '<div class="section">';
    echo '<h2>🚀 Quick Actions</h2>';
    echo '<p>';
    echo '<a href="login.php" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 5px; display: inline-block;">Login</a> ';
    echo '<a href="index.php" style="padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 5px; display: inline-block;">Go to Dashboard</a> ';
    echo '<a href="quick-test.php" style="padding: 10px 20px; background: #17a2b8; color: white; text-decoration: none; border-radius: 4px; margin: 5px; display: inline-block;">Quick Test</a>';
    echo '</p>';
    echo '</div>';
    ?>
</body>
</html>


