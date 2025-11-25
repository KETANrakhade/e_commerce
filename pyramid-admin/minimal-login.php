<!DOCTYPE html>
<html>
<head>
    <title>Minimal Login Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 50px; }
        .login-form { max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; }
    </style>
</head>
<body>
    <div class="login-form">
        <h2>🔐 Minimal Login Test</h2>
        
        <?php
        session_start();
        
        if ($_POST['email'] ?? false) {
            echo "<p style='color: green;'>✅ Form submitted!</p>";
            echo "<p>Email: " . htmlspecialchars($_POST['email']) . "</p>";
            echo "<p>Password: " . (strlen($_POST['password']) > 0 ? '***' : 'empty') . "</p>";
            
            // Simple test login
            if ($_POST['email'] === 'admin@admin.com' && $_POST['password'] === 'admin123') {
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_email'] = $_POST['email'];
                echo "<p style='color: green;'>🎉 Login successful!</p>";
                echo "<a href='index.php'>Go to Dashboard</a>";
            } else {
                echo "<p style='color: red;'>❌ Invalid credentials</p>";
            }
        }
        ?>
        
        <form method="POST">
            <input type="email" name="email" placeholder="Email" value="admin@admin.com" required>
            <input type="password" name="password" placeholder="Password" value="admin123" required>
            <button type="submit">Login</button>
        </form>
        
        <hr>
        <p><strong>Test Links:</strong></p>
        <a href="login.php">Regular Login</a> | 
        <a href="debug-login.php">Debug Login</a> | 
        <a href="test-status.php">Status Check</a>
        
        <hr>
        <p><strong>Current Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
        <p><strong>Session Status:</strong> <?php echo session_status(); ?></p>
    </div>
</body>
</html>