<?php
session_start();

echo "<h1>🚀 Quick Login</h1>";

// Set session as logged in
$_SESSION['admin_logged_in'] = true;
$_SESSION['admin_email'] = 'admin@admin.com';
$_SESSION['admin_name'] = 'Admin User';
$_SESSION['admin_login_time'] = time();

echo "<p>✅ Session set as logged in!</p>";
echo "<p>Email: " . $_SESSION['admin_email'] . "</p>";
echo "<p>Login Time: " . date('Y-m-d H:i:s', $_SESSION['admin_login_time']) . "</p>";

echo "<h3>Quick Actions:</h3>";
echo "<a href='/pyramid-admin/index.php' style='padding: 10px; background: #28a745; color: white; text-decoration: none; margin: 5px;'>Go to Dashboard</a>";
echo "<a href='/pyramid-admin/index.php?page=products' style='padding: 10px; background: #007bff; color: white; text-decoration: none; margin: 5px;'>View Products</a>";
echo "<a href='/pyramid-admin/logout.php' style='padding: 10px; background: #dc3545; color: white; text-decoration: none; margin: 5px;'>Logout</a>";
?>