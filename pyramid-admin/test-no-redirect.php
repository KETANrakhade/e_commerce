<?php
require_once 'config/admin_config.php';

echo "<h1>🔍 Login Redirect Test</h1>";

// Check session
echo "<h2>Session Status:</h2>";
echo "<p><strong>Admin Logged In:</strong> " . (isset($_SESSION['admin_logged_in']) ? ($_SESSION['admin_logged_in'] ? 'YES' : 'NO') : 'NOT SET') . "</p>";
echo "<p><strong>Admin Name:</strong> " . ($_SESSION['admin_name'] ?? 'Not set') . "</p>";

// Test the condition
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    echo "<div style='background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>✅ You are logged in as " . ($_SESSION['admin_name'] ?? 'Admin') . "</strong><br>";
    echo "<a href='index.php' style='color: #155724; font-weight: bold;'>Go to Dashboard</a> or login as different user below.";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>❌ Not logged in</strong>";
    echo "</div>";
}

echo "<h2>Test Actions:</h2>";
echo "<a href='login.php' style='padding: 10px; background: #007bff; color: white; text-decoration: none; margin: 5px; border-radius: 5px;'>Go to Login Page</a><br><br>";
echo "<a href='logout.php' style='padding: 10px; background: #dc3545; color: white; text-decoration: none; margin: 5px; border-radius: 5px;'>Logout</a><br><br>";
echo "<a href='index.php' style='padding: 10px; background: #28a745; color: white; text-decoration: none; margin: 5px; border-radius: 5px;'>Go to Dashboard</a><br><br>";

echo "<h2>Simple Login Form (No Redirect Logic):</h2>";
?>

<form method="POST" style="background: #f8f9fa; padding: 20px; border-radius: 5px; max-width: 400px;">
    <div style="margin-bottom: 15px;">
        <label>Email:</label><br>
        <input type="email" name="email" value="admin@admin.com" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px;">
    </div>
    <div style="margin-bottom: 15px;">
        <label>Password:</label><br>
        <input type="password" name="password" value="admin123" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px;">
    </div>
    <button type="submit" style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer;">Login</button>
</form>

<?php
if ($_POST) {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    echo "<h3>Login Attempt:</h3>";
    echo "<p>Email: " . htmlspecialchars($email) . "</p>";
    echo "<p>Password: " . (strlen($password) > 0 ? '***' : 'empty') . "</p>";
    
    if ($email === 'admin@admin.com' && $password === 'admin123') {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_email'] = $email;
        $_SESSION['admin_name'] = 'Test Admin';
        $_SESSION['admin_login_time'] = time();
        
        echo "<div style='background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>✅ Login Successful!</strong><br>";
        echo "Session set. Refresh page to see updated status.";
        echo "</div>";
        
        echo "<script>setTimeout(() => location.reload(), 1000);</script>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>❌ Invalid credentials</strong>";
        echo "</div>";
    }
}
?>

<script>
// Check if there are any automatic redirects happening
console.log('🔍 Test page loaded - no redirects should happen');
console.log('Session status from PHP:', <?php echo json_encode(isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in']); ?>);
</script>