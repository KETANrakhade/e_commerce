<?php
// Simple debug page to test edit product functionality
session_start();

// Set a fake admin session for testing
$_SESSION['admin_logged_in'] = true;
$_SESSION['admin_name'] = 'Test Admin';
$_SESSION['admin_email'] = 'admin@test.com';

echo "<h1>Edit Product Debug</h1>";

// Test product ID
$testProductId = $_GET['id'] ?? '676664d3a2f0064d35ef06';

echo "<h2>Testing with Product ID: " . htmlspecialchars($testProductId) . "</h2>";

// Include API client
require_once __DIR__ . '/config/api_client.php';

try {
    $apiClient = getApiClient();
    echo "<p>✅ API Client created successfully</p>";
    
    // Test API connection
    $result = $apiClient->getProductById($testProductId);
    echo "<h3>API Response:</h3>";
    echo "<pre>" . print_r($result, true) . "</pre>";
    
    if ($result['success']) {
        echo "<p>✅ Product loaded successfully!</p>";
        echo "<p><strong>Product Name:</strong> " . htmlspecialchars($result['data']['name']) . "</p>";
        echo "<p><a href='index.php?page=edit-product&id=" . $testProductId . "'>Go to Edit Product Page</a></p>";
    } else {
        echo "<p>❌ Failed to load product</p>";
        echo "<p><strong>Error:</strong> " . htmlspecialchars($result['error'] ?? 'Unknown error') . "</p>";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Exception: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<h3>Available Products (for testing):</h3>";

try {
    $productsResult = $apiClient->getAdminProducts(['limit' => 5]);
    if ($productsResult['success'] && isset($productsResult['data']['products'])) {
        echo "<ul>";
        foreach ($productsResult['data']['products'] as $product) {
            $id = $product['_id'];
            $name = $product['name'];
            echo "<li><a href='index.php?page=edit-product&id=$id'>$name (ID: $id)</a></li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No products found or API error</p>";
    }
} catch (Exception $e) {
    echo "<p>Error loading products: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>