<?php
// Direct API test for product update
session_start();

// Set admin session for testing
$_SESSION['admin_logged_in'] = true;
$_SESSION['admin_token'] = 'test-token'; // You'll need to get a real token

$productId = '696634d3a2f0064d35ef06'; // Use a real product ID
$testStock = 99; // Test stock value

echo "<h1>Direct API Update Test</h1>";

// Test 1: Direct curl request
echo "<h2>Test 1: Direct cURL Request</h2>";

$url = "http://localhost:5001/api/admin/products/$productId";
$data = json_encode([
    'name' => 'Test Product Update',
    'price' => 1000,
    'countInStock' => $testStock,
    'description' => 'Test update'
]);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => 'PUT',
    CURLOPT_POSTFIELDS => $data,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . ($_SESSION['admin_token'] ?? '')
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<p><strong>URL:</strong> $url</p>";
echo "<p><strong>Data sent:</strong> $data</p>";
echo "<p><strong>HTTP Code:</strong> $httpCode</p>";
echo "<p><strong>Response:</strong> <pre>$response</pre></p>";

// Test 2: Using API Client
echo "<h2>Test 2: Using API Client</h2>";

require_once 'pyramid-admin/config/api_client.php';

try {
    $apiClient = getApiClient();
    
    $productData = [
        'name' => 'API Client Test',
        'price' => 1500,
        'countInStock' => $testStock + 10,
        'description' => 'API client test update'
    ];
    
    echo "<p><strong>Data to send:</strong> <pre>" . print_r($productData, true) . "</pre></p>";
    
    $result = $apiClient->updateProduct($productId, $productData);
    
    echo "<p><strong>API Client Result:</strong> <pre>" . print_r($result, true) . "</pre></p>";
    
    if ($result['success']) {
        echo "<p>✅ API Client update successful!</p>";
        
        // Verify by getting the product
        $verifyResult = $apiClient->getProductById($productId);
        if ($verifyResult['success']) {
            $product = $verifyResult['data'];
            echo "<p><strong>Verified Stock:</strong> " . $product['countInStock'] . "</p>";
            
            if ($product['countInStock'] == $productData['countInStock']) {
                echo "<p>✅ Stock updated correctly!</p>";
            } else {
                echo "<p>❌ Stock not updated. Expected: " . $productData['countInStock'] . ", Got: " . $product['countInStock'] . "</p>";
            }
        }
    } else {
        echo "<p>❌ API Client update failed</p>";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Exception: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<p><a href='pyramid-admin/index.php?page=products'>Back to Products</a></p>";
?>