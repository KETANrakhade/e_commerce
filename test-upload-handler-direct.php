<?php
// Direct upload test handler
echo "<h1>Upload Test Results</h1>";

echo "<h2>PHP Configuration:</h2>";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "<br>";
echo "post_max_size: " . ini_get('post_max_size') . "<br>";
echo "max_file_uploads: " . ini_get('max_file_uploads') . "<br>";

echo "<h2>Request Info:</h2>";
echo "Method: " . $_SERVER['REQUEST_METHOD'] . "<br>";
echo "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'Not set') . "<br>";
echo "Content-Length: " . ($_SERVER['CONTENT_LENGTH'] ?? 'Not set') . " bytes<br>";

echo "<h2>POST Data:</h2>";
echo "<pre>" . print_r($_POST, true) . "</pre>";

echo "<h2>FILES Data:</h2>";
echo "<pre>" . print_r($_FILES, true) . "</pre>";

if (empty($_FILES)) {
    echo "<div style='color: red; font-weight: bold; padding: 10px; border: 2px solid red;'>";
    echo "❌ NO FILES RECEIVED!<br>";
    echo "This means:<br>";
    echo "• Files are too large (over " . ini_get('upload_max_filesize') . ")<br>";
    echo "• Form encoding is wrong<br>";
    echo "• Server configuration issue<br>";
    echo "</div>";
} else {
    echo "<div style='color: green; font-weight: bold; padding: 10px; border: 2px solid green;'>";
    echo "✅ FILES RECEIVED!<br>";
    echo "File upload mechanism is working.<br>";
    echo "</div>";
    
    // Test actual upload
    if (!empty($_FILES['test_images']['name'][0])) {
        echo "<h3>File Processing Test:</h3>";
        
        for ($i = 0; $i < count($_FILES['test_images']['name']); $i++) {
            $name = $_FILES['test_images']['name'][$i];
            $error = $_FILES['test_images']['error'][$i];
            $size = $_FILES['test_images']['size'][$i];
            $type = $_FILES['test_images']['type'][$i];
            
            echo "<div style='border: 1px solid #ccc; padding: 10px; margin: 5px 0;'>";
            echo "<strong>File " . ($i + 1) . ":</strong> $name<br>";
            echo "Size: " . number_format($size) . " bytes (" . round($size/1024/1024, 2) . " MB)<br>";
            echo "Type: $type<br>";
            echo "Error: $error ";
            
            if ($error === UPLOAD_ERR_OK) {
                echo "(✅ OK)<br>";
                
                // Try to move file
                $uploadDir = __DIR__ . '/uploads/products/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                $newName = 'test_' . time() . '_' . $i . '_' . $name;
                $targetPath = $uploadDir . $newName;
                
                if (move_uploaded_file($_FILES['test_images']['tmp_name'][$i], $targetPath)) {
                    echo "✅ Successfully saved to: uploads/products/$newName<br>";
                } else {
                    echo "❌ Failed to save file<br>";
                }
            } else {
                $errors = [
                    UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
                    UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
                    UPLOAD_ERR_PARTIAL => 'File partially uploaded',
                    UPLOAD_ERR_NO_FILE => 'No file uploaded',
                    UPLOAD_ERR_NO_TMP_DIR => 'Missing temp directory',
                    UPLOAD_ERR_CANT_WRITE => 'Cannot write to disk',
                    UPLOAD_ERR_EXTENSION => 'Upload stopped by extension'
                ];
                echo "(❌ " . ($errors[$error] ?? 'Unknown error') . ")<br>";
            }
            echo "</div>";
        }
    }
}

echo "<br><a href='test-upload-direct.html'>← Back to Test</a>";
?>