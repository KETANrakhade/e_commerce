<?php
require_once 'config/admin_config.php';

echo "<h2>Session Debug Information</h2>";
echo "<p><strong>Session Status:</strong> " . session_status() . "</p>";
echo "<p><strong>Session ID:</strong> " . session_id() . "</p>";
echo "<p><strong>Session Data:</strong></p>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

echo "<h3>Admin Configuration:</h3>";
echo "<p><strong>Admin Email:</strong> " . ADMIN_EMAIL . "</p>";
echo "<p><strong>Admin Name:</strong> " . ADMIN_NAME . "</p>";

echo "<h3>Actions:</h3>";
echo "<a href='logout.php' class='btn btn-danger'>Clear Session & Logout</a> ";
echo "<a href='index.php?force_logout=1' class='btn btn-warning'>Force Logout</a> ";
echo "<a href='login.php' class='btn btn-primary'>Go to Login</a>";

echo "<style>
body { font-family: Arial, sans-serif; margin: 20px; }
.btn { padding: 10px 15px; margin: 5px; text-decoration: none; border-radius: 5px; display: inline-block; }
.btn-danger { background: #dc3545; color: white; }
.btn-warning { background: #ffc107; color: black; }
.btn-primary { background: #007bff; color: white; }
</style>";
?>