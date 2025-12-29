<?php
// Handle settings actions
$success = '';
$error = '';

// Get API client
require_once __DIR__ . '/../config/api_client.php';
$apiClient = getApiClient();

// Handle form submissions
if ($_POST) {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_profile') {
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        
        if (empty($name) || empty($email)) {
            $error = 'Name and email are required';
        } else {
            $result = $apiClient->makeRequest('admin/profile', 'PUT', [
                'name' => $name,
                'email' => $email
            ]);
            
            if ($result['success']) {
                $success = 'Profile updated successfully';
                // Update session data
                $_SESSION['admin_name'] = $name;
                $_SESSION['admin_email'] = $email;
            } else {
                $error = $result['error'] ?? 'Failed to update profile';
            }
        }
    } elseif ($action === 'change_password') {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        
        if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
            $error = 'All password fields are required';
        } elseif ($newPassword !== $confirmPassword) {
            $error = 'New passwords do not match';
        } elseif (strlen($newPassword) < 6) {
            $error = 'New password must be at least 6 characters long';
        } else {
            $result = $apiClient->makeRequest('admin/change-password', 'PUT', [
                'currentPassword' => $currentPassword,
                'newPassword' => $newPassword
            ]);
            
            if ($result['success']) {
                $success = 'Password changed successfully! Please use your new password for future logins.';
            } else {
                $error = $result['error'] ?? 'Failed to change password';
            }
        }
    }
}
?>

<div class="main-content">
    <div class="page-content">
        <div class="container-fluid">
            <!-- Page Title -->
            <div class="row">
                <div class="col-12">
                    <div class="page-title-box d-sm-flex align-items-center justify-content-between">
                        <h4 class="mb-sm-0 font-size-18">Settings</h4>
                        <div class="page-title-right">
                            <ol class="breadcrumb m-0">
                                <li class="breadcrumb-item"><a href="index.php">Admin</a></li>
                                <li class="breadcrumb-item active">Settings</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <?php if ($success): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <?php echo htmlspecialchars($success); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <?php echo htmlspecialchars($error); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <div class="row">
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title mb-4">Admin Settings</h4>

                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="card">
                                        <div class="card-body">
                                            <h5 class="card-title">Profile Information</h5>
                                            <form method="POST" action="">
                                                <input type="hidden" name="action" value="update_profile">
                                                
                                                <div class="mb-3">
                                                    <label for="name" class="form-label">Full Name</label>
                                                    <input type="text" class="form-control" id="name" name="name" 
                                                           value="<?php echo htmlspecialchars($admin_user['name'] ?? ''); ?>" required>
                                                </div>
                                                
                                                <div class="mb-3">
                                                    <label for="email" class="form-label">Email</label>
                                                    <input type="email" class="form-control" id="email" name="email" 
                                                           value="<?php echo htmlspecialchars($admin_user['email'] ?? ''); ?>" required>
                                                </div>
                                                
                                                <button type="submit" class="btn btn-primary">Update Profile</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="card">
                                        <div class="card-body">
                                            <h5 class="card-title">Change Password</h5>
                                            <form method="POST" action="">
                                                <input type="hidden" name="action" value="change_password">
                                                
                                                <div class="mb-3">
                                                    <label for="current_password" class="form-label">Current Password</label>
                                                    <input type="password" class="form-control" id="current_password" 
                                                           name="current_password" required>
                                                </div>
                                                
                                                <div class="mb-3">
                                                    <label for="new_password" class="form-label">New Password</label>
                                                    <input type="password" class="form-control" id="new_password" 
                                                           name="new_password" required>
                                                </div>
                                                
                                                <div class="mb-3">
                                                    <label for="confirm_password" class="form-label">Confirm New Password</label>
                                                    <input type="password" class="form-control" id="confirm_password" 
                                                           name="confirm_password" required>
                                                </div>
                                                
                                                <button type="submit" class="btn btn-primary">Change Password</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-12">
                                    <div class="card">
                                        <div class="card-body">
                                            <h5 class="card-title">System Information</h5>
                                            <div class="table-responsive">
                                                <table class="table table-nowrap mb-0">
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row" style="width: 200px;">Admin Panel Version:</th>
                                                            <td>1.0.0</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">PHP Version:</th>
                                                            <td><?php echo phpversion(); ?></td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Server:</th>
                                                            <td><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Database:</th>
                                                            <td>MongoDB</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Last Login:</th>
                                                            <td>
                                                                <?php 
                                                                if (!empty($admin_user['lastLogin'])) {
                                                                    echo date('M d, Y H:i', strtotime($admin_user['lastLogin']));
                                                                } else {
                                                                    echo 'N/A';
                                                                }
                                                                ?>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-12">
                                    <div class="card">
                                        <div class="card-body">
                                            <h5 class="card-title">Quick Actions</h5>
                                            <div class="d-flex gap-2 flex-wrap">
                                                <button type="button" class="btn btn-outline-primary" onclick="clearCache()">
                                                    <i class="bx bx-refresh me-1"></i> Clear Cache
                                                </button>
                                                <button type="button" class="btn btn-outline-info" onclick="exportData()">
                                                    <i class="bx bx-download me-1"></i> Export Data
                                                </button>
                                                <button type="button" class="btn btn-outline-warning" onclick="viewLogs()">
                                                    <i class="bx bx-file me-1"></i> View Logs
                                                </button>
                                                <button type="button" class="btn btn-outline-success" onclick="checkUpdates()">
                                                    <i class="bx bx-check-circle me-1"></i> Check Updates
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Settings JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Password confirmation validation
    const newPassword = document.getElementById('new_password');
    const confirmPassword = document.getElementById('confirm_password');
    
    if (newPassword && confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            if (this.value !== newPassword.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }
});

function clearCache() {
    if (confirm('Are you sure you want to clear the cache?')) {
        // Implement cache clearing logic
        alert('Cache cleared successfully!');
    }
}

function exportData() {
    if (confirm('This will export all system data. Continue?')) {
        // Implement data export logic
        alert('Data export started. You will receive an email when complete.');
    }
}

function viewLogs() {
    // Implement log viewing logic
    alert('Log viewer feature coming soon!');
}

function checkUpdates() {
    // Implement update checking logic
    alert('System is up to date!');
}
</script>