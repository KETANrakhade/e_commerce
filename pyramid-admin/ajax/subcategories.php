<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

// Check if this is a subcategory request
if (!isset($_GET['category']) || empty($_GET['category'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Category ID is required']);
    exit;
}

$categoryId = $_GET['category'];

// Include API client
require_once __DIR__ . '/../config/api_client.php';

try {
    $apiClient = getApiClient();
    
    // Set token if available
    if (isset($_SESSION['admin_token'])) {
        $apiClient->setToken($_SESSION['admin_token']);
    }
    
    // Fetch subcategories from API
    $result = $apiClient->getSubcategoriesByCategory($categoryId);
    
    if ($result['success']) {
        // Extract subcategories from response
        $subcategories = [];
        if (isset($result['data']['data'])) {
            $subcategories = $result['data']['data'];
        } elseif (isset($result['data']) && is_array($result['data'])) {
            $subcategories = $result['data'];
        }
        
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'subcategories' => $subcategories
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $result['error'] ?? 'Failed to load subcategories'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>