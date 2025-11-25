<?php
/**
 * Test Product Creation
 */
session_start();
require_once 'config/admin_config.php';
require_once 'config/api_client.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Test Product Creation</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🧪 Test Product Creation</h1>
    
    <?php
    if (!isset($_SESSION['admin_token'])) {
        echo '<p class="error"><strong>⚠️ No token found!</strong> Please <a href="login.php">login first</a>.</p>';
    } else {
        echo '<p class="success">✅ Token found: ' . substr($_SESSION['admin_token'], 0, 30) . '...</p>';
        
        // Test product creation
        $apiClient = getApiClient();
        
        $testProduct = [
            'name' => 'Test Product ' . time(),
            'description' => 'Test description',
            'price' => 99.99,
            'category' => '69141ad4c612bb7ce06e230a', // Men's Fashion category ID
            'stock' => 10,
            'isActive' => true,
            'featured' => false
        ];
        
        echo '<h2>Test Data:</h2>';
        echo '<pre>';
        print_r($testProduct);
        echo '</pre>';
        
        echo '<h2>API Response:</h2>';
        $result = $apiClient->createProduct($testProduct);
        
        echo '<pre>';
        echo "Success: " . ($result['success'] ? '<span class="success">YES</span>' : '<span class="error">NO</span>') . "\n";
        echo "HTTP Code: " . ($result['http_code'] ?? 'N/A') . "\n";
        
        if ($result['success']) {
            echo '<span class="success">✅ Product created successfully!</span>' . "\n";
            if (isset($result['data']['data'])) {
                echo "\nCreated Product:\n";
                print_r($result['data']['data']);
            } elseif (isset($result['data'])) {
                print_r($result['data']);
            }
        } else {
            echo '<span class="error">❌ Failed to create product</span>' . "\n";
            echo "Error: " . ($result['data']['error'] ?? $result['data']['message'] ?? $result['error'] ?? 'Unknown error') . "\n";
            echo "\nFull Response:\n";
            print_r($result);
        }
        echo '</pre>';
    }
    ?>
    
    <hr>
    <p><a href="login.php">← Back to Login</a> | <a href="index.php?page=products">Go to Products Page</a></p>
</body>
</html>








