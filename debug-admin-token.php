<?php
// Start session and check admin token
session_start();

echo "🔍 Admin Token Debug\n\n";

// Check all session variables
echo "📋 Session Variables:\n";
foreach ($_SESSION as $key => $value) {
    if ($key === 'admin_token') {
        echo "- $key: " . substr($value, 0, 50) . "... (length: " . strlen($value) . ")\n";
    } else {
        echo "- $key: $value\n";
    }
}

echo "\n";

// Check if we have the required session variables
$required = ['admin_logged_in', 'admin_token', 'admin_name', 'admin_email'];
foreach ($required as $req) {
    $status = isset($_SESSION[$req]) ? '✅' : '❌';
    echo "$status $req\n";
}

// If we have a token, let's test it
if (isset($_SESSION['admin_token'])) {
    echo "\n🧪 Testing token with backend...\n";
    
    $token = $_SESSION['admin_token'];
    $url = 'http://localhost:5001/api/admin/stats';
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    echo "Response: " . substr($response, 0, 200) . "\n";
    
    if ($httpCode === 200) {
        echo "✅ Token is valid!\n";
    } else {
        echo "❌ Token is invalid or expired\n";
        echo "You need to login again\n";
    }
}

echo "\n🌐 Admin Panel: http://localhost:8000\n";
?>