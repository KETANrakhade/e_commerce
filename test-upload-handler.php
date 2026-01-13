<?php
// Test upload handler to debug file upload issues
session_start();

// Set admin token for API calls
$_SESSION['admin_token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTQxYWQ0YzYxMmJiN2NlMDZlMjMxNyIsImlhdCI6MTc2ODIwMzkwNSwiZXhwIjoxNzcwNzk1OTA1fQ.0KwfDrXEAJMl-YlxupyK1vbrKl-hkO3--oV0OScR5ck';

echo "<h1>File Upload Test Results</h1>";

echo "<h2>📋 POST Data:</h2>";
echo "<pre>" . print_r($_POST, true) . "</pre>";

echo "<h2>📁 FILES Data:</h2>";
echo "<pre>" . print_r($_FILES, true) . "</pre>";

if ($_POST && isset($_POST['action']) && $_POST['action'] === 'create') {
    echo "<h2>🔄 Processing Upload...</h2>";
    
    // Prepare product data
    $productData = [
        'name' => trim($_POST['name'] ?? ''),
        'description' => trim($_POST['description'] ?? ''),
        'price' => max(0, floatval($_POST['price'] ?? 0)),
        'category' => trim($_POST['category'] ?? ''),
        'stock' => max(0, intval($_POST['stock'] ?? 0)),
        'isActive' => true,
        'featured' => false
    ];
    
    echo "<p><strong>Product Data:</strong></p>";
    echo "<pre>" . print_r($productData, true) . "</pre>";
    
    // Handle images - process file uploads
    $uploadedImages = [];
    $error = null;
    
    if (!empty($_FILES['image_files']['name'][0])) {
        echo "<p>✅ Files detected, processing " . count($_FILES['image_files']['name']) . " files...</p>";
        
        // Process uploaded files
        for ($i = 0; $i < count($_FILES['image_files']['name']); $i++) {
            echo "<p><strong>Processing file $i:</strong> " . $_FILES['image_files']['name'][$i] . "</p>";
            
            if ($_FILES['image_files']['error'][$i] === UPLOAD_ERR_OK) {
                $tmpName = $_FILES['image_files']['tmp_name'][$i];
                $fileName = $_FILES['image_files']['name'][$i];
                $fileSize = $_FILES['image_files']['size'][$i];
                $fileType = $_FILES['image_files']['type'][$i];
                
                echo "<ul>";
                echo "<li>Temp name: $tmpName</li>";
                echo "<li>File name: $fileName</li>";
                echo "<li>File size: " . number_format($fileSize) . " bytes</li>";
                echo "<li>File type: $fileType</li>";
                echo "</ul>";
                
                // Validate file type
                $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
                if (!in_array($fileType, $allowedTypes)) {
                    $error = 'Invalid file type. Only JPG, PNG, WebP, and GIF images are allowed.';
                    echo "<p>❌ <strong>Error:</strong> $error</p>";
                    break;
                }
                
                // Validate file size (2MB max based on PHP config)
                if ($fileSize > 2 * 1024 * 1024) {
                    $error = 'File size too large. Maximum 2MB per image.';
                    echo "<p>❌ <strong>Error:</strong> $error</p>";
                    break;
                }
                
                // Generate unique filename
                $extension = pathinfo($fileName, PATHINFO_EXTENSION);
                $uniqueName = 'test_product_' . time() . '_' . $i . '.' . $extension;
                $uploadPath = __DIR__ . '/uploads/products/' . $uniqueName;
                
                echo "<p>📁 Upload path: $uploadPath</p>";
                
                // Create upload directory if it doesn't exist
                $uploadDir = dirname($uploadPath);
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                    echo "<p>📂 Created upload directory: $uploadDir</p>";
                }
                
                // Move uploaded file
                if (move_uploaded_file($tmpName, $uploadPath)) {
                    // Store relative path for database (accessible from frontend root)
                    $uploadedImages[] = 'uploads/products/' . $uniqueName;
                    echo "<p>✅ Successfully uploaded: uploads/products/$uniqueName</p>";
                } else {
                    $error = 'Failed to upload image: ' . $fileName;
                    echo "<p>❌ <strong>Error:</strong> $error</p>";
                    break;
                }
            } else {
                $errorCode = $_FILES['image_files']['error'][$i];
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
                    UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
                    UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                    UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                    UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                    UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                    UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
                ];
                $errorMsg = $errorMessages[$errorCode] ?? "Unknown error ($errorCode)";
                echo "<p>❌ <strong>Upload Error:</strong> $errorMsg</p>";
            }
        }
    } else {
        echo "<p>❌ No files uploaded or first file name is empty</p>";
        $error = 'No files were uploaded';
    }
    
    echo "<h2>📊 Upload Summary:</h2>";
    echo "<p><strong>Uploaded Images:</strong> " . count($uploadedImages) . "</p>";
    echo "<pre>" . print_r($uploadedImages, true) . "</pre>";
    
    if (!empty($uploadedImages)) {
        $productData['images'] = $uploadedImages;
        
        echo "<h2>🚀 Sending to Backend API...</h2>";
        
        // Include API client
        require_once __DIR__ . '/pyramid-admin/config/api_client.php';
        $apiClient = getApiClient();
        
        // Create product via API
        $result = $apiClient->createProduct($productData);
        
        echo "<p><strong>API Response:</strong></p>";
        echo "<pre>" . print_r($result, true) . "</pre>";
        
        if ($result['success']) {
            echo "<p>✅ <strong>Success!</strong> Product created successfully!</p>";
        } else {
            echo "<p>❌ <strong>API Error:</strong> " . ($result['error'] ?? 'Unknown error') . "</p>";
        }
    } else {
        echo "<p>❌ <strong>Failed:</strong> No images were uploaded successfully</p>";
    }
    
} else {
    echo "<p>❌ No form data received</p>";
}

echo '<p><a href="test-upload.html">← Back to Test Form</a></p>';
?>