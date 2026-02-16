<?php
// Suppress warnings and notices for cleaner user interface
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 0);

// Start session
session_start();

// Include API client
require_once __DIR__ . '/config/api_client.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

// Get parameters
$format = $_GET['format'] ?? 'pdf';
$status = $_GET['status'] ?? '';
$startDate = $_GET['startDate'] ?? '';
$endDate = $_GET['endDate'] ?? '';

// Build query parameters
$params = [];
if ($status) $params['status'] = $status;
if ($startDate) $params['startDate'] = $startDate;
if ($endDate) $params['endDate'] = $endDate;
$params['format'] = $format;

// Get API client and set token
$apiClient = getApiClient();
if (isset($_SESSION['admin_token'])) {
    $apiClient->setToken($_SESSION['admin_token']);
}

// Make direct request to backend export endpoint
$queryString = http_build_query($params);
$endpoint = 'admin/orders/export' . ($queryString ? '?' . $queryString : '');

// Use makeRequest for direct backend call
$backendUrl = defined('NODEJS_BACKEND_URL') ? NODEJS_BACKEND_URL : 'http://localhost:5001/api';
$url = $backendUrl . '/' . ltrim($endpoint, '/');

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 60, // Longer timeout for PDF generation
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_CUSTOMREQUEST => 'GET',
]);

// Set headers with authentication
$headers = [
    'Accept: application/pdf'
];

if (isset($_SESSION['admin_token'])) {
    $headers[] = 'Authorization: Bearer ' . $_SESSION['admin_token'];
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Connection error: ' . $error]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    // Try to decode JSON error response
    $errorResponse = json_decode($response, true);
    if ($errorResponse && isset($errorResponse['error'])) {
        echo json_encode(['success' => false, 'error' => $errorResponse['error']]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Export failed with HTTP ' . $httpCode]);
    }
    exit;
}

// Success - forward the PDF response
if ($format === 'pdf') {
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="orders_report_' . date('Y-m-d') . '.pdf"');
    header('Cache-Control: no-cache');
    header('Pragma: no-cache');
    echo $response;
} elseif ($format === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="orders_' . date('Y-m-d') . '.csv"');
    echo $response;
} else {
    header('Content-Type: application/json');
    echo $response;
}
?>