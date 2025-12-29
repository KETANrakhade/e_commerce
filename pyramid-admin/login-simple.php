<?php
require_once 'config/admin_config.php';

$error = '';
$success = '';

// Show notice if already logged in (NO REDIRECT)
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $success = 'You are already logged in as <strong>' . ($_SESSION['admin_name'] ?? 'Admin') . '</strong>. <a href="index.php" class="alert-link">Go to Dashboard</a> or login as a different user below.';
}

// Handle login form submission
if ($_POST) {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Please fill in all fields';
    } else {
        // Simple authentication check
        if ($email === 'admin@admin.com' && $password === 'admin123') {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_email'] = $email;
            $_SESSION['admin_name'] = 'Admin User';
            $_SESSION['admin_login_time'] = time();
            
            // NO REDIRECT - just show success message
            $success = 'Login successful! Welcome <strong>Admin User</strong>. <a href="index.php" class="alert-link">Go to Dashboard</a>';
        } else {
            $error = 'Invalid email or password';
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Simple Admin Login | E-Commerce Admin Panel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="assets/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="assets/css/app.min.css" rel="stylesheet" type="text/css" />
</head>

<body>
    <div class="account-pages my-5 pt-sm-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6 col-xl-5">
                    <div class="card overflow-hidden">
                        <div class="bg-primary-subtle">
                            <div class="row">
                                <div class="col-7">
                                    <div class="text-primary p-4">
                                        <h5 class="text-primary">Simple Login</h5>
                                        <p>No redirects - manual navigation only</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body pt-0">
                            <div class="p-2">
                                <?php if ($error): ?>
                                    <div class="alert alert-danger" role="alert">
                                        <i class="mdi mdi-alert-circle-outline me-2"></i>
                                        <?php echo htmlspecialchars($error); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if ($success): ?>
                                    <div class="alert alert-success" role="alert">
                                        <i class="mdi mdi-check-circle-outline me-2"></i>
                                        <?php echo $success; ?>
                                    </div>
                                <?php endif; ?>

                                <form method="POST" action="">
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="email" name="email" 
                                               placeholder="Enter email" value="admin@admin.com" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="password" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="password" name="password" 
                                               placeholder="Enter password" value="admin123" required>
                                    </div>
                                    
                                    <div class="d-grid">
                                        <button class="btn btn-primary" type="submit">Log In</button>
                                    </div>
                                </form>
                                
                                <div class="mt-3 text-center">
                                    <small class="text-muted">
                                        Test: admin@admin.com / admin123
                                    </small>
                                </div>
                                
                                <div class="mt-3 text-center">
                                    <a href="login.php" class="text-decoration-none">Regular Login</a> |
                                    <a href="clean-login.php" class="text-decoration-none">Clean Login</a> |
                                    <a href="index.php" class="text-decoration-none">Dashboard</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="assets/libs/jquery/jquery.min.js"></script>
    <script src="assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
    
    <script>
        console.log('🔍 Simple login page loaded - NO REDIRECTS');
        
        // Focus email field
        document.getElementById('email').focus();
        
        // NO OTHER JAVASCRIPT - no redirects possible
    </script>
</body>
</html>