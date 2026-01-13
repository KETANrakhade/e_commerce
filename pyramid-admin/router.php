<?php
// Simple router for PHP built-in server to serve static files from parent directory

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Handle uploads from parent directory
if (preg_match('/^\/uploads\//', $path)) {
    $filePath = __DIR__ . '/..' . $path;
    
    if (file_exists($filePath) && is_file($filePath)) {
        // Get file extension and set appropriate content type
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        $contentTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml'
        ];
        
        $contentType = $contentTypes[strtolower($ext)] ?? 'application/octet-stream';
        
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=31536000'); // Cache for 1 year
        
        readfile($filePath);
        exit;
    } else {
        http_response_code(404);
        echo "File not found: $path";
        exit;
    }
}

// Handle frontend HTML files from parent directory
if (preg_match('/\.(html|css|js)$/', $path) && $path !== '/') {
    $filePath = __DIR__ . '/..' . $path;
    
    if (file_exists($filePath) && is_file($filePath)) {
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        $contentTypes = [
            'html' => 'text/html',
            'css' => 'text/css',
            'js' => 'application/javascript'
        ];
        
        $contentType = $contentTypes[strtolower($ext)] ?? 'text/plain';
        header('Content-Type: ' . $contentType);
        
        readfile($filePath);
        exit;
    }
}

// Default: let PHP handle the request normally
return false;
?>