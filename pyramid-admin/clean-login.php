<?php
session_start();

// Absolutely NO redirects - just show the form
$message = '';

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $message = '<div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0;">
        <strong>✅ Already logged in as ' . ($_SESSION['admin_name'] ?? 'Admin') . '</strong><br>
        <a href="index.php" style="color: #155724; font-weight: bold;">Go to Dashboard</a> or login as different user below.
    </div>';
}

if ($_POST) {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if ($email === 'admin@admin.com' && $password === 'admin123') {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_email'] = $email;
        $_SESSION['admin_name'] = 'Clean Admin';
        $_SESSION['admin_login_time'] = time();
        
        $message = '<div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <strong>✅ Login Successful!</strong><br>
            <a href="index.php" style="color: #155724; font-weight: bold;">Go to Dashboard</a>
        </div>';
    } else {
        $message = '<div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <strong>❌ Invalid credentials</strong>
        </div>';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Clean Login - No Redirects</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .links { margin-top: 20px; text-align: center; }
        .links a { margin: 0 10px; color: #007bff; text-decoration: none; }
    </style>
</head>
<body>
    <h1>🔐 Clean Login (No Redirects)</h1>
    
    <?php echo $message; ?>
    
    <form method="POST">
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="admin@admin.com" required>
        </div>
        
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" value="admin123" required>
        </div>
        
        <button type="submit">Login</button>
    </form>
    
    <div class="links">
        <a href="index.php">Dashboard</a> |
        <a href="login.php">Regular Login</a> |
        <a href="logout.php">Logout</a> |
        <a href="test-no-redirect.php">Debug</a>
    </div>
    
    <script>
        console.log('🔍 Clean login page loaded');
        console.log('No redirects will happen from this page');
        
        // Focus email field
        document.getElementById('email').focus();
    </script>
</body>
</html>