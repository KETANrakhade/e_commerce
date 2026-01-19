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

// Get products data from Node.js backend API only
$currentPage = $_GET['p'] ?? 1; // Use 'p' parameter for pagination to avoid conflict with main 'page' parameter
$search = $_GET['search'] ?? '';
$category = $_GET['category'] ?? '';
$status = $_GET['status'] ?? '';

// Debug: Log the current action and request method
error_log('Current action: ' . $action);
error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
error_log('POST data: ' . json_encode($_POST));
error_log('Category filter: ' . $category);
error_log('Status filter: ' . $status);
error_log('Search filter: ' . $search);

// Enhanced debugging for category filter
if (!empty($category)) {
    error_log('Category filter is set: ' . $category);
    error_log('Category filter length: ' . strlen($category));
    error_log('Category filter is valid ObjectId: ' . (preg_match('/^[a-f0-9]{24}$/i', $category) ? 'YES' : 'NO'));
    
    // Additional debugging: check if this category exists in our categories list
    if (isset($productsData['data']['categories'])) {
        $categoryExists = false;
        foreach ($productsData['data']['categories'] as $cat) {
            if (($cat['_id'] ?? '') === $category) {
                $categoryExists = true;
                error_log('Category filter matches existing category: ' . ($cat['name'] ?? 'Unknown'));
                break;
            }
        }
        if (!$categoryExists) {
            error_log('Category filter does NOT match any existing category');
        }
    }
} else {
    error_log('Category filter is empty or not set');
}

$queryParams = http_build_query([
    'page' => $currentPage,
    'limit' => 10,
    'search' => $search,
    'category' => $category,
    'status' => $status
]);

// Include API client
require_once __DIR__ . '/../config/api_client.php';

// Fetch products from API with retry logic for better reliability
$apiClient = getApiClient();
$productsData = null;
$maxRetries = 3;
$retryCount = 0;

// Debug: Log the API parameters being sent
$apiParams = [
    'page' => $currentPage,
    'limit' => 10,
    'search' => $search,
    'category' => $category,
    'status' => $status,
    '_t' => time() // Cache busting parameter
];
error_log('API Parameters being sent: ' . json_encode($apiParams));

while ($retryCount < $maxRetries && (!$productsData || !$productsData['success'])) {
    $productsData = $apiClient->getAdminProducts($apiParams);
    
    // Debug: Log the API response
    if ($productsData) {
        error_log('API Response success: ' . ($productsData['success'] ? 'true' : 'false'));
        if (!$productsData['success'] && isset($productsData['error'])) {
            error_log('API Response error: ' . $productsData['error']);
        }
        if (isset($productsData['data']['products'])) {
            error_log('API Response products count: ' . count($productsData['data']['products']));
        }
    }
    
    if (!$productsData || !$productsData['success']) {
        $retryCount++;
        if ($retryCount < $maxRetries) {
            // Small delay before retry
            usleep(200000); // 200ms
        }
    }
}

// Debug pagination data
error_log('Pagination debug - Current page: ' . $currentPage);
error_log('Pagination debug - API success: ' . ($productsData['success'] ? 'true' : 'false'));
if (isset($productsData['data']['pagination'])) {
    error_log('Pagination debug - Pagination info: ' . json_encode($productsData['data']['pagination']));
}

// Debug categories data
if (isset($productsData['data']['categories'])) {
    error_log('Categories debug - Categories count: ' . count($productsData['data']['categories']));
    error_log('Categories debug - Categories: ' . json_encode(array_map(function($cat) {
        return ['id' => $cat['_id'] ?? 'no-id', 'name' => $cat['name'] ?? 'no-name'];
    }, $productsData['data']['categories'])));
} else {
    error_log('Categories debug - No categories in API response');
}

