<?php
// Comprehensive Upload Debugging Tool
echo "<!DOCTYPE html><html><head><title>Upload Debug Tool</title>";
echo "<style>body{font-family:Arial,sans-serif;margin:20px;} .success{color:green;} .error{color:red;} .info{color:blue;} .section{border:1px solid #ccc;padding:15px;margin:10px 0;} pre{background:#f5f5f5;padding:10px;}</style>";
echo "</head><body>";

echo "<h1>🔧 E-Commerce Image Upload Debug Tool</h1>";

// Phase 1: System Configuration Check
echo "<div class='section'>";
echo "<h2>📋 Phase 1: System Configuration</h2>";
echo "<table border='1' cellpadding='5'>";
echo "<tr><td><strong>Setting</strong></td><td><strong>Value</strong></td><td><strong>Status</strong></td></tr>";

$configs = [
    'file_uploads' => ini_get('file_uploads'),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'max_file_uploads' => ini_get('max_file_uploads'),
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time')
];

foreach ($configs as $key => $value) {
    $status = "✅ OK";
    if ($key === 'file_uploads' && !$value) $status = "❌ DISABLED";
    if ($key === 'upload_max_filesize' && (int)$value < 2) $status = "⚠️ LOW";
    if ($key === 'post_max_size' && (int)$value < 8) $status = "⚠️ LOW";
    
    echo "<tr><td>$key</td><td>$value</td><td>$status</td></tr>";
}
echo "</table>";

// Directory Check
$uploadDir = __DIR__ . '/uploads/products/';
echo "<h3>📁 Upload Directory Status</h3>";
echo "<ul>";
echo "<li>Path: <code>$uploadDir</code></li>";
echo "<li>Exists: " . (is_dir($uploadDir) ? "✅ Yes" : "❌ No") . "</li>";
echo "<li>Writable: " . (is_writable($uploadDir) ? "✅ Yes" : "❌ No") . "</li>";
echo "<li>Files count: " . count(glob($uploadDir . "*")) . "</li>";
echo "</ul>";
echo "</div>";

// Phase 2: Upload Test
if ($_POST) {
    echo "<div class='section'>";
    echo "<h2>🧪 Phase 2: Upload Test Results</h2>";
    
    echo "<h3>Request Information</h3>";
    echo "<ul>";
    echo "<li>Method: " . $_SERVER['REQUEST_METHOD'] . "</li>";
    echo "<li>Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'Not set') . "</li>";
    echo "<li>Content-Length: " . ($_SERVER['CONTENT_LENGTH'] ?? 'Not set') . " bytes</li>";
    echo "</ul>";
    
    echo "<h3>POST Data</h3>";
    echo "<pre>" . print_r($_POST, true) . "</pre>";
    
    echo "<h3>FILES Data</h3>";
    echo "<pre>" . print_r($_FILES, true) . "</pre>";
    
    if (!empty($_FILES['test_images']['name'][0])) {
        echo "<h3>File Processing</h3>";
        
        for ($i = 0; $i < count($_FILES['test_images']['name']); $i++) {
            echo "<div style='border:1px solid #ddd;padding:10px;margin:5px 0;'>";
            echo "<h4>File " . ($i + 1) . ": " . htmlspecialchars($_FILES['test_images']['name'][$i]) . "</h4>";
            
            $error = $_FILES['test_images']['error'][$i];
            $size = $_FILES['test_images']['size'][$i];
            $type = $_FILES['test_images']['type'][$i];
            $tmpName = $_FILES['test_images']['tmp_name'][$i];
            
            $errorMessages = [
                UPLOAD_ERR_OK => "✅ No error",
                UPLOAD_ERR_INI_SIZE => "❌ File exceeds upload_max_filesize",
                UPLOAD_ERR_FORM_SIZE => "❌ File exceeds MAX_FILE_SIZE",
                UPLOAD_ERR_PARTIAL => "❌ File partially uploaded",
                UPLOAD_ERR_NO_FILE => "❌ No file uploaded",
                UPLOAD_ERR_NO_TMP_DIR => "❌ Missing temp directory",
                UPLOAD_ERR_CANT_WRITE => "❌ Cannot write to disk",
                UPLOAD_ERR_EXTENSION => "❌ Upload stopped by extension"
            ];
            
            echo "<ul>";
            echo "<li>Error: " . ($errorMessages[$error] ?? "Unknown error ($error)") . "</li>";
            echo "<li>Size: " . number_format($size) . " bytes (" . round($size/1024/1024, 2) . " MB)</li>";
            echo "<li>Type: $type</li>";
            echo "<li>Temp file exists: " . (file_exists($tmpName) ? "✅ Yes" : "❌ No") . "</li>";
            echo "</ul>";
            
            if ($error === UPLOAD_ERR_OK) {
                // Test upload
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                $extension = pathinfo($_FILES['test_images']['name'][$i], PATHINFO_EXTENSION);
                $newName = 'debug_' . time() . '_' . $i . '.' . $extension;
                $targetPath = $uploadDir . $newName;
                
                if (move_uploaded_file($tmpName, $targetPath)) {
                    echo "<div class='success'>✅ <strong>SUCCESS!</strong> File uploaded to: uploads/products/$newName</div>";
                    echo "<div class='info'>File size on disk: " . number_format(filesize($targetPath)) . " bytes</div>";
                } else {
                    echo "<div class='error'>❌ <strong>FAILED!</strong> Could not move uploaded file</div>";
                }
            }
            echo "</div>";
        }
    } else {
        echo "<div class='error'>";
        echo "<h3>❌ No Files Received!</h3>";
        echo "<p>Possible causes:</p>";
        echo "<ul>";
        echo "<li>Files too large (over " . ini_get('upload_max_filesize') . ")</li>";
        echo "<li>Form encoding incorrect</li>";
        echo "<li>JavaScript interference</li>";
        echo "<li>Server configuration issue</li>";
        echo "</ul>";
        echo "</div>";
    }
    echo "</div>";
} else {
    // Show upload form
    echo "<div class='section'>";
    echo "<h2>🧪 Phase 2: Upload Test</h2>";
    echo "<form method='POST' enctype='multipart/form-data'>";
    echo "<p><strong>Select 1-3 image files to test upload:</strong></p>";
    echo "<p><em>Keep files under " . ini_get('upload_max_filesize') . " each</em></p>";
    echo "<input type='file' name='test_images[]' multiple accept='image/*' required style='padding:10px;border:1px solid #ccc;'>";
    echo "<br><br>";
    echo "<button type='submit' style='padding:10px 20px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;'>Test Upload</button>";
    echo "</form>";
    echo "</div>";
}

echo "</body></html>";
?>