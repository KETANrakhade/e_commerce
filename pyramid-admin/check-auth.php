<?php
/**
 * Quick script to check authentication status
 */
session_start();
require_once 'config/admin_config.php';
require_once 'config/api_client.php';

echo "<h2>Admin Panel Authentication Status</h2>";
echo "<pre>";

echo "Session Status: " . (session_status() === PHP_SESSION_ACTIVE ? "Active" : "Inactive") . "\n";
echo "Logged In: " . (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] ? "YES" : "NO") . "\n";
echo "Admin Token: " . (isset($_SESSION['admin_token']) ? "SET (" . substr($_SESSION['admin_token'], 0, 20) . "...)" : "NOT SET") . "\n";
echo "Admin Email: " . ($_SESSION['admin_email'] ?? "NOT SET") . "\n";
echo "\n";

if (isset($_SESSION['admin_token'])) {
    echo "Testing API call with token...\n";
    $apiClient = getApiClient();
    $result = $apiClient->getDashboardStats();
    
    echo "API Response:\n";
    echo "Success: " . ($result['success'] ? "YES" : "NO") . "\n";
    echo "HTTP Code: " . ($result['http_code'] ?? "N/A") . "\n";
    
    if ($result['success']) {
        echo "Data received: YES\n";
        if (isset($result['data'])) {
            echo "Stats:\n";
            print_r($result['data']);
        }
    } else {
        echo "Error: " . ($result['data']['error'] ?? $result['error'] ?? "Unknown error") . "\n";
        if (isset($result['data'])) {
            print_r($result['data']);
        }
    }
} else {
    echo "⚠️  No token found. Please login first.\n";
    echo "Login URL: <a href='login.php'>login.php</a>\n";
}

echo "</pre>";
?>