// Debug products data structure
if (isset($productsData['data']['products']) && !empty($productsData['data']['products'])) {
    $firstProduct = $productsData['data']['products'][0];
    error_log('First product debug - Name: ' . ($firstProduct['name'] ?? 'no-name'));
    error_log('First product debug - Images: ' . json_encode($firstProduct['images'] ?? []));
    error_log('First product debug - Image URLs: ' . json_encode($firstProduct['imageUrls'] ?? []));
}

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
        
        // Handle images - process file uploads with comprehensive debugging
        $uploadedImages = [];
        
        // Debug: Log all upload data
        error_log("UPLOAD DEBUG - FILES array: " . print_r($_FILES, true));
        error_log("UPLOAD DEBUG - POST data keys: " . implode(', ', array_keys($_POST)));
        
        if (!empty($_FILES['image_files']['name'][0])) {
            error_log("UPLOAD DEBUG - Processing " . count($_FILES['image_files']['name']) . " files");
            
            // Process uploaded files
            for ($i = 0; $i < count($_FILES['image_files']['name']); $i++) {
                $fileName = $_FILES['image_files']['name'][$i];
                $errorCode = $_FILES['image_files']['error'][$i];
                
                error_log("UPLOAD DEBUG - File $i: $fileName (error: $errorCode)");
                
                if ($errorCode === UPLOAD_ERR_OK) {
                    $tmpName = $_FILES['image_files']['tmp_name'][$i];
                    $fileSize = $_FILES['image_files']['size'][$i];
                    $fileType = $_FILES['image_files']['type'][$i];
                    
                    error_log("UPLOAD DEBUG - File details: Size=$fileSize, Type=$fileType, Temp=$tmpName");
                    
                    // Validate file type
                    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
                    if (!in_array($fileType, $allowedTypes)) {
                        $error = 'Invalid file type. Only JPG, PNG, WebP, and GIF images are allowed.';
                        error_log("UPLOAD DEBUG - Invalid file type: $fileType");
                        break;
                    }
                    
                    // Validate file size (2MB max based on PHP config)
                    if ($fileSize > 2 * 1024 * 1024) {
                        $error = 'File size too large. Maximum 2MB per image.';
                        error_log("UPLOAD DEBUG - File too large: $fileSize bytes");
                        break;
                    }
                    
                    // Generate unique filename
                    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
                    $uniqueName = 'product_' . time() . '_' . $i . '.' . $extension;
                    $uploadPath = __DIR__ . '/../../uploads/products/' . $uniqueName;
                    
                    error_log("UPLOAD DEBUG - Target path: $uploadPath");
                    
                    // Create upload directory if it doesn't exist
                    $uploadDir = dirname($uploadPath);
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                        error_log("UPLOAD DEBUG - Created directory: $uploadDir");
                    }
                    
                    // Move uploaded file
                    if (move_uploaded_file($tmpName, $uploadPath)) {
                        // Store relative path for database (accessible from frontend root)
                        $uploadedImages[] = 'uploads/products/' . $uniqueName;
                        error_log("UPLOAD DEBUG - SUCCESS: Uploaded uploads/products/$uniqueName");
                    } else {
                        $error = 'Failed to upload image: ' . $fileName;
                        error_log("UPLOAD DEBUG - FAILED: Could not move $tmpName to $uploadPath");
                        break;
                    }
                } else {
                    $errorMessages = [
                        UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
                        UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
                        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                        UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
                    ];
                    error_log("UPLOAD DEBUG - Upload error for file $i: " . ($errorMessages[$errorCode] ?? "Unknown error ($errorCode)"));
                }
            }
        } else {
            error_log("UPLOAD DEBUG - No files received or first file name is empty");
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
        $validationErrors = [];
        
        // Product name validation
        if (empty($productData['name'])) {
            $validationErrors[] = 'Product name is required';
        } elseif (strlen(trim($productData['name'])) < 2) {
            $validationErrors[] = 'Product name must be at least 2 characters long';
        } elseif (strlen(trim($productData['name'])) > 100) {
            $validationErrors[] = 'Product name must be less than 100 characters';
        } elseif (!preg_match('/^[a-zA-Z0-9\s\-\.\,\(\)&]+$/', trim($productData['name']))) {
            $validationErrors[] = 'Product name contains invalid characters';
        }
        
        // Price validation
        if ($productData['price'] <= 0) {
            $validationErrors[] = 'Product price must be greater than 0';
        } elseif ($productData['price'] > 999999) {
            $validationErrors[] = 'Product price cannot exceed ₹999,999';
        }
        
        // Stock validation
        if ($productData['stock'] < 0) {
            $validationErrors[] = 'Stock quantity cannot be negative';
        } elseif ($productData['stock'] > 99999) {
            $validationErrors[] = 'Stock quantity cannot exceed 99,999';
        }
        
        // Category validation
        if (empty($productData['category'])) {
            $validationErrors[] = 'Product category is required';
        }
        
        // Description validation
        if (empty(trim($productData['description'] ?? ''))) {
            $validationErrors[] = 'Product description is required';
        } elseif (strlen(trim($productData['description'])) < 10) {
            $validationErrors[] = 'Product description must be at least 10 characters long';
        } elseif (strlen(trim($productData['description'])) > 2000) {
            $validationErrors[] = 'Product description must be less than 2000 characters';
        }
        
        // Brand validation (optional but if provided, must be valid)
        if (!empty($productData['brand'])) {
            if (strlen(trim($productData['brand'])) > 50) {
                $validationErrors[] = 'Brand name must be less than 50 characters';
            } elseif (!preg_match('/^[a-zA-Z0-9\s\-\.\&]+$/', trim($productData['brand']))) {
                $validationErrors[] = 'Brand name contains invalid characters';
            }
        }
        
        // Image validation with debugging
        $hasImages = false;
        if (!empty($allImages)) {
            $hasImages = true;
        }
        
        // Log for debugging
        error_log("UPLOAD DEBUG - Uploaded images: " . print_r($uploadedImages, true));
        error_log("UPLOAD DEBUG - All images: " . print_r($allImages, true));
        error_log("UPLOAD DEBUG - Has images: " . ($hasImages ? 'YES' : 'NO'));
        
        if (!$hasImages) {
            $validationErrors[] = 'At least one product image is required';
        }
        
        // If there are validation errors, show them
        if (!empty($validationErrors)) {
            $error = 'Validation failed:<br>• ' . implode('<br>• ', $validationErrors);
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
            
            // Add a small delay to ensure database consistency
            usleep(100000); // 100ms
            
            // Use JavaScript redirect for better handling
            echo '<script>
                setTimeout(function() {
                    window.location.href = "index.php?page=products&refresh=' . time() . '";
                }, 500);
            </script>';
            echo '<noscript><meta http-equiv="refresh" content="1;url=index.php?page=products"></noscript>';
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
        
        // Server-side validation for update
        $validationErrors = [];
        
        // Product name validation
        if (empty($productData['name'])) {
            $validationErrors[] = 'Product name is required';
        } elseif (strlen($productData['name']) < 2) {
            $validationErrors[] = 'Product name must be at least 2 characters long';
        } elseif (strlen($productData['name']) > 100) {
            $validationErrors[] = 'Product name must be less than 100 characters';
        } elseif (!preg_match('/^[a-zA-Z0-9\s\-\.\,\(\)&]+$/', $productData['name'])) {
            $validationErrors[] = 'Product name contains invalid characters';
        }
        
        // Price validation
        if ($productData['price'] <= 0) {
            $validationErrors[] = 'Product price must be greater than 0';
        } elseif ($productData['price'] > 999999) {
            $validationErrors[] = 'Product price cannot exceed ₹999,999';
        }
        
        // Stock validation
        if ($productData['stock'] < 0) {
            $validationErrors[] = 'Stock quantity cannot be negative';
        } elseif ($productData['stock'] > 99999) {
            $validationErrors[] = 'Stock quantity cannot exceed 99,999';
        }
        
        // Category validation
        if (empty($productData['category'])) {
            $validationErrors[] = 'Product category is required';
        }
        
        // Description validation
        if (empty($productData['description'])) {
            $validationErrors[] = 'Product description is required';
        } elseif (strlen($productData['description']) < 10) {
            $validationErrors[] = 'Product description must be at least 10 characters long';
        } elseif (strlen($productData['description']) > 2000) {
            $validationErrors[] = 'Product description must be less than 2000 characters';
        }
        
        // Brand validation (optional)
        if (!empty($productData['brand'])) {
            if (strlen($productData['brand']) > 50) {
                $validationErrors[] = 'Brand name must be less than 50 characters';
            } elseif (!preg_match('/^[a-zA-Z0-9\s\-\.\&]+$/', $productData['brand'])) {
                $validationErrors[] = 'Brand name contains invalid characters';
            }
        }
        
        // If there are validation errors, show them
        if (!empty($validationErrors)) {
            $error = 'Validation failed:<br>• ' . implode('<br>• ', $validationErrors);
        }
        
        // Only proceed if no upload errors occurred and validation passed
        if (!isset($error)) {
            $result = $apiClient->updateProduct($productId, $productData);
            if ($result['success']) {
                // Set session success message for simple popup
                $_SESSION['product_success'] = 'Product updated successfully!';
                $_SESSION['product_success_type'] = 'update';
                
                // Add a small delay to ensure database consistency
                usleep(100000); // 100ms
                
                // Use JavaScript redirect for better handling
                echo '<script>
                    setTimeout(function() {
                        window.location.href = "index.php?page=products&refresh=' . time() . '";
                    }, 500);
                </script>';
                echo '<noscript><meta http-equiv="refresh" content="1;url=index.php?page=products"></noscript>';
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
            
            // Add a small delay to ensure database consistency
            usleep(100000); // 100ms
            
            // Use JavaScript redirect for better handling
            echo '<script>
                setTimeout(function() {
                    window.location.href = "index.php?page=products&refresh=' . time() . '";
                }, 500);
            </script>';
            echo '<noscript><meta http-equiv="refresh" content="1;url=index.php?page=products"></noscript>';
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
    
    // Debug: Log the API response
    error_log("Product API Response for ID $productId: " . print_r($productResult, true));
    
    if ($productResult['success']) {
        // API client already extracts: { success: true, data: product }
        $product = $productResult['data'] ?? null;
        
        if ($product) {
            error_log("Product data loaded successfully: " . $product['name']);
        } else {
            error_log("No product data found in successful response");
        }
    } else {
        error_log("Product API call failed: " . ($productResult['error'] ?? 'Unknown error'));
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
                
                <!-- CSS for product images -->
                <style>
                .product-thumbnail {
                    transition: opacity 0.3s ease;
                    opacity: 0.8;
                }
                .product-thumbnail:hover {
                    opacity: 1;
                    transform: scale(1.05);
                    transition: all 0.2s ease;
                }
                .avatar-sm {
                    min-width: 40px;
                    min-height: 40px;
                }
                </style>
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
                                            <?php if (!empty($category) || !empty($search) || !empty($status)): ?>
                                                <span class="badge bg-info me-2">
                                                    <i class="mdi mdi-filter"></i> Filters Active
                                                </span>
                                            <?php endif; ?>
                                            <button type="button" class="btn btn-success btn-rounded waves-effect waves-light mb-2 me-2" onclick="window.location.href='index.php?page=products&action=create'">
                                                <i class="mdi mdi-plus me-1"></i> Add Product
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Filters -->
                                <div class="row mb-3">
                                    <div class="col-md-3">
                                        <label for="categoryFilter" class="form-label">Filter by Category</label>
                                        <select class="form-select" id="categoryFilter">
                                            <option value="">All Categories</option>
                                            <?php if (!empty($products['categories'])): ?>
                                                <?php foreach ($products['categories'] as $cat): ?>
                                                    <?php 
                                                    $catName = is_array($cat) ? ($cat['name'] ?? 'Unknown') : $cat;
                                                    $catId = is_array($cat) ? ($cat['_id'] ?? '') : $cat;
                                                    // Check both ID and name for selection
                                                    $isSelected = ($category === $catId) || ($category === $catName);
                                                    ?>
                                                    <option value="<?php echo htmlspecialchars($catId); ?>" 
                                                            <?php echo $isSelected ? 'selected' : ''; ?>>
                                                        <?php echo htmlspecialchars($catName); ?>
                                                    </option>
                                                <?php endforeach; ?>
                                            <?php else: ?>
                                                <option value="" disabled>No categories available</option>
                                            <?php endif; ?>
                                        </select>
                                        <?php if (!empty($products['categories'])): ?>
                                            <small class="text-muted">
                                                <?php echo count($products['categories']); ?> categories loaded
                                            </small>
                                        <?php else: ?>
                                            <small class="text-warning">
                                                <i class="mdi mdi-alert"></i> No categories found
                                            </small>
                                        <?php endif; ?>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="statusFilter" class="form-label">Filter by Status</label>
                                        <select class="form-select" id="statusFilter">
                                            <option value="">All Status</option>
                                            <option value="active" <?php echo $status === 'active' ? 'selected' : ''; ?>>Active</option>
                                            <option value="inactive" <?php echo $status === 'inactive' ? 'selected' : ''; ?>>Inactive</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">&nbsp;</label>
                                        <div>
                                            <button type="button" class="btn btn-primary" onclick="applyFilters()">
                                                <i class="mdi mdi-filter me-1"></i> Apply Filters
                                            </button>
                                            <button type="button" class="btn btn-secondary" onclick="clearFilters()">
                                                <i class="mdi mdi-filter-remove me-1"></i> Clear
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Debug Info</label>
                                        <div>
                                            <small class="text-muted">
                                                Current filter: <?php echo $category ? htmlspecialchars($category) : 'None'; ?>
                                            </small>
                                            <?php if (!empty($category)): ?>
                                                <br><small class="text-info">
                                                    <i class="mdi mdi-information-outline"></i> Filter active
                                                </small>
                                            <?php endif; ?>
                                            <?php if (!empty($search)): ?>
                                                <br><small class="text-info">
                                                    Search: "<?php echo htmlspecialchars($search); ?>"
                                                </small>
                                            <?php endif; ?>
                                            <?php if (!empty($status)): ?>
                                                <br><small class="text-info">
                                                    Status: <?php echo htmlspecialchars($status); ?>
                                                </small>
                                            <?php endif; ?>
                                        </div>
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
                                                                    <?php if (!empty($prod['images']) && is_array($prod['images']) && !empty($prod['images'][0])): ?>
                                                                        <?php 
                                                                        $imageData = $prod['images'][0];
                                                                        $imageUrl = '';
                                                                        
                                                                        // Handle different image data formats
                                                                        if (is_array($imageData)) {
                                                                            $imageUrl = $imageData['url'] ?? '';
                                                                        } else {
                                                                            $imageUrl = $imageData;
                                                                        }
                                                                        
                                                                        // Debug: Log the image URL
                                                                        error_log('Product image URL for ' . $prod['name'] . ': ' . $imageUrl);
                                                                        
                                                                        if (!empty($imageUrl)) {
                                                                            // Fix the image path - ensure it points to the correct location
                                                                            $imagePath = $imageUrl;
                                                                            
                                                                            // If the URL doesn't start with http/https, it's a local file
                                                                            if (!preg_match('/^https?:\/\//', $imageUrl)) {
                                                                                // Remove leading slash if present
                                                                                $cleanUrl = ltrim($imageUrl, '/');
                                                                                
                                                                                // Use the symlinked uploads directory
                                                                                $imagePath = 'uploads-root/' . str_replace('uploads/', '', $cleanUrl);
                                                                            }
                                                                            
                                                                            error_log('Resolved image path: ' . $imagePath);
                                                                        ?>
                                                                            <img src="<?php echo htmlspecialchars($imagePath); ?>" 
                                                                                 alt="<?php echo htmlspecialchars($prod['name']); ?>" 
                                                                                 class="img-fluid d-block"
                                                                                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"
                                                                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                                            <!-- <div class="avatar-sm bg-light d-flex align-items-center justify-content-center" style="display: none; width: 40px; height: 40px; border-radius: 4px;">
                                                                                <i class="bx bx-package font-size-16 text-muted"></i>
                                                                            </div> -->
                                                                        <?php } else { ?>
                                                                            <!-- <div class="avatar-sm bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; border-radius: 4px;">
                                                                                <i class="bx bx-package font-size-16 text-muted"></i>
                                                                            </div> -->
                                                                        <?php } ?>
                                                                    <?php elseif (!empty($prod['imageUrls']) && is_array($prod['imageUrls']) && !empty($prod['imageUrls'][0])): ?>
                                                                        <?php 
                                                                        // Fallback to imageUrls if images array is not available
                                                                        $imageUrl = $prod['imageUrls'][0];
                                                                        error_log('Product imageUrl (fallback) for ' . $prod['name'] . ': ' . $imageUrl);
                                                                        
                                                                        if (!empty($imageUrl)) {
                                                                            $imagePath = $imageUrl;
                                                                            if (!preg_match('/^https?:\/\//', $imageUrl)) {
                                                                                $cleanUrl = ltrim($imageUrl, '/');
                                                                                $imagePath = 'uploads-root/' . str_replace('uploads/', '', $cleanUrl);
                                                                            }
                                                                        ?>
                                                                            <img src="<?php echo htmlspecialchars($imagePath); ?>" 
                                                                                 alt="<?php echo htmlspecialchars($prod['name']); ?>" 
                                                                                 class="img-fluid d-block"
                                                                                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"
                                                                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                                            <!-- <div class="avatar-sm bg-light d-flex align-items-center justify-content-center" style="display: none; width: 40px; height: 40px; border-radius: 4px;">
                                                                                <i class="bx bx-package font-size-16 text-muted"></i>
                                                                            </div> -->
                                                                        <?php } else { ?>
                                                                            <!-- <div class="avatar-sm bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; border-radius: 4px;">
                                                                                <i class="bx bx-package font-size-16 text-muted"></i>
                                                                            </div> -->
                                                                        <?php } ?>
                                                                    <?php else: ?>
                                                                        <!-- <div class="avatar-sm bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; border-radius: 4px;">
                                                                            <i class="bx bx-package font-size-16 text-muted"></i>
                                                                        </div> -->
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
                                                                <a href="index.php?page=edit-product&id=<?php echo $prod['_id']; ?>" 
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
                <?php if ($action === 'edit' && $productId && !$product): ?>
                    <!-- Product Not Found for Edit -->
                    <div class="row">
                        <div class="col-12">
                            <div class="alert alert-danger" role="alert">
                                <h4 class="alert-heading">Product Not Found</h4>
                                <p>The product with ID "<?php echo htmlspecialchars($productId); ?>" could not be loaded for editing.</p>
                                <hr>
                                <p class="mb-0">
                                    <strong>Possible causes:</strong><br>
                                    • Product ID is invalid or doesn't exist<br>
                                    • Your admin session may have expired - try <a href="login.php" class="alert-link">logging in again</a><br>
                                    • Backend server connection issue<br>
                                    • Database connection problem
                                </p>
                                <div class="mt-3">
                                    <a href="index.php?page=products" class="btn btn-secondary">
                                        <i class="bx bx-arrow-back me-1"></i> Back to Products
                                    </a>
                                    <button type="button" class="btn btn-primary" onclick="window.location.reload()">
                                        <i class="bx bx-refresh me-1"></i> Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php else: ?>
                    <!-- Product Form -->
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <h4 class="card-title"><?php echo $action === 'create' ? 'Add New Product' : 'Edit Product'; ?></h4>
                                    <p class="card-title-desc">Fill all information below</p>

                                    <form method="POST" action="" enctype="multipart/form-data" id="productForm" novalidate>
                                        <input type="hidden" name="action" value="<?php echo $action === 'create' ? 'create' : 'update'; ?>">
                                    
                                    <div class="row">
                                        <div class="col-sm-6">
                                            <div class="mb-3">
                                                <label for="name" class="form-label">Product Name <span class="text-danger">*</span></label>
                                                <input id="name" name="name" type="text" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['name'] ?? ''); ?>" 
                                                       required minlength="2" maxlength="100"
                                                       pattern="[a-zA-Z0-9\s\-\.\,\(\)&]+"
                                                       title="Product name should be 2-100 characters and contain only letters, numbers, spaces, and basic punctuation">
                                                <div class="invalid-feedback">
                                                    Please provide a valid product name (2-100 characters, letters, numbers, and basic punctuation only).
                                                </div>
                                                <small class="text-muted">2-100 characters, letters, numbers, and basic punctuation allowed</small>
                                            </div>
                                            <div class="mb-3">
                                                <label for="price" class="form-label">Price (₹) <span class="text-danger">*</span></label>
                                                <input id="price" name="price" type="number" step="0.01" min="1" max="999999" class="form-control" 
                                                       value="<?php echo $product['price'] ?? ''; ?>" required>
                                                <div class="invalid-feedback">
                                                    Please provide a valid price between ₹1 and ₹999,999.
                                                </div>
                                                <small class="text-muted">Minimum ₹1, maximum ₹999,999</small>
                                            </div>
                                            <div class="mb-3">
                                                <label for="brand" class="form-label">Brand</label>
                                                <input id="brand" name="brand" type="text" class="form-control" 
                                                       value="<?php 
                                                       $brandValue = '';
                                                       if (isset($product['brand'])) {
                                                           if (is_array($product['brand'])) {
                                                               $brandValue = $product['brand']['name'] ?? '';
                                                           } else {
                                                               $brandValue = $product['brand'];
                                                           }
                                                       }
                                                       echo htmlspecialchars($brandValue); 
                                                       ?>"
                                                       maxlength="50"
                                                       pattern="[a-zA-Z0-9\s\-\.\&]+"
                                                       title="Brand name should contain only letters, numbers, spaces, hyphens, dots, and ampersands">
                                                <div class="invalid-feedback">
                                                    Brand name should be maximum 50 characters and contain only letters, numbers, spaces, and basic punctuation.
                                                </div>
                                                <small class="text-muted">Optional, maximum 50 characters</small>
                                            </div>
                                        </div>

                                        <div class="col-sm-6">
                                            <div class="mb-3">
                                                <label for="stock" class="form-label">Stock Quantity <span class="text-danger">*</span></label>
                                                <input id="stock" name="stock" type="number" min="0" max="99999" class="form-control" 
                                                       value="<?php echo $product['stock'] ?? '0'; ?>" required>
                                                <div class="invalid-feedback">
                                                    Please provide a valid stock quantity (0-99,999).
                                                </div>
                                                <small class="text-muted">0-99,999 items</small>
                                            </div>
                                            <div class="row">
                                                <div class="col-sm-6">
                                                    <div class="mb-3">
                                                        <label for="category" class="form-label">Category <span class="text-danger">*</span></label>
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
                                                        <div class="invalid-feedback">
                                                            Please select a category for this product.
                                                        </div>
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
                                                        <label for="subcategory" class="form-label">Sub-Category</label>
                                                        <select id="subcategory" name="subcategory" class="form-control">
                                                            <option value="">Select Sub-Category (Optional)</option>
                                                        </select>
                                                        <div class="invalid-feedback">
                                                            Please select a valid sub-category.
                                                        </div>
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
                                                /* Make form scrollable */
                                                .page-content {
                                                    max-height: calc(100vh - 100px);
                                                    overflow-y: auto;
                                                    overflow-x: hidden;
                                                }
                                                
                                                #productForm {
                                                    max-height: calc(100vh - 200px);
                                                    overflow-y: auto;
                                                    overflow-x: hidden;
                                                    padding-right: 15px;
                                                }
                                                
                                                /* Custom scrollbar */
                                                #productForm::-webkit-scrollbar {
                                                    width: 8px;
                                                }
                                                
                                                #productForm::-webkit-scrollbar-track {
                                                    background: #f1f1f1;
                                                    border-radius: 10px;
                                                }
                                                
                                                #productForm::-webkit-scrollbar-thumb {
                                                    background: #888;
                                                    border-radius: 10px;
                                                }
                                                
                                                #productForm::-webkit-scrollbar-thumb:hover {
                                                    background: #555;
                                                }
                                                
                                                .image-file {
                                                    cursor: pointer;
                                                    background-color: #fff !important;
                                                    color: #495057 !important;
                                                }
                                                .image-file::-webkit-file-upload-button {
                                                    background: #007bff !important;
                                                    color: white !important;
                                                    border: none;
                                                    padding: 8px 16px;
                                                    border-radius: 4px;
                                                    cursor: pointer;
                                                    margin-right: 10px;
                                                    transition: none !important;
                                                }
                                                .image-file::-webkit-file-upload-button:hover {
                                                    background: #007bff !important;
                                                    color: white !important;
                                                }
                                                .image-file::-moz-file-upload-button {
                                                    background: #007bff !important;
                                                    color: white !important;
                                                    border: none;
                                                    padding: 8px 16px;
                                                    border-radius: 4px;
                                                    cursor: pointer;
                                                    margin-right: 10px;
                                                    transition: none !important;
                                                }
                                                .image-file::-moz-file-upload-button:hover {
                                                    background: #007bff !important;
                                                    color: white !important;
                                                }
                                                .image-file::file-selector-button {
                                                    background: #007bff !important;
                                                    color: white !important;
                                                    border: none;
                                                    padding: 8px 16px;
                                                    border-radius: 4px;
                                                    cursor: pointer;
                                                    margin-right: 10px;
                                                    transition: none !important;
                                                }
                                                .image-file::file-selector-button:hover {
                                                    background: #007bff !important;
                                                    color: white !important;
                                                }
                                                .image-preview {
                                                    transition: all 0.3s ease;
                                                    border: 2px dashed #ddd;
                                                    border-radius: 8px;
                                                    background: #f8f9fa;
                                                }
                                                .image-preview:hover {
                                                    border-color: #007bff !important;
                                                    background: #e3f2fd;
                                                }
                                                .image-file:focus {
                                                    background-color: #fff !important;
                                                    color: #495057 !important;
                                                    border-color: #80bdff;
                                                    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
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
                                                    <label for="description" class="form-label">Detailed Description <span class="text-danger">*</span></label>
                                                    <textarea class="form-control" id="description" name="description" rows="6" 
                                                              placeholder="Enter detailed product description, features, specifications, etc."
                                                              required minlength="10" maxlength="2000"><?php echo htmlspecialchars($product['description'] ?? ''); ?></textarea>
                                                    <div class="invalid-feedback">
                                                        Please provide a detailed description (10-2000 characters).
                                                    </div>
                                                    <small class="text-muted">
                                                        <i class="mdi mdi-information-outline"></i> 
                                                        Provide a detailed description to help customers understand your product better (10-2000 characters).
                                                        <span id="descriptionCount" class="float-end">0/2000</span>
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
                                        <button type="submit" class="btn btn-primary waves-effect waves-light" id="submitBtn">
                                            <i class="mdi mdi-content-save me-1"></i>
                                            <?php echo $action === 'create' ? 'Create Product' : 'Update Product'; ?>
                                        </button>
                                        <button type="button" class="btn btn-secondary waves-effect waves-light" 
                                                onclick="window.location.href='index.php?page=products'">
                                            <i class="mdi mdi-arrow-left me-1"></i>Cancel
                                        </button>
                                        <button type="button" class="btn btn-outline-warning waves-effect waves-light" 
                                                onclick="resetForm()">
                                            <i class="mdi mdi-refresh me-1"></i>Reset Form
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
// Product management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Add floating submit button ONLY for EDIT form (not create)
    const productForm = document.getElementById('productForm');
    const isEditMode = window.location.href.includes('action=edit');
    
    if (productForm && isEditMode) {
        // Create floating button only for edit mode
        const floatingBtn = document.createElement('button');
        floatingBtn.type = 'submit';
        floatingBtn.className = 'btn btn-success btn-lg waves-effect waves-light';
        floatingBtn.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 9999; border-radius: 50px; padding: 15px 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: bold;';
        floatingBtn.innerHTML = '<i class="mdi mdi-content-save me-2"></i>Update Product';
        floatingBtn.form = 'productForm'; // Associate with form
        
        // Add to body (not inside form to avoid any container restrictions)
        document.body.appendChild(floatingBtn);
        
        // Make sure it submits the form
        floatingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            productForm.requestSubmit(); // Use requestSubmit to trigger validation
        });
        
        console.log('Floating "Update Product" button added for EDIT mode!');
    }
    
    // Show loading state initially if no products are visible
    const tableBody = document.querySelector('tbody');
    const hasProducts = tableBody && tableBody.children.length > 0;
    
    if (!hasProducts) {
        showLoadingState();
        // Reload page after a short delay if no products are shown
        setTimeout(function() {
            const currentUrl = window.location.href;
            if (currentUrl.includes('page=products') && !currentUrl.includes('action=')) {
                // Only reload if we're on the products list page (not create/edit)
                window.location.reload();
            }
        }, 1000);
    }
    
    // Show simple success popup if it exists
    <?php if (!empty($sessionSuccess)): ?>
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Auto-hide after 3 seconds
        setTimeout(function() {
            successModal.hide();
        }, 3000);
    <?php endif; ?>
    
    // Initialize form validation
    initializeFormValidation();
    
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

