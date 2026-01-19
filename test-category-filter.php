<?php
// Simple test for category filtering
session_start();

// Set a test admin token (you may need to get this from your session)
$_SESSION['admin_token'] = 'your-admin-token-here'; // Replace with actual token

// Include API client
require_once 'pyramid-admin/config/api_client.php';

$apiClient = getApiClient();

echo "<h1>Category Filter Test</h1>\n";

// Test 1: Get all products
echo "<h2>1. All Products</h2>\n";
$allProducts = $apiClient->getAdminProducts();
if ($allProducts['success']) {
    echo "✅ Success! Found " . count($allProducts['data']['products']) . " products<br>\n";
    echo "📁 Categories available: " . count($allProducts['data']['categories']) . "<br>\n";
    
    if (!empty($allProducts['data']['categories'])) {
        echo "<ul>\n";
        foreach ($allProducts['data']['categories'] as $cat) {
            echo "<li>ID: " . $cat['_id'] . " | Name: " . $cat['name'] . "</li>\n";
        }
        echo "</ul>\n";
        
        // Test 2: Filter by first category
        $testCategory = $allProducts['data']['categories'][0];
        echo "<h2>2. Filter by Category: " . $testCategory['name'] . "</h2>\n";
        
        $filteredProducts = $apiClient->getAdminProducts(['category' => $testCategory['_id']]);
        if ($filteredProducts['success']) {
            echo "✅ Success! Found " . count($filteredProducts['data']['products']) . " products in this category<br>\n";
            
            if (!empty($filteredProducts['data']['products'])) {
                echo "<ul>\n";
                foreach (array_slice($filteredProducts['data']['products'], 0, 5) as $product) {
                    $categoryName = is_array($product['category']) ? $product['category']['name'] : 'Unknown';
                    echo "<li>" . $product['name'] . " (Category: " . $categoryName . ")</li>\n";
                }
                echo "</ul>\n";
            }
        } else {
            echo "❌ Failed to filter products: " . ($filteredProducts['error'] ?? 'Unknown error') . "<br>\n";
        }
    } else {
        echo "⚠️ No categories found in the system<br>\n";
    }
} else {
    echo "❌ Failed to get products: " . ($allProducts['error'] ?? 'Unknown error') . "<br>\n";
}

echo "<hr>\n";
echo "<p><a href='pyramid-admin/index.php?page=products'>← Back to Products Page</a></p>\n";
?>