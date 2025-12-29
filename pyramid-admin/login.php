<?php
require_once 'config/admin_config.php';

// Debug: Check session status
debugSession('Login page accessed');

// Option: Always show login form (no redirect when already logged in)
// Uncomment the lines below to disable redirect behavior:
/*
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    // Add a notice that user is already logged in
    $success = 'You are already logged in as ' . ($_SESSION['admin_name'] ?? 'Admin') . '. <a href="index.php">Go to Dashboard</a> or login as different user below.';
}
*/

$error = '';
$success = '';

// Show notice if already logged in (but don't redirect)
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    debugSession('User is logged in, showing notice but no redirect');
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
        // Backend returns: {"success": true, "data": {"token": "...", "email": "...", "name": "...", "role": "admin"}}
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
                
                // Show success message and set redirect flag
                $success = 'Login successful! Welcome <strong>' . ($userData['name'] ?? 'Admin User') . '</strong>. <span id="redirect-message">Redirecting to dashboard in <span id="countdown">3</span> seconds...</span>';
                $redirect_to_dashboard = true;
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
                
                // Show success message and set redirect flag
                $success = 'Login successful! Welcome <strong>' . ADMIN_NAME . '</strong>. <span id="redirect-message">Redirecting to dashboard in <span id="countdown">3</span> seconds...</span>';
                $redirect_to_dashboard = true;
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
        
        .input-group .form-control.is-valid {
            border-right: 1px solid #34c38f;
        }
        
        .input-group .form-control.is-invalid {
            border-right: 1px solid #f46a6a;
        }
        
        .btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }
        
        .spinner-border-sm {
            width: 1rem;
            height: 1rem;
        }
        
        /* Smooth transitions */
        .form-control {
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .validation-message {
            animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Enhanced password toggle button */
        #password-addon {
            border-color: #ced4da;
            transition: all 0.15s ease-in-out;
        }
        
        #password-addon:hover {
            background-color: #e9ecef;
            border-color: #adb5bd;
        }
        
        /* Focus states */
        .form-control:focus {
            border-color: #556ee6;
            box-shadow: 0 0 0 0.2rem rgba(85, 110, 230, 0.25);
        }
        
        /* Alert enhancements */
        .alert {
            border: none;
            border-radius: 0.375rem;
            font-weight: 500;
        }
        
        .alert-danger {
            background-color: rgba(244, 106, 106, 0.1);
            color: #721c24;
            border-left: 4px solid #f46a6a;
        }
        
        .alert-success {
            background-color: rgba(52, 195, 143, 0.1);
            color: #155724;
            border-left: 4px solid #34c38f;
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
                                        <?php echo $success; ?>
                                        <?php if (isset($redirect_to_dashboard) && $redirect_to_dashboard): ?>
                                            <div class="mt-3">
                                                <a href="index.php" class="btn btn-success btn-sm">
                                                    <i class="mdi mdi-view-dashboard me-1"></i>Go to Dashboard Now
                                                </a>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                <?php endif; ?>

                                <form class="form-horizontal" method="POST" action="" novalidate>
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email Address <span class="text-danger">*</span></label>
                                        <input type="email" class="form-control" id="email" name="email" 
                                               placeholder="Enter your admin email" 
                                               value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" 
                                               autocomplete="email"
                                               autocapitalize="none"
                                               spellcheck="false"
                                               required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                                        <div class="input-group auth-pass-inputgroup">
                                            <input type="password" class="form-control" id="password" name="password" 
                                                   placeholder="Enter your password" 
                                                   aria-label="Password" 
                                                   aria-describedby="password-addon"
                                                   autocomplete="current-password"
                                                   minlength="6"
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
    
    <!-- Password Toggle Fix -->
    <script src="fix-password-toggle.js"></script>
    
    <!-- Inline Password Toggle Backup -->
    <script>
    // Backup password toggle fix
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            const passwordInput = document.querySelector('input[name="password"]');
            const passwordToggle = document.getElementById('password-addon');
            
            if (passwordInput && passwordToggle) {
                passwordToggle.onclick = function(e) {
                    e.preventDefault();
                    const icon = this.querySelector('i');
                    
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        if (icon) {
                            icon.className = 'mdi mdi-eye-off-outline';
                        }
                        this.title = 'Hide password';
                    } else {
                        passwordInput.type = 'password';
                        if (icon) {
                            icon.className = 'mdi mdi-eye-outline';
                        }
                        this.title = 'Show password';
                    }
                };
                passwordToggle.style.cursor = 'pointer';
                passwordToggle.title = 'Show password';
            }
        }, 100);
    });
    </script>
    
    <script>
        // Client-side validation and form enhancement
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const emailInput = document.getElementById('email');
            const passwordInput = document.querySelector('input[name="password"]');
            const submitButton = document.getElementById('login-btn');
            const passwordToggle = document.getElementById('password-addon');
            
            // Validation patterns
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const minPasswordLength = 6;
            
            // Create validation message containers
            function createValidationMessage(input, message, type = 'error') {
                // First, remove ALL existing messages for this input
                removeValidationMessage(input);
                
                // Create new message
                const messageDiv = document.createElement('div');
                messageDiv.className = `validation-message text-${type === 'error' ? 'danger' : 'success'} small mt-1`;
                messageDiv.innerHTML = `<i class="mdi mdi-${type === 'error' ? 'alert-circle' : 'check-circle'}-outline me-1"></i>${message}`;
                
                // Insert after input or input group
                const container = input.closest('.input-group') || input;
                container.parentNode.insertBefore(messageDiv, container.nextSibling);
                
                return messageDiv;
            }
            
            // Remove validation message - improved to find all possible locations
            function removeValidationMessage(input) {
                // Find the form group container
                const formGroup = input.closest('.mb-3');
                
                if (formGroup) {
                    // Remove all validation messages in this form group
                    const messages = formGroup.querySelectorAll('.validation-message');
                    messages.forEach(message => message.remove());
                }
                
                // Also check direct parent (fallback)
                const directMessage = input.parentNode.querySelector('.validation-message');
                if (directMessage) {
                    directMessage.remove();
                }
                
                // Check after input group (for password field)
                const inputGroup = input.closest('.input-group');
                if (inputGroup) {
                    const nextMessage = inputGroup.nextElementSibling;
                    if (nextMessage && nextMessage.classList.contains('validation-message')) {
                        nextMessage.remove();
                    }
                }
            }
            
            // Validate email
            function validateEmail() {
                const email = emailInput.value.trim();
                
                // Always remove existing messages first
                removeValidationMessage(emailInput);
                
                if (!email) {
                    emailInput.classList.add('is-invalid');
                    emailInput.classList.remove('is-valid');
                    createValidationMessage(emailInput, 'Email is required');
                    return false;
                } else if (!emailPattern.test(email)) {
                    emailInput.classList.add('is-invalid');
                    emailInput.classList.remove('is-valid');
                    createValidationMessage(emailInput, 'Please enter a valid email address');
                    return false;
                } else {
                    emailInput.classList.remove('is-invalid');
                    emailInput.classList.add('is-valid');
                    return true;
                }
            }
            
            // Validate password
            function validatePassword() {
                const password = passwordInput.value;
                
                // Always remove existing messages first
                removeValidationMessage(passwordInput);
                
                if (!password) {
                    passwordInput.classList.add('is-invalid');
                    passwordInput.classList.remove('is-valid');
                    createValidationMessage(passwordInput, 'Password is required');
                    return false;
                } else if (password.length < minPasswordLength) {
                    passwordInput.classList.add('is-invalid');
                    passwordInput.classList.remove('is-valid');
                    createValidationMessage(passwordInput, `Password must be at least ${minPasswordLength} characters long`);
                    return false;
                } else {
                    passwordInput.classList.remove('is-invalid');
                    passwordInput.classList.add('is-valid');
                    removeValidationMessage(passwordInput);
                    return true;
                }
            }
            
            // Debounce function to prevent rapid validation calls
            function debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }
            
            // Clear all validation messages from the form
            function clearAllValidationMessages() {
                const allMessages = form.querySelectorAll('.validation-message');
                allMessages.forEach(message => message.remove());
            }
            
            // Real-time validation with debouncing
            emailInput.addEventListener('blur', validateEmail);
            emailInput.addEventListener('input', debounce(function() {
                if (this.value.trim()) {
                    validateEmail();
                } else {
                    this.classList.remove('is-valid', 'is-invalid');
                    removeValidationMessage(this);
                }
            }, 300));
            
            passwordInput.addEventListener('blur', validatePassword);
            passwordInput.addEventListener('input', debounce(function() {
                if (this.value) {
                    validatePassword();
                } else {
                    this.classList.remove('is-valid', 'is-invalid');
                    removeValidationMessage(this);
                }
            }, 300));
            
            // Form submission validation
            form.addEventListener('submit', function(e) {
                const isEmailValid = validateEmail();
                const isPasswordValid = validatePassword();
                
                if (!isEmailValid || !isPasswordValid) {
                    e.preventDefault();
                    
                    // Show general error message
                    let alertDiv = document.querySelector('.alert-danger');
                    if (!alertDiv) {
                        alertDiv = document.createElement('div');
                        alertDiv.className = 'alert alert-danger';
                        alertDiv.setAttribute('role', 'alert');
                        form.parentNode.insertBefore(alertDiv, form);
                    }
                    alertDiv.innerHTML = '<i class="mdi mdi-alert-circle-outline me-2"></i>Please fix the errors below and try again.';
                    
                    // Scroll to first error
                    const firstError = document.querySelector('.is-invalid');
                    if (firstError) {
                        firstError.focus();
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    
                    return false;
                } else {
                    // Remove any existing error alerts
                    const errorAlert = document.querySelector('.alert-danger');
                    if (errorAlert && !errorAlert.textContent.includes('Invalid email or password')) {
                        errorAlert.remove();
                    }
                    
                    // Show loading state
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in...';
                    
                    // Re-enable button after 5 seconds (in case of server issues)
                    setTimeout(() => {
                        submitButton.disabled = false;
                        submitButton.innerHTML = 'Log In';
                    }, 5000);
                }
            });
            
            // Toggle password visibility
            passwordToggle.addEventListener('click', function() {
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
            
            // Add tooltips
            passwordToggle.setAttribute('title', 'Show password');
            
            // Enhanced keyboard navigation
            emailInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    passwordInput.focus();
                }
            });
            
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && validateEmail() && validatePassword()) {
                    form.submit();
                }
            });
            
            // Auto-focus email field
            emailInput.focus();
            
            // Clear validation on input focus
            [emailInput, passwordInput].forEach(input => {
                input.addEventListener('focus', function() {
                    // Remove validation state when user focuses (gives them a fresh start)
                    this.classList.remove('is-invalid');
                    
                    // Dim server-side error alert when user starts typing
                    const serverError = document.querySelector('.alert-danger');
                    if (serverError && (serverError.textContent.includes('Invalid email or password') || 
                                       serverError.textContent.includes('Please fill in all fields'))) {
                        serverError.style.opacity = '0.5';
                    }
                });
            });
            
            // Form reset functionality
            function resetForm() {
                [emailInput, passwordInput].forEach(input => {
                    input.classList.remove('is-valid', 'is-invalid');
                    input.value = '';
                });
                
                // Clear all validation messages
                clearAllValidationMessages();
                
                // Remove dynamic alerts (keep server messages)
                const alerts = document.querySelectorAll('.alert');
                alerts.forEach(alert => {
                    if (!alert.textContent.includes('logged out') && 
                        !alert.textContent.includes('session cleared') &&
                        !alert.textContent.includes('Invalid email or password') &&
                        !alert.textContent.includes('Backend server')) {
                        alert.remove();
                    }
                });
            }
            
            // Add reset button functionality if needed
            const resetButton = document.querySelector('button[type="reset"]');
            if (resetButton) {
                resetButton.addEventListener('click', resetForm);
            }
            
            console.log('✅ Admin login validation initialized');
        });
        
        // Auto-redirect after successful login
        <?php if (isset($redirect_to_dashboard) && $redirect_to_dashboard): ?>
        let countdown = 3;
        const countdownElement = document.getElementById('countdown');
        const redirectMessage = document.getElementById('redirect-message');
        
        if (countdownElement && redirectMessage) {
            const countdownInterval = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    redirectMessage.innerHTML = '<i class="mdi mdi-loading mdi-spin me-1"></i>Redirecting now...';
                    window.location.href = 'index.php';
                }
            }, 1000);
            
            // Also add click handler to redirect immediately
            redirectMessage.style.cursor = 'pointer';
            redirectMessage.addEventListener('click', function() {
                clearInterval(countdownInterval);
                window.location.href = 'index.php';
            });
        }
        <?php endif; ?>
        
        // Additional security: Prevent form resubmission on page refresh
        if (window.history.replaceState) {
            window.history.replaceState(null, null, window.location.href);
        }
    </script>
</body>
</html>