// Form validation initialization
function initializeFormValidation() {
    const form = document.getElementById('productForm');
    if (!form) return;
    
    // Real-time validation for all inputs
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Clear invalid state on input
            this.classList.remove('is-invalid');
            
            // Real-time character count for description
            if (this.id === 'description') {
                updateDescriptionCount();
            }
            
            // Real-time validation for some fields
            if (this.type === 'number' || this.type === 'email') {
                validateField(this);
            }
        });
    });
    
    // Description character counter
    updateDescriptionCount();
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
        console.log('Form submission started');
        
        // Debug: Check file inputs
        const fileInputs = form.querySelectorAll('.image-file');
        console.log('Found file inputs:', fileInputs.length);
        
        fileInputs.forEach((input, index) => {
            console.log(`File input ${index}:`, input.files);
            if (input.files.length > 0) {
                for (let i = 0; i < input.files.length; i++) {
                    const file = input.files[i];
                    console.log(`  File ${i}: ${file.name}, Size: ${file.size} bytes (${(file.size/1024/1024).toFixed(2)} MB), Type: ${file.type}`);
                    
                    // Check if file is too large
                    if (file.size > 2 * 1024 * 1024) {
                        console.error(`File ${file.name} is too large: ${(file.size/1024/1024).toFixed(2)} MB (max 2MB)`);
                        alert(`File "${file.name}" is too large (${(file.size/1024/1024).toFixed(2)} MB). Please choose files under 2MB.`);
                        e.preventDefault();
                        return;
                    }
                }
            }
        });
        
        if (!validateForm()) {
            console.log('Form validation failed');
            e.preventDefault();
            e.stopPropagation();
            
            // Show error message
            showValidationError('Please fix the errors below before submitting.');
            
            // Focus on first invalid field
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            console.log('Form validation passed, submitting...');
            
            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="mdi mdi-loading mdi-spin me-1"></i>Creating Product...';
            }
        }
    });
}

