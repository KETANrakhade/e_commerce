<?php
// Enable error reporting to see what's wrong
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Start output buffering to prevent header issues
ob_start();

echo "<!-- DEBUG: Starting products page with error reporting enabled -->\n";

// Include the admin config
require_once 'config/admin_config.php';

// Check authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo "<h1>Not Logged In</h1>";
    echo "<p><a href='login.php'>Please login first</a></p>";
    exit();
}

echo "<!-- DEBUG: Authentication passed -->\n";

// Set up the same variables that the original products.php expects
$action = $_GET['action'] ?? 'list';
$productId = $_GET['id'] ?? '';

echo "<!-- DEBUG: Action = $action, Product ID = $productId -->\n";

// Include API client
require_once __DIR__ . '/config/api_client.php';

echo "<!-- DEBUG: API client included -->\n";

// Get API client and set token
$apiClient = getApiClient();
if (isset($_SESSION['admin_token'])) {
    $apiClient->setToken($_SESSION['admin_token']);
    echo "<!-- DEBUG: Token set -->\n";
} else {
    echo "<!-- DEBUG: No token available -->\n";
}

// If this is an edit action, try to get the product
$product = null;
if ($action === 'edit' && $productId) {
    echo "<!-- DEBUG: Attempting to get product $productId -->\n";
    
    $productResult = $apiClient->getProductById($productId);
    
    echo "<!-- DEBUG: Product API result: " . json_encode($productResult) . " -->\n";
    
    if ($productResult['success']) {
        $product = $productResult['data'] ?? null;
        if ($product) {
            echo "<!-- DEBUG: Product loaded successfully: " . htmlspecialchars($product['name']) . " -->\n";
        } else {
            echo "<!-- DEBUG: No product data in successful response -->\n";
        }
    } else {
        echo "<!-- DEBUG: Product API call failed: " . ($productResult['error'] ?? 'Unknown error') . " -->\n";
    }
}

echo "<!-- DEBUG: About to start HTML output -->\n";
?>

<!DOCTYPE html>
<html>
<head>
    <title>Debug Products Page</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container-fluid">
        <h1>Debug Products Page</h1>
        
        <div class="alert alert-info">
            <strong>Debug Info:</strong><br>
            Action: <?php echo htmlspecialchars($action); ?><br>
            Product ID: <?php echo htmlspecialchars($productId); ?><br>
            Product Loaded: <?php echo $product ? 'YES' : 'NO'; ?><br>
            <?php if ($product): ?>
                Product Name: <?php echo htmlspecialchars($product['name']); ?><br>
            <?php endif; ?>
        </div>
        
        <?php if ($action === 'edit'): ?>
            <?php if (!$product): ?>
                <div class="alert alert-danger">
                    <h4>Product Not Found</h4>
                    <p>Could not load product with ID: <?php echo htmlspecialchars($productId); ?></p>
                    <p><a href="index.php?page=products">Back to Products</a></p>
                </div>
            <?php else: ?>
                <div class="alert alert-success">
                    <h4>Product Found</h4>
                    <p>Successfully loaded: <?php echo htmlspecialchars($product['name']); ?></p>
                </div>
                
                <!-- Now let's try to include the original products.php and see where it fails -->
                <div class="card">
                    <div class="card-header">
                        <h3>Attempting to Include Original products.php</h3>
                    </div>
                    <div class="card-body">
                        <?php
                        echo "<!-- DEBUG: About to include pages/products.php -->\n";
                        
                        // Capture any errors
                        $error_handler = function($errno, $errstr, $errfile, $errline) {
                            echo "<div class='alert alert-danger'>";
                            echo "<strong>PHP Error:</strong> $errstr<br>";
                            echo "<strong>File:</strong> $errfile<br>";
                            echo "<strong>Line:</strong> $errline<br>";
                            echo "</div>";
                            return true;
                        };
                        
                        set_error_handler($error_handler);
                        
                        try {
                            // Include the original products page
                            include 'pages/products.php';
                            echo "<!-- DEBUG: products.php included successfully -->\n";
                        } catch (Exception $e) {
                            echo "<div class='alert alert-danger'>";
                            echo "<strong>Exception:</strong> " . $e->getMessage() . "<br>";
                            echo "<strong>File:</strong> " . $e->getFile() . "<br>";
                            echo "<strong>Line:</strong> " . $e->getLine() . "<br>";
                            echo "</div>";
                        } catch (Error $e) {
                            echo "<div class='alert alert-danger'>";
                            echo "<strong>Fatal Error:</strong> " . $e->getMessage() . "<br>";
                            echo "<strong>File:</strong> " . $e->getFile() . "<br>";
                            echo "<strong>Line:</strong> " . $e->getLine() . "<br>";
                            echo "</div>";
                        }
                        
                        restore_error_handler();
                        ?>
                    </div>
                </div>
            <?php endif; ?>
        <?php else: ?>
            <div class="alert alert-info">
                <p>This debug page is for edit actions only.</p>
                <p><a href="?action=edit&id=69662ebfd3a2fb064d35eb5f">Test Edit Action</a></p>
            </div>
        <?php endif; ?>
        
        <div class="mt-4">
            <h3>Quick Links</h3>
            <ul>
                <li><a href="index.php?page=products">Products List</a></li>
                <li><a href="simple-edit-test.php?id=<?php echo htmlspecialchars($productId); ?>">Simple Edit Test</a></li>
                <li><a href="debug-edit-form.php?id=<?php echo htmlspecialchars($productId); ?>">Debug Edit Form</a></li>
            </ul>
        </div>
    </div>
</body>
</html>