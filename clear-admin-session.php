<?php
session_start();

echo "🧹 Clearing Admin Session\n\n";

// Clear all session data
$_SESSION = array();

// Destroy the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy the session
session_destroy();

echo "✅ Session cleared successfully!\n";
echo "🌐 Please login again at: http://localhost:8000\n";
?>