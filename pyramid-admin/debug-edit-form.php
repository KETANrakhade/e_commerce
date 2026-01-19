<?php
// Debug Edit Form - Check why form is truncated
require_once 'config/admin_config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Debug Edit Form Issue</h1>";

// Check authentication
echo "<h2>1. Authentication Check</h2>";
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo "<div style='color: red;'>❌ NOT LOGGED IN</div>";
    echo "<p><a href='login.php'>Please login first</a></p>";
    exit();
} else {
    echo "<div style='color: green;'>✅ LOGGED IN</div>";
    echo "<p>Admin: " . ($_SESSION['admin_name'] ?? 'Unknown') . "</p>";
    echo "<p>Token: " . (isset($_SESSION['admin_token']) ? 'SET' : 'NOT SET') . "</p>";
}

// Get product ID from URL
$productId = $_GET['id'] ?? '69662ebfd3a2fb064d35eb5f';
echo "<h2>2. Product ID</h2>";
echo "<p>Product ID: <code>$productId</code></p>";

// Test API connection
echo "<h2>3. API Connection Test</h2>";
$apiClient = getApiClient();
if (isset($_SESSION['admin_token'])) {
    $apiClient->setToken($_SESSION['admin_token']);
}

$productResult = $apiClient->getProductById($productId);
echo "<h3>API Response:</h3>";
echo "<pre>";
print_r($productResult);
echo "</pre>";

if ($productResult['success'] && isset($productResult['data'])) {
    $product = $productResult['data'];
    echo "<div style='color: green; padding: 10px; border: 1px solid green;'>";
    echo "✅ Product loaded successfully: " . htmlspecialchars($product['name']);
    echo "</div>";
} else {
    echo "<div style='color: red; padding: 10px; border: 1px solid red;'>";
    echo "❌ Failed to load product: " . ($productResult['error'] ?? 'Unknown error');
    echo "</div>";
    $product = null;
}

// Check if we can render the form
echo "<h2>4. Form Rendering Test</h2>";

if ($product) {
    echo "<div style='border: 2px solid blue; padding: 20px; margin: 20px 0;'>";
    echo "<h3>Complete Form Preview</h3>";
    
    // Start form
    echo "<form method='POST' enctype='multipart/form-data'>";
    echo "<input type='hidden' name='action' value='update'>";
    
    // Basic fields
    echo "<div style='background: #f0f0f0; padding: 15px; margin: 10px 0;'>";
    echo "<h4>Basic Information</h4>";
    echo "<p><strong>Product Name:</strong> <input type='text' name='name' value='" . htmlspecialchars($product['name']) . "' style='width: 300px;'></p>";
    echo "<p><strong>Price:</strong> <input type='number' name='price' value='" . $product['price'] . "' style='width: 150px;'></p>";
    echo "<p><strong>Brand:</strong> <input type='text' name='brand' value='" . htmlspecialchars($product['brand'] ?? '') . "' style='width: 200px;'></p>";
    echo "</div>";
    
    // Additional fields
    echo "<div style='background: #e0f0e0; padding: 15px; margin: 10px 0;'>";
    echo "<h4>Inventory & Categories</h4>";
    echo "<p><strong>Stock:</strong> <input type='number' name='stock' value='" . ($product['stock'] ?? 0) . "' style='width: 100px;'></p>";
    echo "<p><strong>Category:</strong> " . htmlspecialchars($product['category']['name'] ?? 'No category') . "</p>";
    echo "<p><strong>Subcategory:</strong> " . htmlspecialchars($product['subcategory']['name'] ?? 'No subcategory') . "</p>";
    echo "</div>";
    
    // Images
    echo "<div style='background: #f0e0f0; padding: 15px; margin: 10px 0;'>";
    echo "<h4>Images</h4>";
    if (!empty($product['images'])) {
        echo "<p><strong>Current Images:</strong> " . count($product['images']) . " image(s)</p>";
        foreach ($product['images'] as $i => $img) {
            $imgUrl = is_array($img) ? ($img['url'] ?? '') : $img;
            echo "<p>Image " . ($i + 1) . ": <code>" . htmlspecialchars($imgUrl) . "</code></p>";
        }
    } else {
        echo "<p>No images</p>";
    }
    echo "<p><strong>Add Images:</strong> <input type='file' name='image_files[]' multiple></p>";
    echo "</div>";
    
    // Description
    echo "<div style='background: #e0e0f0; padding: 15px; margin: 10px 0;'>";
    echo "<h4>Description</h4>";
    echo "<textarea name='description' rows='4' style='width: 100%;'>" . htmlspecialchars($product['description'] ?? '') . "</textarea>";
    echo "</div>";
    
    // Settings
    echo "<div style='background: #f0f0e0; padding: 15px; margin: 10px 0;'>";
    echo "<h4>Settings</h4>";
    echo "<p><label><input type='checkbox' name='featured' " . (!empty($product['featured']) ? 'checked' : '') . "> Featured Product</label></p>";
    echo "<p><label><input type='checkbox' name='isActive' " . (!empty($product['isActive']) ? 'checked' : '') . "> Active</label></p>";
    echo "</div>";
    
    // Buttons
    echo "<div style='background: #f0f0f0; padding: 15px; margin: 10px 0;'>";
    echo "<button type='submit' style='padding: 10px 20px; background: #007bff; color: white; border: none;'>Update Product</button>";
    echo " <a href='index.php?page=products' style='padding: 10px 20px; background: #6c757d; color: white; text-decoration: none;'>Cancel</a>";
    echo "</div>";
    
    echo "</form>";
    echo "</div>";
} else {
    echo "<div style='color: red;'>Cannot render form - product data not available</div>";
}

// Check for PHP errors
echo "<h2>5. Error Check</h2>";
echo "<p>If you see this message, PHP is executing properly up to this point.</p>";

// Test the actual products.php include
echo "<h2>6. Test Actual Products Page</h2>";
echo "<p>Now let's try to include the actual products.php file and see where it fails:</p>";

echo "<div style='border: 2px solid red; padding: 10px;'>";
echo "<h3>Including products.php...</h3>";

// Capture any output or errors
ob_start();
$error_occurred = false;

try {
    // Set the required variables that products.php expects
    $_GET['action'] = 'edit';
    $_GET['id'] = $productId;
    
    // Include the products page
    include 'pages/products.php';
    
} catch (Exception $e) {
    $error_occurred = true;
    echo "<div style='color: red;'>Exception occurred: " . $e->getMessage() . "</div>";
} catch (Error $e) {
    $error_occurred = true;
    echo "<div style='color: red;'>Fatal error occurred: " . $e->getMessage() . "</div>";
}

$output = ob_get_clean();

if ($error_occurred) {
    echo "<div style='color: red;'>An error occurred while including products.php</div>";
} else {
    echo "<div style='color: green;'>products.php included successfully</div>";
}

echo "<h4>Output from products.php:</h4>";
echo "<div style='border: 1px solid #ccc; padding: 10px; max-height: 400px; overflow: auto;'>";
echo "<pre>" . htmlspecialchars($output) . "</pre>";
echo "</div>";

echo "</div>";

echo "<h2>7. Quick Links</h2>";
echo "<ul>";
echo "<li><a href='index.php?page=products'>Back to Products List</a></li>";
echo "<li><a href='index.php?page=products&action=edit&id=$productId'>Try Edit Again</a></li>";
echo "<li><a href='test-edit-form.php'>Test Simple Edit Form</a></li>";
echo "</ul>";
?>