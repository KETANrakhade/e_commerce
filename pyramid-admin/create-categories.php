<?php
/**
 * Create Default Categories (Male and Female)
 */
session_start();
require_once 'config/admin_config.php';
require_once 'config/api_client.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Create Categories</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; overflow-x: auto; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>📁 Create Default Categories</h1>
    
    <?php
    if (!isset($_SESSION['admin_token'])) {
        echo '<p class="error"><strong>⚠️ No token found!</strong> Please <a href="login.php">login first</a>.</p>';
    } else {
        echo '<p class="success">✅ Token found: ' . substr($_SESSION['admin_token'], 0, 30) . '...</p>';
        
        $apiClient = getApiClient();
        
        // Check existing categories
        echo '<h2>1. Existing Categories</h2>';
        $categoriesData = $apiClient->makeRequest('categories');
        echo '<pre>';
        $existingCategories = [];
        if ($categoriesData['success']) {
            // Handle different response structures
            if (isset($categoriesData['data']['categories'])) {
                $existingCategories = $categoriesData['data']['categories'];
            } elseif (isset($categoriesData['data']['data']['categories'])) {
                $existingCategories = $categoriesData['data']['data']['categories'];
            } elseif (is_array($categoriesData['data'])) {
                $existingCategories = $categoriesData['data'];
            }
            
            if (!empty($existingCategories)) {
                echo "Found " . count($existingCategories) . " categories:\n";
                foreach ($existingCategories as $cat) {
                    $catName = is_array($cat) ? ($cat['name'] ?? 'Unknown') : $cat;
                    $catId = is_array($cat) ? ($cat['_id'] ?? 'N/A') : 'N/A';
                    echo "  - " . $catName . " (ID: " . $catId . ")\n";
                }
            } else {
                echo "No categories found in database.\n";
            }
        } else {
            echo "Error fetching categories.\n";
            echo "Error: " . ($categoriesData['data']['error'] ?? $categoriesData['error'] ?? 'Unknown') . "\n";
            echo "HTTP Code: " . ($categoriesData['http_code'] ?? 'N/A') . "\n";
        }
        echo '</pre>';
        
        // Create categories
        if (isset($_POST['create_categories'])) {
            echo '<h2>2. Creating Categories</h2>';
            
            $categoriesToCreate = [
                [
                    'name' => 'Male',
                    'description' => 'Men\'s fashion and clothing',
                    'isActive' => true
                ],
                [
                    'name' => 'Female',
                    'description' => 'Women\'s fashion and clothing',
                    'isActive' => true
                ]
            ];
            
            echo '<pre>';
            foreach ($categoriesToCreate as $catData) {
                echo "Creating category: {$catData['name']}...\n";
                
                // Check if category already exists (use existing categories from above)
                $exists = false;
                foreach ($existingCategories as $existing) {
                    $existingName = is_array($existing) ? ($existing['name'] ?? '') : $existing;
                    if (strtolower($existingName) === strtolower($catData['name'])) {
                        $existingId = is_array($existing) ? ($existing['_id'] ?? 'N/A') : 'N/A';
                        echo "<span class='info'>⚠️ Category '{$catData['name']}' already exists (ID: {$existingId})</span>\n";
                        $exists = true;
                        break;
                    }
                }
                
                if (!$exists) {
                    // Use admin endpoint to create category
                    $result = $apiClient->makeRequest('admin/categories', 'POST', $catData);
                
                    if ($result['success']) {
                        echo "<span class='success'>✅ Created: {$catData['name']}</span>\n";
                        if (isset($result['data']['data'])) {
                            echo "  ID: " . ($result['data']['data']['_id'] ?? 'N/A') . "\n";
                        } elseif (isset($result['data'])) {
                            echo "  ID: " . ($result['data']['_id'] ?? 'N/A') . "\n";
                        }
                    } else {
                        echo "<span class='error'>❌ Failed: {$catData['name']}</span>\n";
                        echo "  Error: " . ($result['data']['error'] ?? $result['data']['message'] ?? $result['error'] ?? 'Unknown') . "\n";
                        echo "  HTTP Code: " . ($result['http_code'] ?? 'N/A') . "\n";
                        if (isset($result['raw_response'])) {
                            echo "  Response: " . substr($result['raw_response'], 0, 200) . "\n";
                        }
                    }
                }
                echo "\n";
            }
            echo '</pre>';
            
            echo '<p><a href="create-categories.php">Refresh to see updated categories</a></p>';
        } else {
            echo '<h2>2. Create Default Categories</h2>';
            echo '<form method="POST">';
            echo '<p>This will create "Male" and "Female" categories.</p>';
            echo '<button type="submit" name="create_categories" style="background: #28a745; color: white; border: none; padding: 10px 20px; cursor: pointer;">Create Male & Female Categories</button>';
            echo '</form>';
        }
    }
    ?>
    
    <hr>
    <p><a href="login.php">← Back to Login</a> | <a href="index.php?page=products">Go to Products Page</a></p>
</body>
</html>

