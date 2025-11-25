<?php
// Test login API directly
$email = 'admin@admin.com';
$password = 'admin123';

echo "<h1>Testing Admin Login</h1>";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:5001/api/admin/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $email, 'password' => $password]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<h2>Response:</h2>";
echo "<p>HTTP Code: " . $httpCode . "</p>";
echo "<pre>" . print_r(json_decode($response, true), true) . "</pre>";

$data = json_decode($response, true);

if ($data && isset($data['success']) && $data['success']) {
    echo "<h2 style='color: green;'>✅ Login Successful!</h2>";
    
    if (isset($data['data']['token'])) {
        echo "<p><strong>Token:</strong> " . substr($data['data']['token'], 0, 50) . "...</p>";
        echo "<p><strong>Name:</strong> " . ($data['data']['name'] ?? 'N/A') . "</p>";
        echo "<p><strong>Email:</strong> " . ($data['data']['email'] ?? 'N/A') . "</p>";
        echo "<p><strong>Role:</strong> " . ($data['data']['role'] ?? 'N/A') . "</p>";
    }
} else {
    echo "<h2 style='color: red;'>❌ Login Failed!</h2>";
    echo "<p>Error: " . ($data['error'] ?? 'Unknown error') . "</p>";
}

echo "<hr>";
echo "<a href='login.php'>Go to Login Page</a>";
?>
