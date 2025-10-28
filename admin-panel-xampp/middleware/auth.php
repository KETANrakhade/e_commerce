<?php
// Authentication middleware for admin panel

function checkAdminAuth() {
    session_start();
    
    // Check if admin is logged in
    if (!isset($_SESSION['admin_token']) || !isset($_SESSION['admin_user'])) {
        header('Location: login.php');
        exit();
    }
    
    // Verify token with API (optional - for extra security)
    $token = $_SESSION['admin_token'];
    $api_url = 'http://localhost:5001/api/admin/profile';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // If token is invalid, redirect to login
    if (!$response || $http_code !== 200) {
        session_destroy();
        header('Location: login.php');
        exit();
    }
    
    return $_SESSION['admin_user'];
}

function logout() {
    session_start();
    session_destroy();
    header('Location: login.php');
    exit();
}

// API helper function
function makeApiCall($endpoint, $method = 'GET', $data = null) {
    session_start();
    
    if (!isset($_SESSION['admin_token'])) {
        return ['success' => false, 'error' => 'Not authenticated'];
    }
    
    $token = $_SESSION['admin_token'];
    $api_url = 'http://localhost:5001/api' . $endpoint;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, 1);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($response) {
        $result = json_decode($response, true);
        return $result ?: ['success' => false, 'error' => 'Invalid response'];
    }
    
    return ['success' => false, 'error' => 'API call failed', 'http_code' => $http_code];
}
?>