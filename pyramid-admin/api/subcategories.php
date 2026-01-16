<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Include API client
require_once __DIR__ . '/../config/api_client.php';

try {
    $categoryId = $_GET['category'] ?? '';
    
    if (empty($categoryId)) {
        echo json_encode(['success' => false, 'error' => 'Category ID is required']);
        exit();
    }
    
    $apiClient = getApiClient();
    $result = $apiClient->getSubcategoriesByCategory($categoryId);
    
    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'data' => $result['data'] ?? []
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $result['error'] ?? 'Failed to fetch subcategories'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>