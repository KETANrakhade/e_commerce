<?php
// Test image paths from admin panel
echo "<h1>Image Path Test</h1>";

// Test the symlinked path
$testImage = 'uploads-root/products/product_1768799574_0.jpg';
echo "<h3>Testing symlinked path: " . htmlspecialchars($testImage) . "</h3>";
echo "<img src='" . htmlspecialchars($testImage) . "' style='width: 100px; height: 100px; object-fit: cover; border: 1px solid #ccc; margin: 10px;' onerror=\"this.style.border='2px solid red'; this.alt='FAILED: " . htmlspecialchars($testImage) . "'\">";
echo "<br>";

// Check if file exists through symlink
$fullPath = __DIR__ . '/' . $testImage;
if (file_exists($fullPath)) {
    echo "✅ File exists at: " . $fullPath . "<br>";
} else {
    echo "❌ File NOT found at: " . $fullPath . "<br>";
}

// Test a few more images
$moreTestImages = [
    'uploads-root/products/product_1768290697_0.jpg',
    'uploads-root/products/product_1768290448_0.jpg',
    'uploads-root/products/product_1768284344_0.jpg'
];

foreach ($moreTestImages as $imagePath) {
    echo "<h4>Testing: " . htmlspecialchars($imagePath) . "</h4>";
    echo "<img src='" . htmlspecialchars($imagePath) . "' style='width: 80px; height: 80px; object-fit: cover; border: 1px solid #ccc; margin: 5px;' onerror=\"this.style.border='2px solid red'; this.alt='FAILED'\">";
    echo file_exists(__DIR__ . '/' . $imagePath) ? " ✅" : " ❌";
    echo "<br>";
}

echo "<hr>";
echo "<p><a href='index.php?page=products'>← Back to Products Page</a></p>";
?>