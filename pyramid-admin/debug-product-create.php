<?php
/**
 * Debug Product Creation
 */
session_start();
require_once 'config/admin_config.php';
require_once 'config/api_client.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Debug Product Creation</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; overflow-x: auto; }
        h2 { border-bottom: 2px solid #333; padding-bottom: 5px; }
    </style>
</head>
<body>
    <h1>🔍 Debug Product Creation</h1>
    
    <?php
    echo '<h2>1. Authentication Status</h2>';
    echo '<pre>';
    echo "Logged In: " . (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>') . "\n";
    echo "Token: " . (isset($_SESSION['admin_token']) ? '<span class="success">SET</span> (' . substr($_SESSION['admin_token'], 0, 30) . '...)' : '<span class="error">NOT SET</span>') . "\n";
    echo '</pre>';
    
    if (!isset($_SESSION['admin_token'])) {
        echo '<p class="error"><strong>⚠️ No token!</strong> Please <a href="login.php">login first</a>.</p>';
    } else {
        echo '<h2>2. Test API Endpoint</h2>';
        
        $apiClient = getApiClient();
        $baseUrl = defined('NODEJS_BACKEND_URL') ? NODEJS_BACKEND_URL : 'http://localhost:5001/api';
        $endpoint = 'admin/products';
        $fullUrl = rtrim($baseUrl, '/') . '/' . ltrim($endpoint, '/');
        
        echo '<pre>';
        echo "Base URL: $baseUrl\n";
        echo "Endpoint: $endpoint\n";
        echo "Full URL: <span class='info'>$fullUrl</span>\n";
        echo "Method: POST\n";
        echo '</pre>';
        
        echo '<h2>3. Test Request</h2>';
        
        $testData = [
            'name' => 'Test Product ' . time(),
            'description' => 'Test description',
            'price' => 99.99,
            'category' => '69141ad4c612bb7ce06e230a', // Men's Fashion
            'stock' => 10,
            'isActive' => true
        ];
        
        echo '<pre>';
        echo "Request Data:\n";
        print_r($testData);
        echo '</pre>';
        
        echo '<h2>4. API Response</h2>';
        $result = $apiClient->createProduct($testData);
        
        echo '<pre>';
        echo "Success: " . ($result['success'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>') . "\n";
        echo "HTTP Code: " . ($result['http_code'] ?? 'N/A') . "\n";
        echo "Error: " . ($result['error'] ?? 'None') . "\n";
        
        if ($result['success']) {
            echo '<span class="success">✅ Product created successfully!</span>' . "\n";
            if (isset($result['data'])) {
                echo "\nResponse Data:\n";
                print_r($result['data']);
            }
        } else {
            echo '<span class="error">❌ Failed to create product</span>' . "\n";
            if (isset($result['data'])) {
                echo "\nError Details:\n";
                print_r($result['data']);
            }
            if (isset($result['raw_response'])) {
                echo "\nRaw Response:\n";
                echo htmlspecialchars(substr($result['raw_response'], 0, 500));
            }
        }
        echo '</pre>';
        
        echo '<h2>5. Manual cURL Test</h2>';
        echo '<pre>';
        echo "You can test manually with:\n";
        echo "curl -X POST '$fullUrl' \\\n";
        echo "  -H 'Content-Type: application/json' \\\n";
        echo "  -H 'Authorization: Bearer " . substr($_SESSION['admin_token'], 0, 30) . "...' \\\n";
        echo "  -d '" . json_encode($testData) . "'\n";
        echo '</pre>';
    }
    ?>
    
    <hr>
    <p><a href="login.php">← Back to Login</a> | <a href="index.php?page=products">Go to Products Page</a></p>
</body>
</html>








