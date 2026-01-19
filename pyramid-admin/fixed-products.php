<?php
// Fixed Products Page - Simplified version that works
require_once 'config/admin_config.php';

// Check authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit();
}

// Handle product actions
$action = $_GET['action'] ?? 'list';
$productId = $_GET['id'] ?? '';

// Include API client
require_once __DIR__ . '/config/api_client.php';
$apiClient = getApiClient();
if (isset($_SESSION['admin_token'])) {
    $apiClient->setToken($_SESSION['admin_token']);
}

// Handle form submissions
if ($_POST && isset($_POST['action'])) {
    $postAction = $_POST['action'];
    
    if ($postAction === 'update' && $productId) {
        $productData = [
            'name' => trim($_POST['name'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
            'price' => max(0, floatval($_POST['price'] ?? 0)),
            'category' => trim($_POST['category'] ?? ''),
            'subcategory' => !empty($_POST['subcategory']) ? trim($_POST['subcategory']) : null,
            'stock' => max(0, intval($_POST['stock'] ?? 0)),
            'brand' => trim($_POST['brand'] ?? ''),
            'featured' => isset($_POST['featured']),
            'isActive' => isset($_POST['isActive'])
        ];
        
        // Handle existing images
        $existingImages = $_POST['existing_images'] ?? [];
        $existingImages = array_filter($existingImages);
        
        if (!empty($existingImages)) {
            $productData['images'] = $existingImages;
        }
        
        $result = $apiClient->updateProduct($productId, $productData);
        
        if ($result['success']) {
            $_SESSION['product_success'] = 'Product updated successfully!';
            header('Location: index.php?page=products');
            exit();
        } else {
            $error = $result['error'] ?? 'Failed to update product';
        }
    }
}

// Get single product for edit
$product = null;
if ($action === 'edit' && $productId) {
    $productResult = $apiClient->getProductById($productId);
    if ($productResult['success']) {
        $product = $productResult['data'] ?? null;
    }
}

// Get products for list
$products = [];
if ($action === 'list') {
    $productsResult = $apiClient->getAdminProducts(['limit' => 50]);
    if ($productsResult['success']) {
        $products = $productsResult['data']['products'] ?? [];
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Products - Admin Panel</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; }
        .main-content { padding: 20px; }
        .card { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-section { margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="main-content">
        <div class="container-fluid">
            
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1>Products Management</h1>
                <div>
                    <a href="index.php" class="btn btn-secondary">
                        <i class="fas fa-home"></i> Dashboard
                    </a>
                    <?php if ($action !== 'list'): ?>
                        <a href="?page=products" class="btn btn-outline-secondary">
                            <i class="fas fa-list"></i> All Products
                        </a>
                    <?php endif; ?>
                </div>
            </div>
            
            <!-- Success Message -->
            <?php if (isset($_SESSION['product_success'])): ?>
                <div class="alert alert-success alert-dismissible fade show">
                    <?php echo htmlspecialchars($_SESSION['product_success']); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <?php unset($_SESSION['product_success']); ?>
            <?php endif; ?>
            
            <!-- Error Message -->
            <?php if (isset($error)): ?>
                <div class="alert alert-danger alert-dismissible fade show">
                    <?php echo htmlspecialchars($error); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
            
            <?php if ($action === 'list'): ?>
                <!-- Products List -->
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h3>All Products</h3>
                        <a href="?page=products&action=create" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Add Product
                        </a>
                    </div>
                    <div class="card-body">
                        <?php if (empty($products)): ?>
                            <div class="text-center py-5">
                                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                                <h4>No Products Found</h4>
                                <p class="text-muted">Start by adding your first product.</p>
                                <a href="?page=products&action=create" class="btn btn-primary">
                                    <i class="fas fa-plus"></i> Add Product
                                </a>
                            </div>
                        <?php else: ?>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($products as $prod): ?>
                                            <tr>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <?php if (!empty($prod['images'][0])): ?>
                                                            <img src="/<?php echo htmlspecialchars($prod['images'][0]['url'] ?? $prod['images'][0]); ?>" 
                                                                 class="me-3" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                                                        <?php endif; ?>
                                                        <div>
                                                            <strong><?php echo htmlspecialchars($prod['name']); ?></strong><br>
                                                            <small class="text-muted"><?php echo htmlspecialchars($prod['brand'] ?? 'No Brand'); ?></small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><?php echo htmlspecialchars($prod['category']['name'] ?? 'No Category'); ?></td>
                                                <td>₹<?php echo number_format($prod['price']); ?></td>
                                                <td>
                                                    <span class="badge bg-<?php echo $prod['stock'] > 0 ? 'success' : 'danger'; ?>">
                                                        <?php echo $prod['stock']; ?>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span class="badge bg-<?php echo $prod['isActive'] ? 'success' : 'secondary'; ?>">
                                                        <?php echo $prod['isActive'] ? 'Active' : 'Inactive'; ?>
                                                    </span>
                                                </td>
                                                <td>
                                                    <a href="?page=products&action=edit&id=<?php echo $prod['_id']; ?>" 
                                                       class="btn btn-sm btn-outline-primary">
                                                        <i class="fas fa-edit"></i> Edit
                                                    </a>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
                
            <?php elseif ($action === 'edit'): ?>
                <!-- Edit Product Form -->
                <?php if (!$product): ?>
                    <div class="alert alert-danger">
                        <h4>Product Not Found</h4>
                        <p>Could not load product with ID: <?php echo htmlspecialchars($productId); ?></p>
                        <a href="?page=products" class="btn btn-secondary">Back to Products</a>
                    </div>
                <?php else: ?>
                    <div class="card">
                        <div class="card-header">
                            <h3>Edit Product: <?php echo htmlspecialchars($product['name']); ?></h3>
                        </div>
                        <div class="card-body">
                            <form method="POST" enctype="multipart/form-data">
                                <input type="hidden" name="action" value="update">
                                
                                <!-- Basic Information -->
                                <div class="form-section">
                                    <h5 class="text-primary mb-3">
                                        <i class="fas fa-info-circle"></i> Basic Information
                                    </h5>
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label">Product Name *</label>
                                                <input type="text" name="name" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['name']); ?>" required>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label">Price (₹) *</label>
                                                <input type="number" name="price" class="form-control" 
                                                       value="<?php echo $product['price']; ?>" required>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label">Brand</label>
                                                <input type="text" name="brand" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['brand'] ?? ''); ?>">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Inventory & Categories -->
                                <div class="form-section">
                                    <h5 class="text-primary mb-3">
                                        <i class="fas fa-boxes"></i> Inventory & Categories
                                    </h5>
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label">Stock Quantity *</label>
                                                <input type="number" name="stock" class="form-control" 
                                                       value="<?php echo $product['stock']; ?>" required>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label">Category *</label>
                                                <input type="text" name="category" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['category']['name'] ?? ''); ?>" 
                                                       placeholder="e.g., Men, Women" required>
                                                <small class="text-muted">Current: <?php echo htmlspecialchars($product['category']['name'] ?? 'None'); ?></small>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label">Sub-Category</label>
                                                <input type="text" name="subcategory" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['subcategory']['name'] ?? ''); ?>" 
                                                       placeholder="e.g., Shirts, T-Shirts">
                                                <small class="text-muted">Current: <?php echo htmlspecialchars($product['subcategory']['name'] ?? 'None'); ?></small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Images -->
                                <div class="form-section">
                                    <h5 class="text-primary mb-3">
                                        <i class="fas fa-images"></i> Product Images
                                    </h5>
                                    
                                    <?php if (!empty($product['images'])): ?>
                                        <div class="mb-3">
                                            <label class="form-label">Current Images</label>
                                            <div class="row">
                                                <?php foreach ($product['images'] as $index => $image): ?>
                                                    <div class="col-md-2 mb-2">
                                                        <div class="card">
                                                            <img src="/<?php echo htmlspecialchars($image['url'] ?? $image); ?>" 
                                                                 class="card-img-top" style="height: 120px; object-fit: cover;">
                                                            <div class="card-body p-2">
                                                                <small>Image <?php echo $index + 1; ?></small>
                                                                <input type="hidden" name="existing_images[]" 
                                                                       value="<?php echo htmlspecialchars($image['url'] ?? $image); ?>">
                                                            </div>
                                                        </div>
                                                    </div>
                                                <?php endforeach; ?>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Add New Images</label>
                                        <input type="file" name="image_files[]" class="form-control" multiple accept="image/*">
                                        <small class="text-muted">Select multiple images to add (max 2MB each)</small>
                                    </div>
                                </div>
                                
                                <!-- Description -->
                                <div class="form-section">
                                    <h5 class="text-primary mb-3">
                                        <i class="fas fa-align-left"></i> Product Description
                                    </h5>
                                    <div class="mb-3">
                                        <label class="form-label">Description *</label>
                                        <textarea name="description" class="form-control" rows="6" required><?php echo htmlspecialchars($product['description']); ?></textarea>
                                        <small class="text-muted">Provide detailed product information</small>
                                    </div>
                                </div>
                                
                                <!-- Settings -->
                                <div class="form-section">
                                    <h5 class="text-primary mb-3">
                                        <i class="fas fa-cog"></i> Product Settings
                                    </h5>
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
                                    <button type="submit" class="btn btn-primary btn-lg">
                                        <i class="fas fa-save"></i> Update Product
                                    </button>
                                    <a href="?page=products" class="btn btn-secondary btn-lg">
                                        <i class="fas fa-times"></i> Cancel
                                    </a>
                                    <button type="reset" class="btn btn-outline-warning btn-lg">
                                        <i class="fas fa-undo"></i> Reset
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>