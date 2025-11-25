<?php
session_start();
require_once 'config/api_client.php';

echo "<h1>Category Debug</h1>";

// Check if logged in
echo "<h2>Session Info:</h2>";
echo "<pre>";
echo "Logged in: " . (isset($_SESSION['admin_logged_in']) ? 'YES' : 'NO') . "\n";
echo "Token: " . (isset($_SESSION['admin_token']) ? 'YES (exists)' : 'NO') . "\n";
echo "</pre>";

// Get API client
$apiClient = getApiClient();

// Test categories endpoint
echo "<h2>Testing Categories API:</h2>";
$categoriesData = $apiClient->makeRequest('categories');

echo "<h3>Raw Response:</h3>";
echo "<pre>";
print_r($categoriesData);
echo "</pre>";

// Parse categories
$availableCategories = [];

if ($categoriesData['success']) {
    echo "<h3>✅ API Call Successful</h3>";
    
    if (isset($categoriesData['data']['categories'])) {
        $availableCategories = $categoriesData['data']['categories'];
        echo "<p>Found categories in: data.categories</p>";
    } elseif (isset($categoriesData['data']['data']['categories'])) {
        $availableCategories = $categoriesData['data']['data']['categories'];
        echo "<p>Found categories in: data.data.categories</p>";
    } elseif (is_array($categoriesData['data'])) {
        $availableCategories = $categoriesData['data'];
        echo "<p>Found categories in: data (array)</p>";
    }
    
    echo "<h3>Parsed Categories (" . count($availableCategories) . "):</h3>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Name</th><th>Slug</th><th>Valid ID?</th></tr>";
    
    foreach ($availableCategories as $cat) {
        $catId = is_array($cat) ? ($cat['_id'] ?? $cat['id'] ?? '') : '';
        $catName = is_array($cat) ? ($cat['name'] ?? '') : $cat;
        $catSlug = is_array($cat) ? ($cat['slug'] ?? '') : '';
        $isValid = preg_match('/^[a-f0-9]{24}$/i', $catId) ? '✅ YES' : '❌ NO';
        
        echo "<tr>";
        echo "<td>" . htmlspecialchars($catId) . "</td>";
        echo "<td>" . htmlspecialchars($catName) . "</td>";
        echo "<td>" . htmlspecialchars($catSlug) . "</td>";
        echo "<td>" . $isValid . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} else {
    echo "<h3>❌ API Call Failed</h3>";
    echo "<p>Error: " . ($categoriesData['error'] ?? 'Unknown error') . "</p>";
    echo "<p>HTTP Code: " . ($categoriesData['http_code'] ?? 'N/A') . "</p>";
}

echo "<hr>";
echo "<a href='index.php?page=products&action=create'>Go to Add Product</a> | ";
echo "<a href='index.php'>Go to Dashboard</a>";
?>
