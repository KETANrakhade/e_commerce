<?php
session_start();

echo "<h1>🚪 Quick Logout</h1>";

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in']) {
    echo "<p><strong>Currently logged in as:</strong> " . ($_SESSION['admin_name'] ?? 'Admin') . " (" . ($_SESSION['admin_email'] ?? 'Unknown') . ")</p>";
    
    if (isset($_GET['confirm']) && $_GET['confirm'] === 'yes') {
        // Perform logout
        session_destroy();
        
        // Clear session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>✅ Logged Out Successfully!</strong><br>";
        echo "All session data has been cleared.";
        echo "</div>";
        
        echo "<a href='login.php' style='padding: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 3px;'>Go to Login Page</a>";
        
    } else {
        echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>⚠️ Confirm Logout</strong><br>";
        echo "Are you sure you want to logout?";
        echo "</div>";
        
        echo "<a href='?confirm=yes' style='padding: 10px; background: #dc3545; color: white; text-decoration: none; margin: 5px; border-radius: 3px;'>Yes, Logout</a>";
        echo "<a href='index.php' style='padding: 10px; background: #6c757d; color: white; text-decoration: none; margin: 5px; border-radius: 3px;'>Cancel</a>";
    }
} else {
    echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>❌ Not Logged In</strong><br>";
    echo "You are not currently logged in.";
    echo "</div>";
    
    echo "<a href='login.php' style='padding: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 3px;'>Go to Login Page</a>";
}
?>