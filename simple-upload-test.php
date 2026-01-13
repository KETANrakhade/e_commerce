<?php
// Simple upload test without authentication
echo "<h1>Simple Upload Test</h1>";

echo "<h2>PHP Configuration:</h2>";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "<br>";
echo "post_max_size: " . ini_get('post_max_size') . "<br>";
echo "max_file_uploads: " . ini_get('max_file_uploads') . "<br>";

if ($_POST) {
    echo "<h2>Upload Test Results:</h2>";
    echo "<h3>POST Data:</h3>";
    echo "<pre>" . print_r($_POST, true) . "</pre>";
    
    echo "<h3>FILES Data:</h3>";
    echo "<pre>" . print_r($_FILES, true) . "</pre>";
    
    if (empty($_FILES)) {
        echo "<p style='color: red;'><strong>❌ NO FILES RECEIVED!</strong></p>";
        echo "<p>This indicates a problem with:</p>";
        echo "<ul>";
        echo "<li>Form encoding (missing enctype='multipart/form-data')</li>";
        echo "<li>File size too large (over " . ini_get('upload_max_filesize') . ")</li>";
        echo "<li>POST size too large (over " . ini_get('post_max_size') . ")</li>";
        echo "<li>JavaScript preventing form submission</li>";
        echo "</ul>";
    } else {
        echo "<p style='color: green;'><strong>✅ FILES RECEIVED!</strong></p>";
    }
} else {
    echo "<form method='POST' enctype='multipart/form-data'>";
    echo "<p>Select 1-2 small image files (under 2MB each):</p>";
    echo "<input type='file' name='test_files[]' multiple accept='image/*' required>";
    echo "<br><br>";
    echo "<button type='submit'>Test Upload</button>";
    echo "</form>";
}
?>