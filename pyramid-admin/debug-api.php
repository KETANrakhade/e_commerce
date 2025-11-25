<?php
session_start();

echo "<h1>Pyramid Admin - API Debug</h1>";

echo "<h2>Session Info:</h2>";
echo "<pre>";
echo "Session Status: " . session_status() . "\n";
echo "Admin Logged In: " . (isset($_SESSION['admin_logged_in']) ? 'YES' : 'NO') . "\n";
echo "Admin Token: " . (isset($_SESSION['admin_token']) ? substr($_SESSION['admin_token'], 0, 20) . '...' : 'NOT SET') . "\n";
echo "Admin Email: " . ($_SESSION['admin_email'] ?? 'NOT SET') . "\n";
echo "Admin Name: " . ($_SESSION['admin_name'] ?? 'NOT SET') . "\n";
echo "</pre>";

echo "<h2>Test Backend Connection:</h2>";

// Test products endpoint (no auth needed)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:5001/api/products');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<h3>Products API (No Auth):</h3>";
echo "Status: " . $httpCode . "<br>";
echo "Response: <pre>" . substr($response, 0, 200) . "...</pre>";

// Test admin stats endpoint (needs auth)
if (isset($_SESSION['admin_token'])) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:5001/api/admin/stats');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $_SESSION['admin_token']
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "<h3>Admin Stats API (With Auth):</h3>";
    echo "Status: " . $httpCode . "<br>";
    echo "Response: <pre>" . $response . "</pre>";
} else {
    echo "<h3>Admin Stats API:</h3>";
    echo "<p style='color: red;'>Cannot test - No admin token in session. Please login first.</p>";
}

echo "<hr>";
echo "<a href='login.php'>Go to Login</a> | ";
echo "<a href='index.php'>Go to Dashboard</a>";
?>
