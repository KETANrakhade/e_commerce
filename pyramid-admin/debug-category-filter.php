<?php
// Debug Category Filter
session_start();

// Include API client
require_once __DIR__ . '/config/api_client.php';

$apiClient = getApiClient();

// Test 1: Get all products without filter
echo "<h2>Test 1: All Products (No Filter)</h2>\n";
$allProducts = $apiClient->getAdminProducts();
echo "<pre>";
echo "Success: " . ($allProducts['success'] ? 'YES' : 'NO') . "\n";
if ($allProducts['success']) {
    echo "Products count: " . count($allProducts['data']['products']) . "\n";
    echo "Categories available: " . count($allProducts['data']['categories']) . "\n";
    
    echo "\nAvailable Categories:\n";
    foreach ($allProducts['data']['categories'] as $cat) {
        echo "- ID: " . $cat['_id'] . " | Name: " . $cat['name'] . "\n";
    }
    
    echo "\nFirst 3 products:\n";
    foreach (array_slice($allProducts['data']['products'], 0, 3) as $product) {
        $categoryName = is_array($product['category']) ? $product['category']['name'] : 'Unknown';
        echo "- " . $product['name'] . " | Category: " . $categoryName . "\n";
    }
} else {
    echo "Error: " . ($allProducts['error'] ?? 'Unknown error') . "\n";
}
echo "</pre>\n";

// Test 2: Get products with category filter (if categories exist)
if ($allProducts['success'] && !empty($allProducts['data']['categories'])) {
    $testCategory = $allProducts['data']['categories'][0];
    $categoryId = $testCategory['_id'];
    $categoryName = $testCategory['name'];
    
    echo "<h2>Test 2: Filter by Category '$categoryName' (ID: $categoryId)</h2>\n";
    $filteredProducts = $apiClient->getAdminProducts(['category' => $categoryId]);
    echo "<pre>";
    echo "Success: " . ($filteredProducts['success'] ? 'YES' : 'NO') . "\n";
    if ($filteredProducts['success']) {
        echo "Filtered products count: " . count($filteredProducts['data']['products']) . "\n";
        
        echo "\nFiltered products:\n";
        foreach ($filteredProducts['data']['products'] as $product) {
            $productCategoryName = is_array($product['category']) ? $product['category']['name'] : 'Unknown';
            echo "- " . $product['name'] . " | Category: " . $productCategoryName . "\n";
        }
    } else {
        echo "Error: " . ($filteredProducts['error'] ?? 'Unknown error') . "\n";
    }
    echo "</pre>\n";
    
    // Test 3: Test with invalid category ID
    echo "<h2>Test 3: Filter by Invalid Category ID</h2>\n";
    $invalidProducts = $apiClient->getAdminProducts(['category' => '507f1f77bcf86cd799439011']);
    echo "<pre>";
    echo "Success: " . ($invalidProducts['success'] ? 'YES' : 'NO') . "\n";
    echo "Products count: " . count($invalidProducts['data']['products'] ?? []) . "\n";
    if (!$invalidProducts['success']) {
        echo "Error: " . ($invalidProducts['error'] ?? 'Unknown error') . "\n";
    }
    echo "</pre>\n";
}

// Test 4: Direct API call to backend
echo "<h2>Test 4: Direct Backend API Call</h2>\n";
$backendUrl = 'http://localhost:5001/api/admin/products';
$token = $_SESSION['admin_token'] ?? null;

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $backendUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . $token
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "<pre>";
echo "HTTP Code: $httpCode\n";
echo "cURL Error: " . ($error ?: 'None') . "\n";
echo "Response: " . substr($response, 0, 500) . "...\n";
echo "</pre>\n";

?>