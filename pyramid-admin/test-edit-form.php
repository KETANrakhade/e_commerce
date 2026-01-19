<?php
require_once 'config/admin_config.php';

// Check authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo "<h1>Please Login First</h1>";
    echo "<p><a href='login.php'>Click here to login</a></p>";
    exit();
}

// Test product ID
$testProductId = '6965fca99eedf986e2c18a53';

// Get product data
$apiClient = getApiClient();
if (isset($_SESSION['admin_token'])) {
    $apiClient->setToken($_SESSION['admin_token']);
}

$productResult = $apiClient->getProductById($testProductId);
$product = null;

if ($productResult['success'] && isset($productResult['data'])) {
    $product = $productResult['data'];
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Test Edit Form</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-4">
        <h1>Test Product Edit Form</h1>
        
        <?php if (!$product): ?>
            <div class="alert alert-danger">
                <h4>Product Not Found</h4>
                <p>Could not load product data. API Response:</p>
                <pre><?php print_r($productResult); ?></pre>
                <p><a href="index.php?page=products">Back to Products</a></p>
            </div>
        <?php else: ?>
            <div class="alert alert-success">
                <h4>Product Loaded Successfully</h4>
                <p><strong>Product:</strong> <?php echo htmlspecialchars($product['name']); ?></p>
                <p><strong>Price:</strong> ₹<?php echo number_format($product['price']); ?></p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Complete Edit Form</h3>
                </div>
                <div class="card-body">
                    <form method="POST" action="index.php?page=products&action=edit&id=<?php echo $testProductId; ?>" enctype="multipart/form-data">
                        <input type="hidden" name="action" value="update">
                        
                        <!-- Basic Information -->
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h5>Basic Information</h5>
                                
                                <div class="mb-3">
                                    <label class="form-label">Product Name *</label>
                                    <input type="text" name="name" class="form-control" 
                                           value="<?php echo htmlspecialchars($product['name'] ?? ''); ?>" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Price (₹) *</label>
                                    <input type="number" name="price" class="form-control" 
                                           value="<?php echo $product['price'] ?? ''; ?>" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Brand</label>
                                    <input type="text" name="brand" class="form-control" 
                                           value="<?php echo htmlspecialchars($product['brand'] ?? ''); ?>">
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <h5>Inventory & Categories</h5>
                                
                                <div class="mb-3">
                                    <label class="form-label">Stock Quantity *</label>
                                    <input type="number" name="stock" class="form-control" 
                                           value="<?php echo $product['stock'] ?? '0'; ?>" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Category *</label>
                                    <select name="category" class="form-control" required>
                                        <option value="">Select Category</option>
                                        <option value="<?php echo $product['category']['_id'] ?? ''; ?>" selected>
                                            <?php echo htmlspecialchars($product['category']['name'] ?? 'Current Category'); ?>
                                        </option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Sub-Category</label>
                                    <select name="subcategory" class="form-control">
                                        <option value="">Select Sub-Category</option>
                                        <option value="<?php echo $product['subcategory']['_id'] ?? ''; ?>" selected>
                                            <?php echo htmlspecialchars($product['subcategory']['name'] ?? 'Current Subcategory'); ?>
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Images Section -->
                        <div class="mb-4">
                            <h5>Product Images</h5>
                            <div class="row">
                                <?php if (!empty($product['images'])): ?>
                                    <?php foreach ($product['images'] as $index => $image): ?>
                                        <div class="col-md-3 mb-3">
                                            <div class="card">
                                                <img src="/<?php echo htmlspecialchars($image['url'] ?? $image); ?>" 
                                                     class="card-img-top" style="height: 150px; object-fit: cover;">
                                                <div class="card-body p-2">
                                                    <small>Image <?php echo $index + 1; ?></small>
                                                    <input type="hidden" name="existing_images[]" 
                                                           value="<?php echo htmlspecialchars($image['url'] ?? $image); ?>">
                                                </div>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Add New Images</label>
                                <input type="file" name="image_files[]" class="form-control" multiple accept="image/*">
                                <small class="text-muted">Select multiple images to add to the product</small>
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div class="mb-4">
                            <h5>Product Description</h5>
                            <div class="mb-3">
                                <label class="form-label">Description *</label>
                                <textarea name="description" class="form-control" rows="6" required><?php echo htmlspecialchars($product['description'] ?? ''); ?></textarea>
                            </div>
                        </div>
                        
                        <!-- Settings -->
                        <div class="mb-4">
                            <h5>Product Settings</h5>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input type="checkbox" name="featured" class="form-check-input" 
                                               <?php echo !empty($product['featured']) ? 'checked' : ''; ?>>
                                        <label class="form-check-label">Featured Product</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input type="checkbox" name="isActive" class="form-check-input" 
                                               <?php echo !empty($product['isActive']) ? 'checked' : ''; ?>>
                                        <label class="form-check-label">Active</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="mdi mdi-content-save"></i> Update Product
                            </button>
                            <a href="index.php?page=products" class="btn btn-secondary">
                                <i class="mdi mdi-arrow-left"></i> Cancel
                            </a>
                            <button type="reset" class="btn btn-outline-warning">
                                <i class="mdi mdi-refresh"></i> Reset Form
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        <?php endif; ?>
        
        <div class="mt-4">
            <h4>Debug Information</h4>
            <pre><?php print_r($product); ?></pre>
        </div>
    </div>
</body>
</html>