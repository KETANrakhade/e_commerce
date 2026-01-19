<?php
// Test script to verify product update API
session_start();

// Set fake admin session
$_SESSION['admin_logged_in'] = true;
$_SESSION['admin_token'] = 'test-token';

require_once 'pyramid-admin/config/api_client.php';

$productId = '696634d3a2f0064d35ef06'; // Use a real product ID from your database
$testData = [
    'name' => 'Test Product Update',
    'price' => 999.99,
    'countInStock' => 50,
    'description' => 'Updated description for testing'
];

echo "<h1>Product Update API Test</h1>";
echo "<h2>Testing Product ID: " . htmlspecialchars($productId) . "</h2>";

try {
    $apiClient = getApiClient();
    
    // First, get the current product
    echo "<h3>1. Getting current product data...</h3>";
    $currentProduct = $apiClient->getProductById($productId);
    
    if ($currentProduct['success']) {
        echo "<p>✅ Product found!</p>";
        echo "<p><strong>Current Name:</strong> " . htmlspecialchars($currentProduct['data']['name']) . "</p>";
        echo "<p><strong>Current Price:</strong> ₹" . number_format($currentProduct['data']['price'], 2) . "</p>";
        echo "<p><strong>Current Stock:</strong> " . $currentProduct['data']['countInStock'] . "</p>";
        
        // Now try to update it
        echo "<h3>2. Updating product...</h3>";
        echo "<p><strong>New Data:</strong></p>";
        echo "<pre>" . print_r($testData, true) . "</pre>";
        
        $updateResult = $apiClient->updateProduct($productId, $testData);
        
        echo "<h3>3. Update Result:</h3>";
        echo "<pre>" . print_r($updateResult, true) . "</pre>";
        
        if ($updateResult['success']) {
            echo "<p>✅ Update successful!</p>";
            
            // Verify the update by fetching the product again
            echo "<h3>4. Verifying update...</h3>";
            $verifyProduct = $apiClient->getProductById($productId);
            
            if ($verifyProduct['success']) {
                echo "<p><strong>Updated Name:</strong> " . htmlspecialchars($verifyProduct['data']['name']) . "</p>";
                echo "<p><strong>Updated Price:</strong> ₹" . number_format($verifyProduct['data']['price'], 2) . "</p>";
                echo "<p><strong>Updated Stock:</strong> " . $verifyProduct['data']['countInStock'] . "</p>";
                
                if ($verifyProduct['data']['countInStock'] == $testData['countInStock']) {
                    echo "<p>✅ Stock quantity updated correctly!</p>";
                } else {
                    echo "<p>❌ Stock quantity not updated. Expected: " . $testData['countInStock'] . ", Got: " . $verifyProduct['data']['countInStock'] . "</p>";
                }
            } else {
                echo "<p>❌ Failed to verify update</p>";
            }
        } else {
            echo "<p>❌ Update failed: " . htmlspecialchars($updateResult['error'] ?? 'Unknown error') . "</p>";
        }
        
    } else {
        echo "<p>❌ Product not found: " . htmlspecialchars($currentProduct['error'] ?? 'Unknown error') . "</p>";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Exception: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<p><a href='pyramid-admin/index.php?page=products'>Back to Products</a></p>";
?>