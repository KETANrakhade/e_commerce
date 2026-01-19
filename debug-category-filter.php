<?php
// Debug category filter
session_start();

// Set admin session
$_SESSION['admin_logged_in'] = true;
$_SESSION['admin_token'] = 'test-token';

require_once 'pyramid-admin/config/api_client.php';

echo "<h1>Category Filter Debug</h1>";

$apiClient = getApiClient();

// Test 1: Get all products
echo "<h2>Test 1: All Products</h2>";
$allProducts = $apiClient->getAdminProducts(['limit' => 5]);
if ($allProducts['success']) {
    echo "<p>Total products found: " . count($allProducts['data']['products']) . "</p>";
    echo "<h3>Available Categories:</h3>";
    if (isset($allProducts['data']['categories'])) {
        echo "<ul>";
        foreach ($allProducts['data']['categories'] as $cat) {
            echo "<li><strong>ID:</strong> " . ($cat['_id'] ?? 'N/A') . " - <strong>Name:</strong> " . ($cat['name'] ?? 'N/A') . "</li>";
        }
        echo "</ul>";
    }
    
    echo "<h3>Sample Products:</h3>";
    foreach ($allProducts['data']['products'] as $product) {
        $categoryName = is_array($product['category']) ? ($product['category']['name'] ?? 'N/A') : 'N/A';
        echo "<p><strong>" . $product['name'] . "</strong> - Category: " . $categoryName . "</p>";
    }
} else {
    echo "<p>Error: " . ($allProducts['error'] ?? 'Unknown error') . "</p>";
}

// Test 2: Filter by "Men" category
echo "<h2>Test 2: Filter by 'Men'</h2>";
$menProducts = $apiClient->getAdminProducts(['category' => 'Men', 'limit' => 5]);
if ($menProducts['success']) {
    echo "<p>Men products found: " . count($menProducts['data']['products']) . "</p>";
    foreach ($menProducts['data']['products'] as $product) {
        $categoryName = is_array($product['category']) ? ($product['category']['name'] ?? 'N/A') : 'N/A';
        echo "<p><strong>" . $product['name'] . "</strong> - Category: " . $categoryName . "</p>";
    }
} else {
    echo "<p>Error: " . ($menProducts['error'] ?? 'Unknown error') . "</p>";
}

// Test 3: Filter by "Women" category
echo "<h2>Test 3: Filter by 'Women'</h2>";
$womenProducts = $apiClient->getAdminProducts(['category' => 'Women', 'limit' => 5]);
if ($womenProducts['success']) {
    echo "<p>Women products found: " . count($womenProducts['data']['products']) . "</p>";
    foreach ($womenProducts['data']['products'] as $product) {
        $categoryName = is_array($product['category']) ? ($product['category']['name'] ?? 'N/A') : 'N/A';
        echo "<p><strong>" . $product['name'] . "</strong> - Category: " . $categoryName . "</p>";
    }
} else {
    echo "<p>Error: " . ($womenProducts['error'] ?? 'Unknown error') . "</p>";
}

echo "<hr>";
echo "<p><a href='pyramid-admin/index.php?page=products'>Back to Products</a></p>";
?>