// Validate individual field
function validateField(field) {
    let isValid = true;
    let errorMessage = '';
    
    // Check HTML5 validity first
    if (!field.checkValidity()) {
        isValid = false;
        errorMessage = field.validationMessage;
    }
    
    // Custom validations
    switch (field.id) {
        case 'name':
            if (field.value.trim().length < 2) {
                isValid = false;
                errorMessage = 'Product name must be at least 2 characters long.';
            } else if (field.value.trim().length > 100) {
                isValid = false;
                errorMessage = 'Product name must be less than 100 characters.';
            } else if (!/^[a-zA-Z0-9\s\-\.\,\(\)&]+$/.test(field.value.trim())) {
                isValid = false;
                errorMessage = 'Product name contains invalid characters.';
            }
            break;
            
        case 'price':
            const price = parseFloat(field.value);
            if (isNaN(price) || price < 1) {
                isValid = false;
                errorMessage = 'Price must be at least ₹1.';
            } else if (price > 999999) {
                isValid = false;
                errorMessage = 'Price cannot exceed ₹999,999.';
            }
            break;
            
        case 'stock':
            const stock = parseInt(field.value);
            if (isNaN(stock) || stock < 0) {
                isValid = false;
                errorMessage = 'Stock must be 0 or greater.';
            } else if (stock > 99999) {
                isValid = false;
                errorMessage = 'Stock cannot exceed 99,999.';
            }
            break;
            
        case 'brand':
            if (field.value.trim() && field.value.trim().length > 50) {
                isValid = false;
                errorMessage = 'Brand name must be less than 50 characters.';
            } else if (field.value.trim() && !/^[a-zA-Z0-9\s\-\.\&]+$/.test(field.value.trim())) {
                isValid = false;
                errorMessage = 'Brand name contains invalid characters.';
            }
            break;
            
        case 'description':
            if (field.value.trim().length < 10) {
                isValid = false;
                errorMessage = 'Description must be at least 10 characters long.';
            } else if (field.value.trim().length > 2000) {
                isValid = false;
                errorMessage = 'Description must be less than 2000 characters.';
            }
            break;
            
        case 'category':
            if (!field.value) {
                isValid = false;
                errorMessage = 'Please select a category.';
            }
            break;
    }
    
    // Update field state
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        
        // Update custom error message
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = errorMessage;
        }
    }
    
    return isValid;
}

