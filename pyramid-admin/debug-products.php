<?php
session_start();
require_once 'config/api_client.php';

echo "<h1>Products Debug</h1>";

// Check session
echo "<h2>Session Info:</h2>";
echo "<pre>";
echo "Logged in: " . (isset($_SESSION['admin_logged_in']) ? 'YES' : 'NO') . "\n";
echo "Token exists: " . (isset($_SESSION['admin_token']) ? 'YES' : 'NO') . "\n";
if (isset($_SESSION['admin_token'])) {
    echo "Token: " . substr($_SESSION['admin_token'], 0, 30) . "...\n";
}
echo "</pre>";

// Get API client
$apiClient = getApiClient();

// Test products endpoint
echo "<h2>Testing Products API:</h2>";
$productsData = $apiClient->makeRequest('admin/products');

echo "<h3>Response Status:</h3>";
echo "<p>Success: " . ($productsData['success'] ? '✅ YES' : '❌ NO') . "</p>";
echo "<p>HTTP Code: " . ($productsData['http_code'] ?? 'N/A') . "</p>";

if (!$productsData['success']) {
    echo "<p style='color: red;'>Error: " . ($productsData['error'] ?? 'Unknown error') . "</p>";
}

echo "<h3>Raw Response:</h3>";
echo "<pre>";
print_r($productsData);
echo "</pre>";

// Parse products
if ($productsData['success'] && isset($productsData['data'])) {
    $data = $productsData['data'];
    
    echo "<h3>Data Structure:</h3>";
    echo "<pre>";
    echo "Keys in data: " . implode(', ', array_keys($data)) . "\n";
    echo "</pre>";
    
    // Try to find products
    $products = [];
    if (isset($data['products'])) {
        $products = $data['products'];
        echo "<p>✅ Found products in: data.products</p>";
    } elseif (isset($data['data']['products'])) {
        $products = $data['data']['products'];
        echo "<p>✅ Found products in: data.data.products</p>";
    } elseif (is_array($data) && isset($data[0])) {
        $products = $data;
        echo "<p>✅ Found products in: data (array)</p>";
    }
    
    echo "<h3>Products Found: " . count($products) . "</h3>";
    
    if (count($products) > 0) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Category</th></tr>";
        
        foreach (array_slice($products, 0, 10) as $prod) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($prod['_id'] ?? 'N/A') . "</td>";
            echo "<td>" . htmlspecialchars($prod['name'] ?? 'N/A') . "</td>";
            echo "<td>₹" . ($prod['price'] ?? 0) . "</td>";
            echo "<td>" . ($prod['stock'] ?? 0) . "</td>";
            
            $catName = 'N/A';
            if (isset($prod['category'])) {
                if (is_array($prod['category'])) {
                    $catName = $prod['category']['name'] ?? 'N/A';
                } else {
                    $catName = $prod['category'];
                }
            }
            echo "<td>" . htmlspecialchars($catName) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        if (count($products) > 10) {
            echo "<p>... and " . (count($products) - 10) . " more products</p>";
        }
    } else {
        echo "<p style='color: orange;'>⚠️ No products found in database</p>";
    }
} else {
    echo "<h3>❌ Failed to get products data</h3>";
}

echo "<hr>";
echo "<a href='index.php?page=products'>Go to Products Page</a> | ";
echo "<a href='index.php'>Go to Dashboard</a>";
?>
