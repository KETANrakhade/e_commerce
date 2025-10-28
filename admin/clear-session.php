<?php
session_start();

echo "<h1>🧹 Session Cleaner</h1>";

echo "<h3>Current Session Data:</h3>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

// Clear all session data
session_unset();
session_destroy();

// Start a new session
session_start();

echo "<h3>✅ Session Cleared!</h3>";
echo "<p>All session data has been removed.</p>";

echo "<h3>Quick Actions:</h3>";
echo "<a href='login.php' style='padding: 10px; background: #007bff; color: white; text-decoration: none; margin: 5px;'>Go to Login</a>";
echo "<a href='minimal-login.php' style='padding: 10px; background: #28a745; color: white; text-decoration: none; margin: 5px;'>Minimal Login</a>";
echo "<a href='index.php' style='padding: 10px; background: #ffc107; color: black; text-decoration: none; margin: 5px;'>Dashboard</a>";
?>