// Validate entire form
function validateForm() {
    const form = document.getElementById('productForm');
    if (!form) return false;
    
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Validate at least one image
    const imageInputs = form.querySelectorAll('.image-file');
    const existingImages = form.querySelectorAll('input[name="existing_images[]"]');
    
    console.log('Image validation - Found inputs:', imageInputs.length);
    console.log('Image validation - Found existing:', existingImages.length);
    
    let hasImages = false;
    
    // Check for uploaded files
    imageInputs.forEach((input, index) => {
        console.log(`Checking input ${index}:`, input.files.length, 'files');
        if (input.files && input.files.length > 0) {
            hasImages = true;
            console.log('Found uploaded files:', input.files.length);
        }
    });
    
    // Check for existing images
    if (!hasImages) {
        existingImages.forEach((input, index) => {
            console.log(`Checking existing ${index}:`, input.value);
            if (input.value.trim()) {
                hasImages = true;
                console.log('Found existing image:', input.value);
            }
        });
    }
    
    console.log('Image validation - hasImages:', hasImages);
    
    // Add visible alert for debugging
    if (!hasImages) {
        alert('DEBUG: No images detected!\nFile inputs found: ' + imageInputs.length + '\nCheck console for details.');
    }
    
    if (!hasImages) {
        showValidationError('Please upload at least one product image.');
        isValid = false;
    }
    
    return isValid;
}

