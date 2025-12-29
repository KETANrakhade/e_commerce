<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start output buffering to prevent header issues
ob_start();

// Handle product actions
$action = $_GET['action'] ?? 'list';
$productId = $_GET['id'] ?? '';

// Check for session success message
$sessionSuccess = '';
$sessionSuccessType = '';
if (isset($_SESSION['product_success'])) {
    $sessionSuccess = $_SESSION['product_success'];
    $sessionSuccessType = $_SESSION['product_success_type'] ?? 'info';
    unset($_SESSION['product_success']);
    unset($_SESSION['product_success_type']);
}

// Debug: Log the current action and request method
error_log('Current action: ' . $action);
error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
error_log('POST data: ' . json_encode($_POST));

// Get products data from Node.js backend API only
$page = $_GET['page'] ?? 1;
$search = $_GET['search'] ?? '';
$category = $_GET['category'] ?? '';
$status = $_GET['status'] ?? '';

$queryParams = http_build_query([
    'page' => $page,
    'limit' => 10,
    'search' => $search,
    'category' => $category,
    'status' => $status
]);

// Include API client
require_once __DIR__ . '/../config/api_client.php';

// Fetch products from API
$apiClient = getApiClient();
$productsData = $apiClient->getAdminProducts([
    'page' => $page,
    'limit' => 10,
    'search' => $search,
    'category' => $category,
    'status' => $status
]);

// Extract products from response
// Handle different response structures
if ($productsData['success'] && isset($productsData['data'])) {
    $data = $productsData['data'];
    
    // Check if products are directly in data or nested
    if (isset($data['products'])) {
        // Structure: { data: { products: [...], pagination: {...} } }
        $products = [
            'products' => $data['products'] ?? [],
            'pagination' => $data['pagination'] ?? [
                'page' => 1,
                'pages' => 1,
                'total' => count($data['products'] ?? [])
            ],
            'categories' => $data['categories'] ?? [],
            'brands' => $data['brands'] ?? []
        ];
    } elseif (is_array($data) && isset($data[0])) {
        // Structure: { data: [{...}, {...}] } - array of products
        $products = [
            'products' => $data,
            'pagination' => [
                'page' => 1,
                'pages' => 1,
                'total' => count($data)
            ],
            'categories' => [],
            'brands' => []
        ];
    } else {
        // Fallback: empty structure
        $products = [
            'products' => [],
            'pagination' => ['page' => 1, 'pages' => 1, 'total' => 0],
            'categories' => [],
            'brands' => []
        ];
    }
} else {
    $products = [
    'products' => [],
    'pagination' => ['page' => 1, 'pages' => 1, 'total' => 0],
        'categories' => [],
        'brands' => []
];
}

// Handle API errors
$apiError = '';
if (!$productsData['success']) {
    $apiError = 'Failed to load products. Please ensure your backend server is running on port 5001.';
    if (isset($productsData['error'])) {
        $apiError .= ' Error: ' . $productsData['error'];
    }
    if (isset($productsData['http_code']) && $productsData['http_code'] === 0) {
        $apiError = 'Connection error: Could not reach backend server. Make sure backend is running on port 5001.';
    }
}

// Add isActive field to products for display
// Products from API have isActive (boolean), not status (string)
foreach ($products['products'] as &$prod) {
    // Handle both isActive (boolean) and status (string) for backward compatibility
    if (isset($prod['isActive'])) {
        // Already has isActive boolean field
        $prod['isActive'] = (bool)$prod['isActive'];
    } elseif (isset($prod['status'])) {
        // Has status string field, convert to isActive
        $prod['isActive'] = ($prod['status'] === 'active');
    } else {
        // Default to active if neither field exists
        $prod['isActive'] = true;
    }
    
    // Ensure brand field exists
    if (isset($prod['brand']) && is_array($prod['brand'])) {
        // Brand is populated object, extract name
        $prod['brandName'] = $prod['brand']['name'] ?? $prod['brandName'] ?? 'No Brand';
        $prod['brand'] = $prod['brandName'];
    } else {
        $prod['brand'] = $prod['brand'] ?? $prod['brandName'] ?? 'Pyramid';
    }
    
    // Ensure other required fields exist
    $prod['name'] = $prod['name'] ?? 'Unnamed Product';
    $prod['price'] = $prod['price'] ?? 0;
    $prod['stock'] = $prod['stock'] ?? 0;
    
    // Handle category - ensure it's accessible
    if (isset($prod['category']) && is_array($prod['category'])) {
        // Category is populated object, extract name
        $prod['categoryName'] = $prod['category']['name'] ?? $prod['categoryName'] ?? 'Uncategorized';
    } elseif (!isset($prod['categoryName']) && !isset($prod['category'])) {
        $prod['categoryName'] = 'Uncategorized';
    }
}

