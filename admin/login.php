<?php
require_once 'config/admin_config.php';

// Check if already logged in
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: index.php');
    exit();
}

$error = '';
$success = '';

// Check for messages
if (isset($_GET['message'])) {
    switch ($_GET['message']) {
        case 'logged_out':
            $success = 'You have been logged out successfully.';
            break;
        case 'session_cleared':
            $success = 'Session cleared. Please login again.';
            break;
        case 'session_expired':
            $error = 'Your session has expired. Please login again.';
            break;
    }
}

debugSession('Login page loaded');

if ($_POST) {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Please fill in all fields';
    } else {
        // Try Node.js backend authentication first
        require_once 'config/api_client.php';
        $apiClient = getApiClient();
        $result = $apiClient->adminLogin($email, $password);
        
        if ($result['success'] && isset($result['data']['token'])) {
            // Node.js authentication successful
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_token'] = $result['data']['token'];
            $_SESSION['admin_email'] = $result['data']['email'] ?? $email;
            $_SESSION['admin_name'] = $result['data']['name'] ?? 'Admin User';
            $_SESSION['admin_id'] = $result['data']['id'] ?? '';
            $_SESSION['admin_login_time'] = time();
            
            header('Location: index.php');
            exit();
        } else {
            // Fallback to PHP authentication if Node.js fails
            if ($email === ADMIN_EMAIL && $password === ADMIN_PASSWORD) {
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_email'] = $email;
                $_SESSION['admin_name'] = ADMIN_NAME;
                $_SESSION['admin_login_time'] = time();
                
                header('Location: index.php');
                exit();
            } else {
                $error = 'Invalid email or password';
                // Add backend status info if Node.js connection failed
                if ($result['http_code'] === 0) {
                    $error .= ' (Backend server not available)';
                }
            }
        }
    }
}
?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Admin Login | E-Commerce Admin Panel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="Admin Login for E-Commerce Platform" name="description" />
    <meta content="Pyramidal" name="author" />
    
    <!-- App favicon -->
    <link rel="shortcut icon" href="assets/images/favicon.ico">

    <!-- Bootstrap Css -->
    <link href="assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
    <!-- Icons Css -->
    <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <!-- App Css-->
    <link href="assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
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
                                        <h5 class="text-primary">Welcome Back!</h5>
                                        <p>Sign in to continue to admin panel.</p>
                                    </div>
                                </div>
                                <div class="col-5 align-self-end">
                                    <img src="assets/images/profile-img.png" alt="" class="img-fluid">
                                </div>
                            </div>
                        </div>
                        <div class="card-body pt-0">
                            <div class="auth-logo">
                                <a href="index.php" class="auth-logo-light">
                                    <div class="avatar-md profile-user-wid mb-4">
                                        <span class="avatar-title rounded-circle bg-light">
                                            <img src="assets/images/logo-light.svg" alt="" class="rounded-circle" height="34">
                                        </span>
                                    </div>
                                </a>
                                <a href="index.php" class="auth-logo-dark">
                                    <div class="avatar-md profile-user-wid mb-4">
                                        <span class="avatar-title rounded-circle bg-light">
                                            <img src="assets/images/logo.svg" alt="" class="rounded-circle" height="34">
                                        </span>
                                    </div>
                                </a>
                            </div>
                            <div class="p-2">
                                <?php if ($error): ?>
                                    <div class="alert alert-danger" role="alert">
                                        <?php echo htmlspecialchars($error); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if ($success): ?>
                                    <div class="alert alert-success" role="alert">
                                        <?php echo htmlspecialchars($success); ?>
                                    </div>
                                <?php endif; ?>

                                <form class="form-horizontal" method="POST" action="">
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="email" name="email" 
                                               placeholder="Enter email" value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" required>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Password</label>
                                        <div class="input-group auth-pass-inputgroup">
                                            <input type="password" class="form-control" name="password" 
                                                   placeholder="Enter password" aria-label="Password" 
                                                   aria-describedby="password-addon" required>
                                            <button class="btn btn-light" type="button" id="password-addon">
                                                <i class="mdi mdi-eye-outline"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="remember-check">
                                        <label class="form-check-label" for="remember-check">
                                            Remember me
                                        </label>
                                    </div>
                                    
                                    <div class="mt-3 d-grid">
                                        <button class="btn btn-primary waves-effect waves-light" type="submit">Log In</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="mt-5 text-center">
                        <div>
                            <p>© <script>document.write(new Date().getFullYear())</script> E-Commerce Admin Panel. Crafted with <i class="mdi mdi-heart text-danger"></i> by Pyramidal</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- JAVASCRIPT -->
    <script src="assets/libs/jquery/jquery.min.js"></script>
    <script src="assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="assets/libs/metismenu/metisMenu.min.js"></script>
    <script src="assets/libs/simplebar/simplebar.min.js"></script>
    <script src="assets/libs/node-waves/waves.min.js"></script>
    
    <!-- App js -->
    <script src="assets/js/app.js"></script>
    
    <script>
        // Toggle password visibility
        document.getElementById('password-addon').addEventListener('click', function() {
            const passwordInput = document.querySelector('input[name="password"]');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('mdi-eye-outline');
                icon.classList.add('mdi-eye-off-outline');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('mdi-eye-off-outline');
                icon.classList.add('mdi-eye-outline');
            }
        });
    </script>
</body>
</html>