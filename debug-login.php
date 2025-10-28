<?php
require_once 'config/admin_config.php';

echo "<h1>🔍 Login Debug Page</h1>";

// Test backend connection
echo "<h3>Backend Test:</h3>";
$apiClient = getApiClient();
$testResult = $apiClient->makeRequest('');
echo "<p>Backend Connection: " . ($testResult['success'] ? 'SUCCESS' : 'FAILED') . "</p>";
echo "<p>HTTP Code: " . $testResult['http_code'] . "</p>";

// Test login
if ($_POST['email'] ?? false) {
    echo "<h3>Login Test:</h3>";
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    $loginResult = $apiClient->adminLogin($email, $password);
    echo "<p>Login Result: " . ($loginResult['success'] ? 'SUCCESS' : 'FAILED') . "</p>";
    echo "<p>Response: " . json_encode($loginResult) . "</p>";
    
    if ($loginResult['success']) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_email'] = $email;
        $_SESSION['admin_token'] = $loginResult['data']['token'] ?? '';
        echo "<p>✅ Login successful! <a href='index.php'>Go to Dashboard</a></p>";
    }
}
?>

<form method="POST">
    <h3>Test Login:</h3>
    <p>Email: <input type="email" name="email" value="admin@admin.com" required></p>
    <p>Password: <input type="password" name="password" value="admin123" required></p>
    <p><button type="submit">Test Login</button></p>
</form>

<h3>Quick Links:</h3>
<a href="login.php">Regular Login Page</a> | 
<a href="index.php">Dashboard</a> | 
<a href="test-status.php">Status Check</a>