// Handle form submissions
if ($_POST && isset($_POST['action'])) {
    $postAction = $_POST['action'];
    
    if ($postAction === 'create') {
        // Prepare product data
        $productData = [
            'name' => trim($_POST['name'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
            'price' => max(0, floatval($_POST['price'] ?? 0)), // Ensure non-negative
            'category' => trim($_POST['category'] ?? ''),
            'subcategory' => !empty($_POST['subcategory']) ? trim($_POST['subcategory']) : null,
            'stock' => max(0, intval($_POST['stock'] ?? 0)), // Ensure non-negative
            'isActive' => isset($_POST['isActive']) ? true : true, // Default to active
            'featured' => isset($_POST['featured']) ? true : false
        ];
        
        // Handle images - process file uploads
        $uploadedImages = [];
        if (!empty($_FILES['image_files']['name'][0])) {
            // Process uploaded files
            for ($i = 0; $i < count($_FILES['image_files']['name']); $i++) {
                if ($_FILES['image_files']['error'][$i] === UPLOAD_ERR_OK) {
                    $tmpName = $_FILES['image_files']['tmp_name'][$i];
                    $fileName = $_FILES['image_files']['name'][$i];
                    $fileSize = $_FILES['image_files']['size'][$i];
                    $fileType = $_FILES['image_files']['type'][$i];
                    
                    // Validate file type
                    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
                    if (!in_array($fileType, $allowedTypes)) {
                        $error = 'Invalid file type. Only JPG, PNG, WebP, and GIF images are allowed.';
                        break;
                    }
                    
                    // Validate file size (5MB max)
                    if ($fileSize > 5 * 1024 * 1024) {
                        $error = 'File size too large. Maximum 5MB per image.';
                        break;
                    }
                    
                    // Generate unique filename
                    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
                    $uniqueName = 'product_' . time() . '_' . $i . '.' . $extension;
                    $uploadPath = __DIR__ . '/../../uploads/products/' . $uniqueName;
                    
                    // Create upload directory if it doesn't exist
                    $uploadDir = dirname($uploadPath);
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    
                    // Move uploaded file
                    if (move_uploaded_file($tmpName, $uploadPath)) {
                        // Store relative path for database (accessible from frontend root)
                        $uploadedImages[] = 'uploads/products/' . $uniqueName;
                    } else {
                        $error = 'Failed to upload image: ' . $fileName;
                        break;
                    }
                }
            }
        }
        
        // Handle existing images (for edit mode)
        $existingImages = $_POST['existing_images'] ?? [];
        $existingImages = array_filter($existingImages); // Remove empty values
        
        // Combine uploaded and existing images
        $allImages = array_merge($existingImages, $uploadedImages);
        
        if (!empty($allImages)) {
            $productData['images'] = $allImages;
            $productData['imageUrls'] = $allImages; // Some backends expect this
        }
        
        // Handle images - legacy URL support (fallback) - only for existing products
        if (empty($allImages) && !empty($_POST['images']) && $action === 'edit') {
            $images = is_array($_POST['images']) ? $_POST['images'] : explode(',', $_POST['images']);
            $images = array_filter(array_map('trim', $images)); // Remove empty values
            if (!empty($images)) {
                $productData['images'] = $images;
                $productData['imageUrls'] = $images; // Some backends expect this
            }
        }
        
        // Handle brand
        if (!empty($_POST['brand'])) {
            $productData['brand'] = trim($_POST['brand']);
        }
        
        // Validation
        if (empty($productData['name'])) {
            $error = 'Product name is required';
        } elseif ($productData['price'] <= 0) {
            $error = 'Product price must be greater than 0';
        } elseif (empty($productData['category'])) {
            $error = 'Product category is required';
        } else {
            // Ensure images are in correct format for backend
            if (isset($productData['images']) && is_array($productData['images'])) {
                // Backend expects images as array of objects with url property
                $productData['images'] = array_map(function($img) use ($productData) {
                    if (is_string($img)) {
                        return [
                            'url' => $img,
                            'publicId' => 'product-' . time() . '-' . rand(1000, 9999),
                            'alt' => $productData['name'] . ' - Image',
                            'isPrimary' => false
                        ];
                    }
                    return $img;
                }, $productData['images']);
                // Set first image as primary
                if (!empty($productData['images'])) {
                    $productData['images'][0]['isPrimary'] = true;
                }
            }
            
            // Additional validation: ensure no empty or invalid image URLs
            if (isset($productData['images'])) {
                $productData['images'] = array_filter($productData['images'], function($img) {
                    $url = is_array($img) ? ($img['url'] ?? '') : $img;
                    return !empty($url) && $url !== 'has_images' && $url !== '';
                });
                // Re-index array
                $productData['images'] = array_values($productData['images']);
            }
            
            if (isset($productData['imageUrls'])) {
                $productData['imageUrls'] = array_filter($productData['imageUrls'], function($url) {
                    return !empty($url) && $url !== 'has_images' && $url !== '';
                });
                // Re-index array
                $productData['imageUrls'] = array_values($productData['imageUrls']);
            }
            
            // Debug: Log the product data being sent
            error_log('Creating product with data: ' . json_encode($productData));
            error_log('Final product data being sent: ' . json_encode($productData));
            
            // Proceed with API call
            $result = $apiClient->createProduct($productData);
            
            // Debug: Log the API response
            error_log('API response: ' . json_encode($result));
            error_log('Success check: ' . ($result['success'] ? 'true' : 'false'));
            
        if ($result['success']) {
            error_log('Product creation successful');
            // Set session success message for simple popup
            $_SESSION['product_success'] = 'Product created successfully!';
            $_SESSION['product_success_type'] = 'create';
            header('Location: index.php?page=products');
            exit();
        } else {
            error_log('Product creation failed, showing error');
            // Set error message for display
            $error = 'Failed to create product. ';
            
            // Enhanced error handling with debugging info
                $debugInfo = '<br><br><strong>Debug Information:</strong><br>';
                $debugInfo .= 'HTTP Code: ' . ($result['http_code'] ?? 'N/A') . '<br>';
                $debugInfo .= 'Category ID sent: ' . htmlspecialchars($productData['category']) . '<br>';
                $debugInfo .= 'Product name: ' . htmlspecialchars($productData['name']) . '<br>';
                $debugInfo .= 'Price: ' . $productData['price'] . '<br>';
                
                if (isset($result['http_code'])) {
                if ($result['http_code'] === 404) {
                    // 404 can mean either route not found OR resource not found (e.g., invalid category ID)
                    $errorMsg = isset($result['data']['error']) ? $result['data']['error'] : '';
                    if (stripos($errorMsg, 'category') !== false || stripos($errorMsg, 'Invalid category') !== false) {
                        $error = 'Category not found (404). The selected category may be invalid or deleted.<br>';
                        $error .= 'Please <a href="create-categories.php">create categories</a> or select a valid category from the dropdown.';
                        $error .= $debugInfo;
                    } else {
                        $error = 'API endpoint not found (404). Possible causes:<br>';
                        $error .= '1. Backend route may not exist: POST /api/admin/products<br>';
                        $error .= '2. Authentication token may be invalid (try <a href="login.php">logging in again</a>)<br>';
                        $error .= '3. Backend server may need to be restarted<br>';
                        $error .= '<br>Check backend logs for more details.' . $debugInfo;
                    }
                } elseif ($result['http_code'] === 401) {
                        $error = 'Authentication failed. Please <a href="login.php">login again</a>.' . $debugInfo;
                    } elseif ($result['http_code'] === 403) {
                        $error = 'Access denied. You do not have permission to create products.' . $debugInfo;
                    } elseif ($result['http_code'] === 400) {
                        $errorMsg = $result['data']['error'] ?? $result['data']['message'] ?? 'Please check all required fields (name, price, category)';
                        
                        // Handle specific error cases
                        if (stripos($errorMsg, 'duplicate') !== false || stripos($errorMsg, 'E11000') !== false) {
                            $error = 'Product with this name already exists. Please use a different product name.' . $debugInfo;
                        } else {
                            $error = 'Invalid data: ' . $errorMsg . $debugInfo;
                        }
                    } elseif ($result['http_code'] === 0) {
                        $error = 'Connection error: Could not reach backend server. Make sure backend is running on port 5001.' . $debugInfo;
                    } else {
                        $error = 'Error ' . $result['http_code'] . ': ' . ($result['data']['error'] ?? $result['data']['message'] ?? 'Failed to create product') . $debugInfo;
                    }
                } else {
                    $error = ($result['error'] ?? ($result['data']['error'] ?? $result['data']['message'] ?? 'Failed to create product')) . $debugInfo;
                }
                
                // Log error for debugging
                error_log('Product creation failed: ' . json_encode($result));
            }
        }
    } elseif ($postAction === 'update' && $productId) {
        $productData = [
            'name' => $_POST['name'],
            'description' => $_POST['description'],
            'price' => floatval($_POST['price']),
            'category' => $_POST['category'],
            'subcategory' => !empty($_POST['subcategory']) ? $_POST['subcategory'] : null,
            'stock' => intval($_POST['stock']),
            'brand' => $_POST['brand'],
            'featured' => isset($_POST['featured']),
            'isActive' => isset($_POST['isActive'])
        ];
        
        // Handle images - process file uploads for update
        $uploadedImages = [];
        if (!empty($_FILES['image_files']['name'][0])) {
            // Process uploaded files
            for ($i = 0; $i < count($_FILES['image_files']['name']); $i++) {
                if ($_FILES['image_files']['error'][$i] === UPLOAD_ERR_OK) {
                    $tmpName = $_FILES['image_files']['tmp_name'][$i];
                    $fileName = $_FILES['image_files']['name'][$i];
                    $fileSize = $_FILES['image_files']['size'][$i];
                    $fileType = $_FILES['image_files']['type'][$i];
                    
                    // Validate file type
                    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
                    if (!in_array($fileType, $allowedTypes)) {
                        $error = 'Invalid file type. Only JPG, PNG, WebP, and GIF images are allowed.';
                        break;
                    }
                    
                    // Validate file size (5MB max)
                    if ($fileSize > 5 * 1024 * 1024) {
                        $error = 'File size too large. Maximum 5MB per image.';
                        break;
                    }
                    
                    // Generate unique filename
                    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
                    $uniqueName = 'product_' . time() . '_' . $i . '.' . $extension;
                    $uploadPath = __DIR__ . '/../../uploads/products/' . $uniqueName;
                    
                    // Create upload directory if it doesn't exist
                    $uploadDir = dirname($uploadPath);
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    
                    // Move uploaded file
                    if (move_uploaded_file($tmpName, $uploadPath)) {
                        // Store relative path for database (accessible from frontend root)
                        $uploadedImages[] = 'uploads/products/' . $uniqueName;
                    } else {
                        $error = 'Failed to upload image: ' . $fileName;
                        break;
                    }
                }
            }
        }
        
        // Handle existing images (for edit mode)
        $existingImages = $_POST['existing_images'] ?? [];
        $existingImages = array_filter($existingImages); // Remove empty values
        
        // Combine uploaded and existing images
        $allImages = array_merge($existingImages, $uploadedImages);
        
        if (!empty($allImages)) {
            $productData['images'] = $allImages;
        } else {
            // Fallback to legacy images field if available
            if (!empty($_POST['images'])) {
                $productData['images'] = explode(',', $_POST['images']);
            }
        }
        
        // Only proceed if no upload errors occurred
        if (!isset($error)) {
            $result = $apiClient->updateProduct($productId, $productData);
            if ($result['success']) {
                // Set session success message for simple popup
                $_SESSION['product_success'] = 'Product updated successfully!';
                $_SESSION['product_success_type'] = 'update';
                header('Location: index.php?page=products');
                exit();
            } else {
                $error = $result['error'] ?? ($result['data']['error'] ?? 'Failed to update product');
                if (isset($result['http_code']) && $result['http_code'] === 0) {
                    $error = 'Connection error: Could not reach backend server. Make sure backend is running on port 5001.';
                }
            }
        }
    } elseif ($postAction === 'delete' && $productId) {
        $result = $apiClient->deleteProduct($productId);
        if ($result['success']) {
            // Set session success message for simple popup
            $_SESSION['product_success'] = 'Product deleted successfully!';
            $_SESSION['product_success_type'] = 'delete';
            header('Location: index.php?page=products');
            exit();
        } else {
            $error = $result['error'] ?? ($result['data']['error'] ?? 'Failed to delete product');
            if (isset($result['http_code']) && $result['http_code'] === 0) {
                $error = 'Connection error: Could not reach backend server. Make sure backend is running on port 5001.';
            }
        }
    }
}

// Get single product for edit
$product = null;
if ($action === 'edit' && $productId) {
    $productResult = $apiClient->getProductById($productId);
    if ($productResult['success']) {
        // API client already extracts: { success: true, data: product }
        $product = $productResult['data'] ?? null;
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
                        <h4 class="mb-sm-0 font-size-18">Products</h4>
                        <div class="page-title-right">
                            <ol class="breadcrumb m-0">
                                <li class="breadcrumb-item"><a href="index.php">Admin</a></li>
                                <li class="breadcrumb-item active">Products</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <?php if (isset($_GET['success'])): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <?php echo htmlspecialchars($_GET['success']); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <?php if (isset($error)): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <?php echo htmlspecialchars($error); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <!-- Simple Success Popup Modal -->
            <?php if (!empty($sessionSuccess)): ?>
                <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-sm">
                        <div class="modal-content">
                            <div class="modal-header bg-success text-white">
                                <h5 class="modal-title" id="successModalLabel">
                                    <i class="mdi mdi-check-circle me-2"></i>Success
                                </h5>
                            </div>
                            <div class="modal-body text-center">
                                <div class="mb-3">
                                    <i class="mdi mdi-check-circle-outline text-success" style="font-size: 3rem;"></i>
                                </div>
                                <h5 class="mb-0"><?php echo htmlspecialchars($sessionSuccess); ?></h5>
                            </div>
                            <div class="modal-footer justify-content-center">
                                <button type="button" class="btn btn-success" data-bs-dismiss="modal">OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <?php if ($action === 'list'): ?>
                <!-- Product List -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row mb-2">
                                    <div class="col-sm-4">
                                        <div class="search-box me-2 mb-2 d-inline-block">
                                            <div class="position-relative">
                                                <input type="text" class="form-control" id="searchInput" 
                                                       placeholder="Search products..." value="<?php echo htmlspecialchars($search); ?>">
                                                <i class="bx bx-search-alt search-icon"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-8">
                                        <div class="text-sm-end">
                                            <button type="button" class="btn btn-success btn-rounded waves-effect waves-light mb-2 me-2" onclick="window.location.href='index.php?page=products&action=create'">
                                                <i class="mdi mdi-plus me-1"></i> Add Product
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Filters -->
                                <div class="row mb-3">
                                    <div class="col-md-3">
                                        <select class="form-select" id="categoryFilter">
                                            <option value="">All Categories</option>
                                            <?php if (!empty($products['categories'])): ?>
                                                <?php foreach ($products['categories'] as $cat): ?>
                                                    <?php 
                                                    $catName = is_array($cat) ? ($cat['name'] ?? 'Unknown') : $cat;
                                                    $catValue = is_array($cat) ? ($cat['name'] ?? '') : $cat;
                                                    ?>
                                                    <option value="<?php echo htmlspecialchars($catValue); ?>" 
                                                            <?php echo $category === $catValue ? 'selected' : ''; ?>>
                                                        <?php echo htmlspecialchars($catName); ?>
                                                    </option>
                                                <?php endforeach; ?>
                                            <?php endif; ?>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <select class="form-select" id="statusFilter">
                                            <option value="">All Status</option>
                                            <option value="active" <?php echo $status === 'active' ? 'selected' : ''; ?>>Active</option>
                                            <option value="inactive" <?php echo $status === 'inactive' ? 'selected' : ''; ?>>Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="table-responsive">
                                    <table class="table align-middle table-nowrap table-hover">
                                        <thead class="table-light">
                                            <tr>
                                                <th scope="col" style="width: 50px;">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="checkAll">
                                                        <label class="form-check-label" for="checkAll"></label>
                                                    </div>
                                                </th>
                                                <th scope="col">Product</th>
                                                <th scope="col">Category</th>
                                                <th scope="col">Stock</th>
                                                <th scope="col">Price</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php if (!empty($products['products'])): ?>
                                                <?php foreach ($products['products'] as $prod): ?>
                                                    <tr>
                                                        <th scope="row">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" 
                                                                       name="productIds[]" value="<?php echo $prod['_id']; ?>">
                                                            </div>
                                                        </th>
                                                        <td>
                                                            <div class="d-flex align-items-center">
                                                                <div class="avatar-sm bg-light rounded p-1 me-2">
                                                                    <?php if (!empty($prod['images'][0])): ?>
                                                                        <?php 
                                                                        $imageUrl = is_array($prod['images'][0]) ? ($prod['images'][0]['url'] ?? '') : $prod['images'][0];
                                                                        ?>
                                                                        <img src="../../<?php echo htmlspecialchars($imageUrl); ?>" 
                                                                             alt="" class="img-fluid d-block">
                                                                    <?php else: ?>
                                                                        <div class="avatar-sm bg-light d-flex align-items-center justify-content-center">
                                                                            <i class="bx bx-package font-size-16"></i>
                                                                        </div>
                                                                    <?php endif; ?>
                                                                </div>
                                                                <div>
                                                                    <h5 class="text-truncate font-size-14 mb-1">
                                                                        <a href="javascript: void(0);" class="text-dark">
                                                                            <?php echo htmlspecialchars($prod['name']); ?>
                                                                        </a>
                                                                    </h5>
                                                                    <p class="text-muted mb-0"><?php echo htmlspecialchars(is_array($prod['brand']) ? ($prod['brand']['name'] ?? 'No Brand') : ($prod['brand'] ?? 'No Brand')); ?></p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><?php echo htmlspecialchars($prod['categoryName'] ?? ($prod['category']['name'] ?? 'Uncategorized')); ?></td>
                                                        <td>
                                                            <div class="text-center">
                                                                <span class="badge badge-pill badge-soft-<?php echo $prod['stock'] > 0 ? 'success' : 'danger'; ?> font-size-12">
                                                                    <?php echo $prod['stock']; ?>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>₹ <?php echo number_format($prod['price'], 2); ?></td>
                                                        <td>
                                                            <span class="badge badge-pill badge-soft-<?php echo $prod['isActive'] ? 'success' : 'danger'; ?> font-size-11">
                                                                <?php echo $prod['isActive'] ? 'Active' : 'Inactive'; ?>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div class="d-flex gap-3">
                                                                <a href="index.php?page=products&action=edit&id=<?php echo $prod['_id']; ?>" 
                                                                   class="text-success">
                                                                    <i class="mdi mdi-pencil font-size-18"></i>
                                                                </a>
                                                                <a href="javascript:void(0);" class="text-danger" 
                                                                   onclick="deleteProduct('<?php echo $prod['_id']; ?>')">
                                                                    <i class="mdi mdi-delete font-size-18"></i>
                                                                </a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            <?php else: ?>
                                                <tr>
                                                    <td colspan="7" class="text-center">
                                                        <?php if (!empty($apiError)): ?>
                                                            <div class="text-warning">
                                                                <i class="bx bx-error-circle"></i> Connection Error
                                                            </div>
                                                            <small class="text-muted">Check backend server connection</small>
                                                        <?php else: ?>
                                                            <div class="text-muted">
                                                                <i class="bx bx-package"></i> No products found
                                                            </div>
                                                            <small class="text-muted">
                                                                <a href="index.php?page=products&action=add">Add your first product</a> to get started
                                                            </small>
                                                        <?php endif; ?>
                                                    </td>
                                                </tr>
                                            <?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Pagination -->
                                <?php if (!empty($products['pagination']) && $products['pagination']['pages'] > 1): ?>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <ul class="pagination pagination-rounded justify-content-end mb-2">
                                                <?php 
                                                $pagination = $products['pagination'];
                                                $currentPage = $pagination['page'];
                                                $totalPages = $pagination['pages'];
                                                ?>
                                                
                                                <?php if ($currentPage > 1): ?>
                                                    <li class="page-item">
                                                        <a class="page-link" href="?page=products&p=<?php echo $currentPage - 1; ?>&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&status=<?php echo urlencode($status); ?>">Previous</a>
                                                    </li>
                                                <?php endif; ?>
                                                
                                                <?php for ($i = max(1, $currentPage - 2); $i <= min($totalPages, $currentPage + 2); $i++): ?>
                                                    <li class="page-item <?php echo $i === $currentPage ? 'active' : ''; ?>">
                                                        <a class="page-link" href="?page=products&p=<?php echo $i; ?>&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&status=<?php echo urlencode($status); ?>"><?php echo $i; ?></a>
                                                    </li>
                                                <?php endfor; ?>
                                                
                                                <?php if ($currentPage < $totalPages): ?>
                                                    <li class="page-item">
                                                        <a class="page-link" href="?page=products&p=<?php echo $currentPage + 1; ?>&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&status=<?php echo urlencode($status); ?>">Next</a>
                                                    </li>
                                                <?php endif; ?>
                                            </ul>
                                        </div>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>

            <?php elseif ($action === 'create' || $action === 'edit'): ?>
                <!-- Product Form -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h4 class="card-title"><?php echo $action === 'create' ? 'Add New Product' : 'Edit Product'; ?></h4>
                                <p class="card-title-desc">Fill all information below</p>

                                <form method="POST" action="" enctype="multipart/form-data">
                                    <input type="hidden" name="action" value="<?php echo $action === 'create' ? 'create' : 'update'; ?>">
                                    
                                    <div class="row">
                                        <div class="col-sm-6">
                                            <div class="mb-3">
                                                <label for="name">Product Name</label>
                                                <input id="name" name="name" type="text" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['name'] ?? ''); ?>" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="price">Price</label>
                                                <input id="price" name="price" type="number" step="0.01" min="0" class="form-control" 
                                                       value="<?php echo $product['price'] ?? ''; ?>" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="brand">Brand</label>
                                                <input id="brand" name="brand" type="text" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['brand'] ?? ''); ?>">
                                            </div>
                                        </div>

                                        <div class="col-sm-6">
                                            <div class="mb-3">
                                                <label for="stock">Stock Quantity</label>
                                                <input id="stock" name="stock" type="number" min="0" class="form-control" 
                                                       value="<?php echo $product['stock'] ?? '0'; ?>" required>
                                            </div>
                                            <div class="row">
                                                <div class="col-sm-6">
                                                    <div class="mb-3">
                                                        <label for="category">Category <span class="text-danger">*</span></label>
                                                        <select id="category" name="category" class="form-control" required>
                                                            <option value="">Select Category</option>
                                                            <?php 
                                                            // Get categories from API
                                                            $categoriesData = $apiClient->makeRequest('categories');
                                                            $availableCategories = [];
                                                            
                                                            // Handle different response structures
                                                            if ($categoriesData['success']) {
                                                                // The API client wraps the response, so we have nested data
                                                                // Structure: {success: true, data: {success: true, data: {categories: [...]}}}
                                                                if (isset($categoriesData['data']['data']['categories'])) {
                                                                    $availableCategories = $categoriesData['data']['data']['categories'];
                                                                } elseif (isset($categoriesData['data']['categories'])) {
                                                                    $availableCategories = $categoriesData['data']['categories'];
                                                                } elseif (isset($categoriesData['data']['data']) && is_array($categoriesData['data']['data'])) {
                                                                    $availableCategories = $categoriesData['data']['data'];
                                                                } elseif (is_array($categoriesData['data'])) {
                                                                    $availableCategories = $categoriesData['data'];
                                                                }
                                                            }
                                                            
                                                            // Fallback: use categories from products response if available
                                                            if (empty($availableCategories) && !empty($products['categories'])) {
                                                                // Convert category names/objects to array format
                                                                foreach ($products['categories'] as $cat) {
                                                                    if (is_array($cat)) {
                                                                        $availableCategories[] = $cat;
                                                                    } else {
                                                                        // If it's just a name, we need to find the ID
                                                                        // For now, use the name as fallback
                                                                        $availableCategories[] = ['name' => $cat, '_id' => $cat];
                                                                    }
                                                                }
                                                            }
                                                            
                                                            foreach ($availableCategories as $cat): 
                                                                $catId = is_array($cat) ? ($cat['_id'] ?? $cat['id'] ?? '') : '';
                                                                $catName = is_array($cat) ? ($cat['name'] ?? '') : $cat;
                                                                
                                                                // Only show categories with valid IDs (ObjectId format: 24 hex characters)
                                                                if (empty($catId) || !preg_match('/^[a-f0-9]{24}$/i', $catId)) {
                                                                    continue; // Skip invalid categories
                                                                }
                                                                
                                                                $selected = '';
                                                                if ($action === 'edit' && isset($product['category'])) {
                                                                    $productCatId = is_array($product['category']) ? ($product['category']['_id'] ?? '') : $product['category'];
                                                                    if ($productCatId === $catId) {
                                                                        $selected = 'selected';
                                                                    }
                                                                }
                                                            ?>
                                                                <option value="<?php echo htmlspecialchars($catId); ?>" <?php echo $selected; ?>>
                                                                    <?php echo htmlspecialchars($catName ?: 'Unnamed Category'); ?>
                                                                </option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                        <?php if (empty($availableCategories)): ?>
                                                            <div class="alert alert-warning mt-2 mb-0" role="alert" style="font-size: 0.875rem;">
                                                                <strong>⚠️ No categories found!</strong><br>
                                                                <small>
                                                                    Categories are required to create products. 
                                                                    <a href="create-categories.php" target="_blank">Click here to create categories</a> 
                                                                    (Male, Female, etc.)
                                                                </small>
                                                            </div>
                                                        <?php else: ?>
                                                            <small class="text-muted">
                                                                <?php echo count($availableCategories); ?> category(ies) available
                                                                | <a href="create-categories.php" target="_blank">Manage categories</a>
                                                            </small>
                                                        <?php endif; ?>
                                                    </div>
                                                </div>
                                                <div class="col-sm-6">
                                                    <div class="mb-3">
                                                        <label for="subcategory">Sub-Category</label>
                                                        <select id="subcategory" name="subcategory" class="form-control">
                                                            <option value="">Select Sub-Category (Optional)</option>
                                                        </select>
                                                        <small class="text-muted">Select a category first to load sub-categories</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Images Section -->
                                    <div class="mb-4">
                                        <div class="card">
                                            <div class="card-header d-flex justify-content-between align-items-center">
                                                <h5 class="card-title mb-0">
                                                    <i class="mdi mdi-image-multiple me-2"></i>Product Images
                                                </h5>
                                                <button type="button" class="btn btn-sm btn-primary" onclick="addImageField()">
                                                    <i class="mdi mdi-plus"></i> Add Image
                                                </button>
                                            </div>
                                            <div class="card-body">
                                                <style>
                                                .image-file {
                                                    cursor: pointer;
                                                }
                                                .image-file::-webkit-file-upload-button {
                                                    background: #007bff;
                                                    color: white;
                                                    border: none;
                                                    padding: 8px 16px;
                                                    border-radius: 4px;
                                                    cursor: pointer;
                                                    margin-right: 10px;
                                                }
                                                .image-file::-webkit-file-upload-button:hover {
                                                    background: #0056b3;
                                                }
                                                .image-preview {
                                                    transition: all 0.3s ease;
                                                }
                                                .image-preview:hover {
                                                    border-color: #007bff !important;
                                                }
                                                </style>
                                                <div id="imageContainer">
                                                    <?php 
                                                    $existingImages = $product['images'] ?? [];
                                                    if (empty($existingImages)) {
                                                        $existingImages = [''];
                                                    }
                                                    foreach ($existingImages as $index => $imageUrl): 
                                                    ?>
                                                        <div class="image-input-group mb-3" data-index="<?php echo $index; ?>">
                                                            <div class="row align-items-center">
                                                                <div class="col-md-8">
                                                                    <div class="input-group">
                                                                        <span class="input-group-text">
                                                                            <i class="mdi mdi-image"></i>
                                                                        </span>
                                                                        <input type="file" class="form-control image-file" 
                                                                               name="image_files[]" 
                                                                               accept="image/*"
                                                                               onchange="previewImageFile(this)">
                                                                        <?php if (!empty($imageUrl)): ?>
                                                                            <input type="hidden" name="existing_images[]" value="<?php echo htmlspecialchars($imageUrl); ?>">
                                                                            <small class="text-muted mt-1">Current: <?php echo basename($imageUrl); ?></small>
                                                                        <?php endif; ?>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2">
                                                                    <div class="image-preview" style="width: 60px; height: 60px; border: 2px dashed #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f8f9fa;">
                                                                        <?php if (!empty($imageUrl)): ?>
                                                                            <img src="../../<?php echo htmlspecialchars($imageUrl); ?>" 
                                                                                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" 
                                                                                 alt="Preview">
                                                                        <?php else: ?>
                                                                            <i class="mdi mdi-image-outline text-muted"></i>
                                                                        <?php endif; ?>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-2">
                                                                    <div class="d-flex gap-1">
                                                                        <?php if ($index === 0): ?>
                                                                            <span class="badge bg-primary">Primary</span>
                                                                        <?php endif; ?>
                                                                        <?php if (count($existingImages) > 1 || !empty($imageUrl)): ?>
                                                                            <button type="button" class="btn btn-sm btn-outline-danger" 
                                                                                    onclick="removeImageField(this)" title="Remove Image">
                                                                                <i class="mdi mdi-delete"></i>
                                                                            </button>
                                                                        <?php endif; ?>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    <?php endforeach; ?>
                                                </div>
                                                
                                                <!-- Hidden input for form submission -->
                                                <input type="hidden" id="images" name="images" value="">
                                                
                                                <div class="alert alert-info mt-3">
                                                    <i class="mdi mdi-information-outline me-2"></i>
                                                    <strong>Tips:</strong>
                                                    <ul class="mb-0 mt-2">
                                                        <li>First image will be used as the primary product image</li>
                                                        <li>Use high-quality images (recommended: 800x800px or larger)</li>
                                                        <li>Supported formats: JPG, PNG, WebP, GIF</li>
                                                        <li>Maximum file size: 5MB per image</li>
                                                        <li>You can add multiple images to show different angles</li>
                                                        <li>Images will be automatically optimized and stored securely</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Description Section -->
                                    <div class="mb-4">
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="card-title mb-0">
                                                    <i class="mdi mdi-text-box-outline me-2"></i>Product Description
                                                </h5>
                                            </div>
                                            <div class="card-body">
                                                <div class="mb-3">
                                                    <label for="description">Detailed Description</label>
                                                    <textarea class="form-control" id="description" name="description" rows="6" 
                                                              placeholder="Enter detailed product description, features, specifications, etc."><?php echo htmlspecialchars($product['description'] ?? ''); ?></textarea>
                                                    <small class="text-muted">
                                                        <i class="mdi mdi-information-outline"></i> 
                                                        Provide a detailed description to help customers understand your product better.
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-sm-6">
                                            <div class="form-check mb-3">
                                                <input class="form-check-input" type="checkbox" id="featured" name="featured" 
                                                       <?php echo (!empty($product['featured'])) ? 'checked' : ''; ?>>
                                                <label class="form-check-label" for="featured">Featured Product</label>
                                            </div>
                                        </div>
                                        <?php if ($action === 'edit'): ?>
                                            <div class="col-sm-6">
                                                <div class="form-check mb-3">
                                                    <input class="form-check-input" type="checkbox" id="isActive" name="isActive" 
                                                           <?php echo (!empty($product['isActive'])) ? 'checked' : ''; ?>>
                                                    <label class="form-check-label" for="isActive">Active</label>
                                                </div>
                                            </div>
                                        <?php endif; ?>
                                    </div>

                                    <div class="d-flex flex-wrap gap-2">
                                        <button type="submit" class="btn btn-primary waves-effect waves-light">
                                            <?php echo $action === 'create' ? 'Create Product' : 'Update Product'; ?>
                                        </button>
                                        <button type="button" class="btn btn-secondary waves-effect waves-light" 
                                                onclick="window.location.href='index.php?page=products'">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
// Product management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Show simple success popup if it exists
    <?php if (!empty($sessionSuccess)): ?>
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Auto-hide after 3 seconds
        setTimeout(function() {
            successModal.hide();
        }, 3000);
    <?php endif; ?>
    
    // Initialize image management
    updateImagesHiddenField();
    updateImageIndices();
    
    // Style file inputs to look better
    const fileInputs = document.querySelectorAll('.image-file');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const fileName = this.files[0] ? this.files[0].name : 'Choose file...';
            const label = this.closest('.input-group').querySelector('.file-label');
            if (label) {
                label.textContent = fileName;
            }
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 500);
        });
    }

    // Filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    // Check all functionality
    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('input[name="productIds[]"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    // Category-Subcategory functionality
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    
    if (categorySelect && subcategorySelect) {
        categorySelect.addEventListener('change', function() {
            const categoryId = this.value;
            loadSubcategories(categoryId);
        });
        
        // Load subcategories for edit form if category is already selected
        <?php if ($action === 'edit' && !empty($product['category'])): ?>
            const initialCategoryId = '<?php echo is_array($product['category']) ? ($product['category']['_id'] ?? '') : $product['category']; ?>';
            const initialSubcategoryId = '<?php echo is_array($product['subcategory']) ? ($product['subcategory']['_id'] ?? '') : ($product['subcategory'] ?? ''); ?>';
            if (initialCategoryId) {
                loadSubcategories(initialCategoryId, initialSubcategoryId);
            }
        <?php endif; ?>
    }
});

