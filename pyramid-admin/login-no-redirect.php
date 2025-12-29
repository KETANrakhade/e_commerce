<?php
require_once 'config/admin_config.php';

// This version always shows the login form, even if already logged in

$error = '';
$success = '';

// Check if already logged in and show notice (but don't redirect)
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $success = 'You are already logged in as <strong>' . ($_SESSION['admin_name'] ?? 'Admin') . '</strong>. <a href="index.php" class="alert-link">Go to Dashboard</a> or login as a different user below.';
}

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
        
        // Check if login was successful
        if ($result['success'] && isset($result['data']['data'])) {
            $userData = $result['data']['data'];
            
            // Check if user is admin
            if (isset($userData['role']) && $userData['role'] === 'admin' && isset($userData['token'])) {
                // Node.js authentication successful
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_token'] = $userData['token'];
                $_SESSION['admin_email'] = $userData['email'] ?? $email;
                $_SESSION['admin_name'] = $userData['name'] ?? 'Admin User';
                $_SESSION['admin_id'] = $userData['_id'] ?? '';
                $_SESSION['admin_login_time'] = time();
                
                header('Location: index.php');
                exit();
            } else {
                $error = 'Access denied. Admin privileges required.';
            }
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
    <title>Admin Login (No Redirect) | E-Commerce Admin Panel</title>
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
    
    <!-- Custom validation styles -->
    <style>
        .validation-message {
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
        }
        
        .validation-message i {
            font-size: 1rem;
        }
        
        .form-control.is-valid {
            border-color: #34c38f;
            box-shadow: 0 0 0 0.2rem rgba(52, 195, 143, 0.25);
        }
        
        .form-control.is-invalid {
            border-color: #f46a6a;
            box-shadow: 0 0 0 0.2rem rgba(244, 106, 106, 0.25);
        }
        
        .alert {
            border: none;
            border-radius: 0.375rem;
            font-weight: 500;
        }
        
        .alert-success {
            background-color: rgba(52, 195, 143, 0.1);
            color: #155724;
            border-left: 4px solid #34c38f;
        }
        
        .alert-danger {
            background-color: rgba(244, 106, 106, 0.1);
            color: #721c24;
            border-left: 4px solid #f46a6a;
        }
    </style>
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
                                        <h5 class="text-primary">Admin Login</h5>
                                        <p>Sign in to admin panel (No Auto-Redirect)</p>
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
                            </div>
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

                                <form class="form-horizontal" method="POST" action="" novalidate>
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email Address <span class="text-danger">*</span></label>
                                        <input type="email" class="form-control" id="email" name="email" 
                                               placeholder="Enter your admin email" 
                                               value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" 
                                               autocomplete="email"
                                               required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                                        <div class="input-group auth-pass-inputgroup">
                                            <input type="password" class="form-control" id="password" name="password" 
                                                   placeholder="Enter your password" 
                                                   autocomplete="current-password"
                                                   required>
                                            <button class="btn btn-light" type="button" id="password-addon" 
                                                    aria-label="Toggle password visibility" tabindex="-1">
                                                <i class="mdi mdi-eye-outline"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" id="remember-check" name="remember">
                                        <label class="form-check-label" for="remember-check">
                                            Remember me for 30 days
                                        </label>
                                    </div>
                                    
                                    <div class="d-grid">
                                        <button class="btn btn-primary waves-effect waves-light" type="submit" id="login-btn">
                                            <i class="mdi mdi-login me-1"></i> Log In
                                        </button>
                                    </div>
                                    
                                    <div class="mt-3 text-center">
                                        <small class="text-muted">
                                            <i class="mdi mdi-shield-check-outline me-1"></i>
                                            Secure admin access only
                                        </small>
                                    </div>
                                </form>
                                
                                <div class="mt-3 text-center">
                                    <small class="text-muted">
                                        <a href="login.php" class="text-decoration-none">Use regular login page</a>
                                    </small>
                                </div>
                            </div>
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
                this.setAttribute('title', 'Hide password');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('mdi-eye-off-outline');
                icon.classList.add('mdi-eye-outline');
                this.setAttribute('title', 'Show password');
            }
        });
        
        // Auto-focus email field
        document.getElementById('email').focus();
    </script>
</body>
</html>