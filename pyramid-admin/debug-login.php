<?php
require_once 'config/admin_config.php';

echo "<h1>Debug Login Status</h1>";
echo "<p><strong>Session Status:</strong> " . session_status() . "</p>";
echo "<p><strong>Session ID:</strong> " . session_id() . "</p>";
echo "<p><strong>Admin Logged In:</strong> " . (isset($_SESSION['admin_logged_in']) ? ($_SESSION['admin_logged_in'] ? 'YES' : 'NO') : 'NOT SET') . "</p>";
echo "<p><strong>Admin Name:</strong> " . ($_SESSION['admin_name'] ?? 'Not set') . "</p>";
echo "<p><strong>Admin Email:</strong> " . ($_SESSION['admin_email'] ?? 'Not set') . "</p>";
echo "<p><strong>Login Time:</strong> " . (isset($_SESSION['admin_login_time']) ? date('Y-m-d H:i:s', $_SESSION['admin_login_time']) : 'Not set') . "</p>";

echo "<h2>All Session Data:</h2>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

echo "<h2>Test Actions:</h2>";
echo "<a href='login.php' style='padding: 10px; background: #007bff; color: white; text-decoration: none; margin: 5px;'>Go to Login Page</a>";
echo "<a href='logout.php' style='padding: 10px; background: #dc3545; color: white; text-decoration: none; margin: 5px;'>Logout</a>";
echo "<a href='index.php' style='padding: 10px; background: #28a745; color: white; text-decoration: none; margin: 5px;'>Go to Dashboard</a>";

// Test the exact same condition as login.php
echo "<h2>Login Page Condition Test:</h2>";
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    if (isset($_GET['force_login']) && $_GET['force_login'] === '1') {
        echo "<p style='color: orange;'>Would show login form (force_login=1)</p>";
    } else {
        echo "<p style='color: red;'>Would show redirect page</p>";
    }
} else {
    echo "<p style='color: green;'>Would show normal login form</p>";
}
?>