// Update description character count
function updateDescriptionCount() {
    const description = document.getElementById('description');
    const counter = document.getElementById('descriptionCount');
    
    if (description && counter) {
        const count = description.value.length;
        counter.textContent = `${count}/2000`;
        
        if (count > 2000) {
            counter.style.color = '#dc3545';
        } else if (count > 1800) {
            counter.style.color = '#ffc107';
        } else {
            counter.style.color = '#6c757d';
        }
    }
}

// Show validation error message
function showValidationError(message) {
    // Remove existing error alerts
    const existingAlerts = document.querySelectorAll('.validation-error-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new error alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show validation-error-alert';
    alert.innerHTML = `
        <i class="mdi mdi-alert-circle me-2"></i>
        <strong>Validation Error:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of form
    const form = document.getElementById('productForm');
    if (form) {
        form.insertBefore(alert, form.firstChild);
        alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    // Debug: Log the filter values
    console.log('Applying filters:', { search, category, status });
    
    // Additional debugging
    if (category) {
        console.log('Category selected:', category);
        console.log('Category length:', category.length);
        console.log('Category is valid ObjectId:', /^[a-f0-9]{24}$/i.test(category));
        
        // Get the selected option text for debugging
        const categorySelect = document.getElementById('categoryFilter');
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        console.log('Selected category name:', selectedOption.text);
    } else {
        console.log('No category selected');
    }
    
    const params = new URLSearchParams();
    params.append('page', 'products');
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    
    const url = '?' + params.toString();
    console.log('Redirecting to:', url);
    
    window.location.href = url;
}

function clearFilters() {
    window.location.href = '?page=products';
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
    if (confirm('⚠️ PERMANENT DELETE\n\nAre you sure you want to permanently delete this product?\n\nThis action CANNOT be undone!\n\nThe product will be completely removed from the database.')) {
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
        const form = document.querySelector('#productForm');
        if (form) {
            form.reset();
            
            // Clear validation states
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
            
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
            
            // Reset description counter
            updateDescriptionCount();
            
            // Remove any validation error alerts
            const errorAlerts = document.querySelectorAll('.validation-error-alert');
            errorAlerts.forEach(alert => alert.remove());
            
            // Reset submit button
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="mdi mdi-content-save me-1"></i><?php echo $action === 'create' ? 'Create Product' : 'Update Product'; ?>';
            }
            
            updateImagesHiddenField();
        }
    }
}

// Show loading state for products table
function showLoadingState() {
    const tableBody = document.querySelector('tbody');
    if (tableBody && tableBody.children.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="d-flex flex-column align-items-center">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <div class="text-muted">Loading products...</div>
                        <small class="text-muted mt-1">Please wait while we fetch your products</small>
                    </div>
                </td>
            </tr>
        `;
    }
}
</script>