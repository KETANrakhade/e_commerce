<?php
// Simple edit product page for debugging
$productId = $_GET['id'] ?? '';
$updateMessage = '';
$updateError = '';

// Handle form submission
if ($_POST && isset($_POST['action']) && $_POST['action'] === 'update') {
    try {
        require_once __DIR__ . '/../config/api_client.php';
        $apiClient = getApiClient();
        
        // Debug: Log the POST data
        error_log("POST data received: " . print_r($_POST, true));
        
        $productData = [
            'name' => trim($_POST['name'] ?? ''),
            'price' => floatval($_POST['price'] ?? 0),
            'countInStock' => intval($_POST['countInStock'] ?? 0),
            'description' => trim($_POST['description'] ?? ''),
            'isActive' => isset($_POST['isActive']) ? ($_POST['isActive'] === '1') : true
        ];
        
        // Debug: Log the product data being sent
        error_log("Product data to send: " . print_r($productData, true));
        
        // Test the API call directly
        $apiUrl = 'http://localhost:5001/api/admin/products/' . $productId;
        error_log("API URL: " . $apiUrl);
        
        $result = $apiClient->updateProduct($productId, $productData);
        
        // Debug: Log the API response
        error_log("API update response: " . print_r($result, true));
        
        if ($result['success']) {
            $updateMessage = 'Product updated successfully! Stock: ' . $productData['countInStock'];
        } else {
            $updateError = $result['error'] ?? 'Failed to update product';
            
            // Check for authentication issues
            if (isset($result['http_code']) && $result['http_code'] === 401) {
                $updateError .= ' (Authentication required - please login again)';
            } elseif (isset($result['http_code']) && $result['http_code'] === 0) {
                $updateError .= ' (Backend server connection failed)';
            }
            
            // Add HTTP code to error message for debugging
            if (isset($result['http_code'])) {
                $updateError .= ' [HTTP ' . $result['http_code'] . ']';
            }
        }
    } catch (Exception $e) {
        $updateError = 'Error: ' . $e->getMessage();
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
                        <h4 class="mb-sm-0 font-size-18">Edit Product (Debug)</h4>
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

            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title">Edit Product Debug</h4>
                            
                            <?php if ($updateMessage): ?>
                                <div class="alert alert-success alert-dismissible fade show">
                                    <strong>✅ Success!</strong> <?php echo htmlspecialchars($updateMessage); ?>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                                </div>
                            <?php endif; ?>
                            
                            <?php if ($updateError): ?>
                                <div class="alert alert-danger alert-dismissible fade show">
                                    <strong>❌ Error!</strong> <?php echo htmlspecialchars($updateError); ?>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                                </div>
                            <?php endif; ?>
                            
                            <?php if (empty($productId)): ?>
                                <div class="alert alert-warning">
                                    <strong>No Product ID provided!</strong><br>
                                    URL should be: <code>index.php?page=edit-product&id=PRODUCT_ID</code>
                                </div>
                            <?php else: ?>
                                <div class="alert alert-info">
                                    <strong>Product ID:</strong> <?php echo htmlspecialchars($productId); ?>
                                </div>
                                
                                <?php
                                // Try to load product
                                try {
                                    require_once __DIR__ . '/../config/api_client.php';
                                    $apiClient = getApiClient();
                                    
                                    // Check if we have a valid token
                                    if (!isset($_SESSION['admin_token'])) {
                                        ?>
                                        <div class="alert alert-warning">
                                            <strong>⚠️ Authentication Issue</strong><br>
                                            No backend API token found. You may have logged in using fallback authentication.<br>
                                            <a href="login.php" class="btn btn-sm btn-primary mt-2">Re-login to get API access</a>
                                        </div>
                                        <?php
                                    }
                                    
                                    $result = $apiClient->getProductById($productId);
                                    
                                    if ($result['success'] && isset($result['data'])) {
                                        $product = $result['data'];
                                        ?>
                                        <div class="alert alert-success">
                                            <strong>✅ Product loaded successfully!</strong><br>
                                            <strong>Name:</strong> <?php echo htmlspecialchars($product['name']); ?><br>
                                            <strong>Price:</strong> ₹<?php echo number_format($product['price'], 2); ?><br>
                                            <strong>Stock:</strong> <?php echo $product['countInStock']; ?>
                                        </div>
                                        
                                        <!-- Simple Edit Form -->
                                        <form method="POST" action="" class="needs-validation" novalidate>
                                            <input type="hidden" name="action" value="update">
                                            
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="name" class="form-label">Product Name <span class="text-danger">*</span></label>
                                                        <input type="text" class="form-control" id="name" name="name" 
                                                               value="<?php echo htmlspecialchars($product['name'] ?? ''); ?>" required>
                                                        <div class="invalid-feedback">Please provide a product name.</div>
                                                    </div>
                                                </div>
                                                
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="price" class="form-label">Price (₹) <span class="text-danger">*</span></label>
                                                        <input type="number" class="form-control" id="price" name="price" 
                                                               value="<?php echo isset($product['price']) ? number_format($product['price'], 2, '.', '') : '0'; ?>" 
                                                               step="0.01" min="0" required>
                                                        <div class="invalid-feedback">Please provide a valid price.</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="countInStock" class="form-label">Stock Quantity <span class="text-danger">*</span></label>
                                                        <input type="number" class="form-control" id="countInStock" name="countInStock" 
                                                               value="<?php echo isset($product['countInStock']) ? intval($product['countInStock']) : 0; ?>" 
                                                               min="0" required>
                                                        <div class="invalid-feedback">Please provide a valid stock quantity.</div>
                                                        <div class="form-text">Current stock: <strong><?php echo isset($product['countInStock']) ? intval($product['countInStock']) : 0; ?></strong></div>
                                                    </div>
                                                </div>
                                                
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="status" class="form-label">Status</label>
                                                        <select class="form-select" id="status" name="isActive">
                                                            <option value="1" <?php echo (!isset($product['isActive']) || $product['isActive']) ? 'selected' : ''; ?>>Active</option>
                                                            <option value="0" <?php echo (isset($product['isActive']) && !$product['isActive']) ? 'selected' : ''; ?>>Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label for="description" class="form-label">Description</label>
                                                <textarea class="form-control" id="description" name="description" rows="3" 
                                                          placeholder="Enter product description..."><?php echo htmlspecialchars($product['description'] ?? ''); ?></textarea>
                                            </div>
                                            
                                            <div class="d-flex gap-2">
                                                <button type="submit" class="btn btn-primary waves-effect waves-light">
                                                    <i class="mdi mdi-content-save me-1"></i> Update Product
                                                </button>
                                                <a href="index.php?page=products" class="btn btn-secondary waves-effect waves-light">
                                                    <i class="mdi mdi-arrow-left me-1"></i> Back to Products
                                                </a>
                                            </div>
                                        </form>
                                        
                                        <?php
                                    } else {
                                        ?>
                                        <div class="alert alert-danger">
                                            <strong>❌ Failed to load product</strong><br>
                                            <strong>Error:</strong> <?php echo htmlspecialchars($result['error'] ?? 'Unknown error'); ?><br>
                                            <strong>API Response:</strong> <pre><?php print_r($result); ?></pre>
                                        </div>
                                        <?php
                                    }
                                } catch (Exception $e) {
                                    ?>
                                    <div class="alert alert-danger">
                                        <strong>❌ Exception occurred:</strong><br>
                                        <?php echo htmlspecialchars($e->getMessage()); ?>
                                    </div>
                                    <?php
                                }
                                ?>
                            <?php endif; ?>
                            
                            <hr>
                            <h5>Debug Information</h5>
                            
                            <?php if ($_POST): ?>
                                <div class="alert alert-info">
                                    <h6>Last Form Submission:</h6>
                                    <ul>
                                        <li><strong>Name:</strong> <?php echo htmlspecialchars($_POST['name'] ?? 'Not set'); ?></li>
                                        <li><strong>Price:</strong> <?php echo htmlspecialchars($_POST['price'] ?? 'Not set'); ?></li>
                                        <li><strong>Stock Quantity:</strong> <?php echo htmlspecialchars($_POST['countInStock'] ?? 'Not set'); ?></li>
                                        <li><strong>Status:</strong> <?php echo htmlspecialchars($_POST['isActive'] ?? 'Not set'); ?></li>
                                        <li><strong>Description:</strong> <?php echo htmlspecialchars(substr($_POST['description'] ?? 'Not set', 0, 50)); ?>...</li>
                                    </ul>
                                </div>
                            <?php endif; ?>
                            
                            <ul>
                                <li><strong>Current URL:</strong> <?php echo htmlspecialchars($_SERVER['REQUEST_URI']); ?></li>
                                <li><strong>Product ID:</strong> <?php echo htmlspecialchars($productId); ?></li>
                                <li><strong>Session Status:</strong> <?php echo isset($_SESSION['admin_logged_in']) ? 'Logged in' : 'Not logged in'; ?></li>
                                <li><strong>Admin Token:</strong> <?php echo isset($_SESSION['admin_token']) ? 'Present (' . substr($_SESSION['admin_token'], 0, 10) . '...)' : 'Missing'; ?></li>
                                <li><strong>Backend URL:</strong> <?php echo defined('NODEJS_BACKEND_URL') ? NODEJS_BACKEND_URL : 'http://localhost:5001/api'; ?></li>
                                <li><strong>Request Method:</strong> <?php echo $_SERVER['REQUEST_METHOD']; ?></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Form validation and enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Form validation and enhancement
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            // Debug: Show form data before submission
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            console.log('Form data being submitted:', data);
            
            // Show alert with stock quantity for debugging
            const stockValue = document.getElementById('countInStock').value;
            console.log('Stock quantity value:', stockValue);
            
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                alert('Please fill in all required fields correctly.');
            } else {
                // Show confirmation with the stock value
                if (!confirm(`Update product with stock quantity: ${stockValue}?`)) {
                    event.preventDefault();
                    return false;
                }
            }
            form.classList.add('was-validated');
        }, false);
    });
    
    // Stock quantity enhancement
    const stockInput = document.getElementById('countInStock');
    if (stockInput) {
        // Add increment/decrement buttons
        const stockContainer = stockInput.parentElement;
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        
        const decrementBtn = document.createElement('button');
        decrementBtn.className = 'btn btn-outline-secondary';
        decrementBtn.type = 'button';
        decrementBtn.innerHTML = '<i class="mdi mdi-minus"></i>';
        decrementBtn.onclick = function() {
            const currentValue = parseInt(stockInput.value) || 0;
            if (currentValue > 0) {
                stockInput.value = currentValue - 1;
                stockInput.dispatchEvent(new Event('input'));
            }
        };
        
        const incrementBtn = document.createElement('button');
        incrementBtn.className = 'btn btn-outline-secondary';
        incrementBtn.type = 'button';
        incrementBtn.innerHTML = '<i class="mdi mdi-plus"></i>';
        incrementBtn.onclick = function() {
            const currentValue = parseInt(stockInput.value) || 0;
            stockInput.value = currentValue + 1;
            stockInput.dispatchEvent(new Event('input'));
        };
        
        // Wrap input in input group
        stockInput.parentNode.insertBefore(inputGroup, stockInput);
        inputGroup.appendChild(decrementBtn);
        inputGroup.appendChild(stockInput);
        inputGroup.appendChild(incrementBtn);
        
        // Real-time validation
        stockInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (isNaN(value) || value < 0) {
                this.setCustomValidity('Stock quantity must be a positive number');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // Price validation
    const priceInput = document.getElementById('price');
    if (priceInput) {
        priceInput.addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (isNaN(value) || value < 0) {
                this.setCustomValidity('Price must be a positive number');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    console.log('Edit product form enhanced successfully!');
});
</script>