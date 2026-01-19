<?php
require_once 'config/admin_config.php';

// Simple test to see if we can render a complete form
$productId = $_GET['id'] ?? '69662ebfd3a2fb064d35eb5f';

// Check auth
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit();
}

// Get product
$apiClient = getApiClient();
if (isset($_SESSION['admin_token'])) {
    $apiClient->setToken($_SESSION['admin_token']);
}

$productResult = $apiClient->getProductById($productId);
$product = $productResult['success'] ? ($productResult['data'] ?? null) : null;
?>
<!DOCTYPE html>
<html>
<head>
    <title>Simple Edit Test</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
        }
        .form-section {
            border: 2px solid #007bff;
            margin: 15px 0;
            padding: 20px;
            border-radius: 8px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-height: 100px;
        }
        .section-title {
            background: #007bff;
            color: white;
            padding: 8px 15px;
            margin: -20px -20px 15px -20px;
            border-radius: 6px 6px 0 0;
            font-weight: bold;
        }
        .container-fluid {
            max-width: 1200px;
        }
        .alert {
            margin-bottom: 20px;
        }
        .btn-lg {
            padding: 12px 24px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container-fluid mt-3">
        <div class="row">
            <div class="col-12">
                <h1>Simple Edit Form Test</h1>
                
                <?php if (!$product): ?>
                    <div class="alert alert-danger">
                        <h4>Product Not Found</h4>
                        <p>Product ID: <?php echo htmlspecialchars($productId); ?></p>
                        <p>API Response: <?php echo htmlspecialchars(json_encode($productResult)); ?></p>
                    </div>
                <?php else: ?>
                    <div class="alert alert-success">
                        <strong>Product Found:</strong> <?php echo htmlspecialchars($product['name']); ?>
                    </div>
                    
                    <form method="POST" action="index.php?page=products&action=edit&id=<?php echo $productId; ?>" enctype="multipart/form-data">
                        <input type="hidden" name="action" value="update">
                        
                        <!-- Section 1: Basic Info -->
                        <div class="form-section">
                            <div class="section-title">1. Basic Information</div>
                            <div class="row">
                                <div class="col-md-4">
                                    <label class="form-label">Product Name *</label>
                                    <input type="text" name="name" class="form-control" 
                                           value="<?php echo htmlspecialchars($product['name'] ?? ''); ?>" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Price (₹) *</label>
                                    <input type="number" name="price" class="form-control" 
                                           value="<?php echo $product['price'] ?? ''; ?>" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Brand</label>
                                    <input type="text" name="brand" class="form-control" 
                                           value="<?php echo htmlspecialchars($product['brand'] ?? ''); ?>">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Section 2: Inventory -->
                        <div class="form-section">
                            <div class="section-title">2. Inventory & Categories</div>
                            <div class="row">
                                <div class="col-md-4">
                                    <label class="form-label">Stock Quantity *</label>
                                    <input type="number" name="stock" class="form-control" 
                                           value="<?php echo $product['stock'] ?? '0'; ?>" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Category *</label>
                                    <select name="category" class="form-control" required>
                                        <option value="">Select Category</option>
                                        <?php if (isset($product['category'])): ?>
                                            <option value="<?php echo $product['category']['_id'] ?? ''; ?>" selected>
                                                <?php echo htmlspecialchars($product['category']['name'] ?? 'Current Category'); ?>
                                            </option>
                                        <?php endif; ?>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Sub-Category</label>
                                    <select name="subcategory" class="form-control">
                                        <option value="">Select Sub-Category</option>
                                        <?php if (isset($product['subcategory'])): ?>
                                            <option value="<?php echo $product['subcategory']['_id'] ?? ''; ?>" selected>
                                                <?php echo htmlspecialchars($product['subcategory']['name'] ?? 'Current Subcategory'); ?>
                                            </option>
                                        <?php endif; ?>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Section 3: Images -->
                        <div class="form-section">
                            <div class="section-title">3. Product Images</div>
                            
                            <?php if (!empty($product['images'])): ?>
                                <div class="mb-3">
                                    <label class="form-label">Current Images</label>
                                    <div class="row">
                                        <?php foreach ($product['images'] as $index => $image): ?>
                                            <div class="col-md-2 mb-2">
                                                <div class="card">
                                                    <img src="/<?php echo htmlspecialchars($image['url'] ?? $image); ?>" 
                                                         class="card-img-top" style="height: 100px; object-fit: cover;">
                                                    <div class="card-body p-1">
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
                                <small class="text-muted">Select multiple images to add</small>
                            </div>
                        </div>
                        
                        <!-- Section 4: Description -->
                        <div class="form-section">
                            <div class="section-title">4. Product Description</div>
                            <div class="mb-3">
                                <label class="form-label">Description *</label>
                                <textarea name="description" class="form-control" rows="6" required><?php echo htmlspecialchars($product['description'] ?? ''); ?></textarea>
                                <small class="text-muted">Provide detailed product description</small>
                            </div>
                        </div>
                        
                        <!-- Section 5: Settings -->
                        <div class="form-section">
                            <div class="section-title">5. Product Settings</div>
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
                        
                        <!-- Section 6: Actions -->
                        <div class="form-section">
                            <div class="section-title">6. Actions</div>
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary btn-lg">
                                    <i class="fas fa-save"></i> Update Product
                                </button>
                                <a href="index.php?page=products" class="btn btn-secondary btn-lg">
                                    <i class="fas fa-arrow-left"></i> Cancel
                                </a>
                                <button type="reset" class="btn btn-outline-warning btn-lg">
                                    <i class="fas fa-undo"></i> Reset Form
                                </button>
                            </div>
                        </div>
                    </form>
                <?php endif; ?>
                
                <div class="mt-4">
                    <h3>Navigation</h3>
                    <ul>
                        <li><a href="index.php?page=products">← Back to Products</a></li>
                        <li><a href="debug-edit-form.php?id=<?php echo $productId; ?>">Debug Form Issues</a></li>
                        <li><a href="index.php?page=products&action=edit&id=<?php echo $productId; ?>">Try Original Edit</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Ensure all sections are visible
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Page loaded, checking sections...');
            
            const sections = document.querySelectorAll('.form-section');
            console.log('Found sections:', sections.length);
            
            sections.forEach((section, index) => {
                console.log(`Section ${index + 1}:`, section.querySelector('.section-title')?.textContent);
                section.style.display = 'block';
                section.style.visibility = 'visible';
            });
            
            // Add section navigation
            const nav = document.createElement('div');
            nav.className = 'section-nav mb-3';
            nav.innerHTML = `
                <div class="alert alert-info">
                    <strong>Form Sections:</strong>
                    <button class="btn btn-sm btn-outline-primary ms-2" onclick="scrollToSection(1)">1. Basic Info</button>
                    <button class="btn btn-sm btn-outline-primary ms-1" onclick="scrollToSection(2)">2. Inventory</button>
                    <button class="btn btn-sm btn-outline-primary ms-1" onclick="scrollToSection(3)">3. Images</button>
                    <button class="btn btn-sm btn-outline-primary ms-1" onclick="scrollToSection(4)">4. Description</button>
                    <button class="btn btn-sm btn-outline-primary ms-1" onclick="scrollToSection(5)">5. Settings</button>
                    <button class="btn btn-sm btn-outline-primary ms-1" onclick="scrollToSection(6)">6. Actions</button>
                </div>
            `;
            
            const form = document.querySelector('form');
            if (form) {
                form.parentNode.insertBefore(nav, form);
            }
        });
        
        function scrollToSection(sectionNumber) {
            const sections = document.querySelectorAll('.form-section');
            if (sections[sectionNumber - 1]) {
                sections[sectionNumber - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        
        // Form validation
        function validateForm() {
            const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    isValid = false;
                } else {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                }
            });
            
            return isValid;
        }
        
        // Add form submission handler
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    if (!validateForm()) {
                        e.preventDefault();
                        alert('Please fill in all required fields.');
                        return false;
                    }
                    
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
                    }
                });
            }
        });
    </script>
</body>
</html>