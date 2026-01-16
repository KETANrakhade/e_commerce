<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get product ID from URL
$productId = $_GET['id'] ?? '';
$error = '';
$product = null;

if (empty($productId)) {
    $error = 'No product ID provided';
} else {
    // Try to load product
    try {
        require_once __DIR__ . '/../config/api_client.php';
        $apiClient = getApiClient();
        $productResult = $apiClient->getProductById($productId);
        
        if ($productResult['success'] && isset($productResult['data'])) {
            $product = $productResult['data'];
        } else {
            $error = 'Failed to load product: ' . ($productResult['error'] ?? 'Unknown error');
        }
    } catch (Exception $e) {
        $error = 'Exception: ' . $e->getMessage();
    }
}

// Handle form submission
if ($_POST && isset($_POST['action']) && $_POST['action'] === 'update' && $product) {
    try {
        // Debug: Log what we're sending
        error_log("Form POST data: " . print_r($_POST, true));
        
        $productData = [
            'name' => trim($_POST['name'] ?? ''),
            'price' => floatval($_POST['price'] ?? 0),
            'stock' => intval($_POST['countInStock'] ?? 0), // Changed from countInStock to stock
            'description' => trim($_POST['description'] ?? ''),
            'isActive' => isset($_POST['isActive'])
        ];
        
        // Debug: Log the data we're sending to API
        error_log("Product data to send: " . print_r($productData, true));
        
        $result = $apiClient->updateProduct($productId, $productData);
        
        // Debug: Log the API response
        error_log("API response: " . print_r($result, true));
        
        if ($result['success']) {
            $success = 'Product updated successfully! Stock set to: ' . $productData['stock'];
            
            // Wait a moment and reload product data to verify
            sleep(1);
            $productResult = $apiClient->getProductById($productId);
            if ($productResult['success']) {
                $product = $productResult['data'];
                error_log("Product after update: " . print_r($product, true));
                
                // Check if stock was actually updated (check both stock and countInStock fields)
                $actualStock = $product['stock'] ?? $product['countInStock'] ?? 0;
                if ($actualStock != $productData['stock']) {
                    $success .= ' WARNING: Database shows stock as ' . $actualStock . ' instead of ' . $productData['stock'];
                }
            }
        } else {
            $error = 'Update failed: ' . ($result['error'] ?? 'Unknown error');
            if (isset($result['http_code'])) {
                $error .= ' (HTTP ' . $result['http_code'] . ')';
            }
        }
    } catch (Exception $e) {
        $error = 'Update exception: ' . $e->getMessage();
        error_log("Update exception: " . $e->getMessage());
    }
}
?>