function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    const params = new URLSearchParams();
    params.append('page', 'products');
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    
    window.location.href = '?' + params.toString();
}

function loadSubcategories(categoryId, selectedSubcategoryId = '') {
    const subcategorySelect = document.getElementById('subcategory');
    if (!subcategorySelect || !categoryId) {
        // Clear subcategories if no category selected
        subcategorySelect.innerHTML = '<option value="">Select Sub-Category (Optional)</option>';
        return;
    }
    
    // Show loading state
    subcategorySelect.innerHTML = '<option value="">Loading sub-categories...</option>';
    subcategorySelect.disabled = true;
    
    // Fetch subcategories via AJAX
    fetch(`ajax/subcategories.php?category=${categoryId}`)
        .then(response => response.json())
        .then(data => {
            subcategorySelect.innerHTML = '<option value="">Select Sub-Category (Optional)</option>';
            
            if (data.success && data.subcategories && data.subcategories.length > 0) {
                data.subcategories.forEach(subcategory => {
                    const option = document.createElement('option');
                    option.value = subcategory._id || subcategory.id;
                    option.textContent = subcategory.name;
                    if (selectedSubcategoryId && (subcategory._id === selectedSubcategoryId || subcategory.id === selectedSubcategoryId)) {
                        option.selected = true;
                    }
                    subcategorySelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No sub-categories available';
                option.disabled = true;
                subcategorySelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error loading subcategories:', error);
            subcategorySelect.innerHTML = '<option value="">Error loading sub-categories</option>';
        })
        .finally(() => {
            subcategorySelect.disabled = false;
        });
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `index.php?page=products&action=delete&id=${productId}`;
        
        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'action';
        actionInput.value = 'delete';
        
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
    }
}

// Image Management Functions
function addImageField() {
    const container = document.getElementById('imageContainer');
    const index = container.children.length;
    
    const imageGroup = document.createElement('div');
    imageGroup.className = 'image-input-group mb-3';
    imageGroup.setAttribute('data-index', index);
    
    imageGroup.innerHTML = `
        <div class="row align-items-center">
            <div class="col-md-8">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="mdi mdi-image"></i>
                    </span>
                    <input type="file" class="form-control image-file" 
                           name="image_files[]" 
                           accept="image/*"
                           onchange="previewImageFile(this)">
                </div>
            </div>
            <div class="col-md-2">
                <div class="image-preview" style="width: 60px; height: 60px; border: 2px dashed #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f8f9fa;">
                    <i class="mdi mdi-image-outline text-muted"></i>
                </div>
            </div>
            <div class="col-md-2">
                <div class="d-flex gap-1">
                    <button type="button" class="btn btn-sm btn-outline-danger" 
                            onclick="removeImageField(this)" title="Remove Image">
                        <i class="mdi mdi-delete"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(imageGroup);
    updateImageIndices();
    updateImagesHiddenField();
}

function removeImageField(button) {
    const imageGroup = button.closest('.image-input-group');
    const container = document.getElementById('imageContainer');
    
    // Don't remove if it's the only field
    if (container.children.length <= 1) {
        // Just clear the input instead
        const input = imageGroup.querySelector('.image-file') || imageGroup.querySelector('.image-url');
        const preview = imageGroup.querySelector('.image-preview');
        const existingImageInput = imageGroup.querySelector('input[name="existing_images[]"]');
        
        // Clear file input
        if (input) {
            input.value = '';
        }
        
        // Clear existing image input
        if (existingImageInput) {
            existingImageInput.remove();
        }
        
        // Reset preview
        preview.innerHTML = '<i class="mdi mdi-image-outline text-muted"></i>';
        updateImagesHiddenField();
        return;
    }
    
    imageGroup.remove();
    updateImageIndices();
    updateImagesHiddenField();
}

function previewImageFile(input) {
    const imageGroup = input.closest('.image-input-group');
    const preview = imageGroup.querySelector('.image-preview');
    const file = input.files[0];
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<i class="mdi mdi-image-outline text-muted"></i>';
    }
    
    updateImagesHiddenField();
}

function previewImage(input) {
    // Legacy function for backward compatibility - now redirects to file preview
    previewImageFile(input);
}

function isValidImageUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

function updateImageIndices() {
    const container = document.getElementById('imageContainer');
    const imageGroups = container.querySelectorAll('.image-input-group');
    
    imageGroups.forEach((group, index) => {
        group.setAttribute('data-index', index);
        
        // Update primary badge
        const existingBadge = group.querySelector('.badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        if (index === 0) {
            const buttonContainer = group.querySelector('.d-flex');
            const primaryBadge = document.createElement('span');
            primaryBadge.className = 'badge bg-primary me-1';
            primaryBadge.textContent = 'Primary';
            buttonContainer.insertBefore(primaryBadge, buttonContainer.firstChild);
        }
    });
}

function updateImagesHiddenField() {
    // For file uploads, we need to collect the actual image paths
    const fileInputs = document.querySelectorAll('.image-file');
    const existingImages = document.querySelectorAll('input[name="existing_images[]"]');
    
    // Collect existing image paths
    let imagePaths = [];
    existingImages.forEach(input => {
        if (input.value.trim()) {
            imagePaths.push(input.value.trim());
        }
    });
    
    // Note: New file uploads will be handled by PHP, we just need to preserve existing images
    // The hidden field should contain existing image paths, not file upload status
    const hiddenField = document.getElementById('images');
    if (hiddenField) {
        hiddenField.value = imagePaths.join(',');
    }
}

// Form submission handler
document.addEventListener('submit', function(e) {
    if (e.target.tagName === 'FORM') {
        updateImagesHiddenField();
    }
});

// Reset form function
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
        document.querySelector('form').reset();
        
        // Reset image previews
        const previews = document.querySelectorAll('.image-preview');
        previews.forEach(preview => {
            preview.innerHTML = '<i class="mdi mdi-image-outline text-muted"></i>';
        });
        
        // Reset subcategory dropdown
        const subcategorySelect = document.getElementById('subcategory');
        if (subcategorySelect) {
            subcategorySelect.innerHTML = '<option value="">Select Sub-Category (Optional)</option>';
        }
        
        updateImagesHiddenField();
    }
}
</script>