<div class="main-content">
    <div class="page-content">
        <div class="container-fluid">
            <!-- Page Title -->
            <div class="row">
                <div class="col-12">
                    <div class="page-title-box d-sm-flex align-items-center justify-content-between">
                        <h4 class="mb-sm-0 font-size-18">Edit Product</h4>
                        <div class="page-title-right">
                            <ol class="breadcrumb m-0">
                                <li class="breadcrumb-item"><a href="index.php">Admin</a></li>
                                <li class="breadcrumb-item"><a href="index.php?page=products">Products</a></li>
                                <li class="breadcrumb-item active">Edit Product</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Messages -->
            <?php if (isset($success)): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>Success!</strong> <?php echo htmlspecialchars($success); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <!-- Content -->
            <?php if ($product): ?>
                <!-- Edit Form -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h4 class="card-title">Edit Product: <?php echo htmlspecialchars($product['name']); ?></h4>
                                <p class="card-title-desc">Update product information</p>

                                <form method="POST" action="">
                                    <input type="hidden" name="action" value="update">
                                    
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="name" class="form-label">Product Name</label>
                                                <input type="text" class="form-control" id="name" name="name" 
                                                       value="<?php echo htmlspecialchars($product['name'] ?? ''); ?>" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="price" class="form-label">Price (₹)</label>
                                                <input type="number" class="form-control" id="price" name="price" 
                                                       value="<?php echo $product['price'] ?? 0; ?>" step="0.01" min="0" required>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="countInStock" class="form-label">Stock Quantity</label>
                                                <div class="input-group">
                                                    <button class="btn btn-outline-secondary" type="button" onclick="changeStock(-1)">
                                                        <i class="mdi mdi-minus"></i>
                                                    </button>
                                                    <input type="number" class="form-control text-center" id="countInStock" name="countInStock" 
                                                           value="<?php echo $product['stock'] ?? $product['countInStock'] ?? 0; ?>" min="0" required>
                                                    <button class="btn btn-outline-secondary" type="button" onclick="changeStock(1)">
                                                        <i class="mdi mdi-plus"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">Current: <?php echo $product['stock'] ?? $product['countInStock'] ?? 0; ?></small>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="isActive" class="form-label">Status</label>
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="isActive" name="isActive" 
                                                           <?php echo ($product['isActive'] ?? true) ? 'checked' : ''; ?>>
                                                    <label class="form-check-label" for="isActive">Active</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="description" class="form-label">Description</label>
                                        <textarea class="form-control" id="description" name="description" rows="3"><?php echo htmlspecialchars($product['description'] ?? ''); ?></textarea>
                                    </div>

                                    <div class="d-flex gap-2">
                                        <button type="submit" class="btn btn-primary">
                                            <i class="mdi mdi-content-save me-1"></i> Update Product
                                        </button>
                                        <a href="index.php?page=products" class="btn btn-secondary">
                                            <i class="mdi mdi-arrow-left me-1"></i> Back to Products
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                <!-- No Product -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body text-center">
                                <h4>Product Not Found</h4>
                                <p>Unable to load product with ID: <?php echo htmlspecialchars($productId); ?></p>
                                <a href="index.php?page=products" class="btn btn-primary">Back to Products</a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Debug Info -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h5>Debug Information</h5>
                            <div class="row">
                                <div class="col-md-6">
                                    <ul>
                                        <li><strong>Product ID:</strong> <?php echo htmlspecialchars($productId); ?></li>
                                        <li><strong>Has Product:</strong> <?php echo $product ? 'Yes' : 'No'; ?></li>
                                        <li><strong>Session Token:</strong> <?php echo isset($_SESSION['admin_token']) ? 'Present' : 'Missing'; ?></li>
                                        <li><strong>Error:</strong> <?php echo $error ?: 'None'; ?></li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <?php if ($product): ?>
                                        <h6>Current Product Data:</h6>
                                        <ul>
                                            <li><strong>Name:</strong> <?php echo htmlspecialchars($product['name']); ?></li>
                                            <li><strong>Price:</strong> ₹<?php echo number_format($product['price'], 2); ?></li>
                                            <li><strong>Stock:</strong> <?php echo $product['stock'] ?? $product['countInStock'] ?? 0; ?></li>
                                            <li><strong>Active:</strong> <?php echo ($product['isActive'] ?? true) ? 'Yes' : 'No'; ?></li>
                                        </ul>
                                    <?php endif; ?>
                                    
                                    <?php if ($_POST): ?>
                                        <h6>Last Form Submission:</h6>
                                        <ul>
                                            <li><strong>Name:</strong> <?php echo htmlspecialchars($_POST['name'] ?? 'Not set'); ?></li>
                                            <li><strong>Price:</strong> <?php echo htmlspecialchars($_POST['price'] ?? 'Not set'); ?></li>
                                            <li><strong>Stock:</strong> <?php echo htmlspecialchars($_POST['countInStock'] ?? 'Not set'); ?></li>
                                            <li><strong>Active:</strong> <?php echo isset($_POST['isActive']) ? 'Yes' : 'No'; ?></li>
                                        </ul>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function changeStock(delta) {
    const input = document.getElementById('countInStock');
    const currentValue = parseInt(input.value) || 0;
    const newValue = Math.max(0, currentValue + delta);
    input.value = newValue;
}
</script>