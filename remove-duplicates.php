<?php
session_start();

// Include API client
require_once __DIR__ . '/pyramid-admin/config/api_client.php';

// Set admin token (you might need to get this from a logged-in admin session)
// For now, let's try without token first to see if it works
$apiClient = getApiClient();

echo "🧹 Starting duplicate product removal...\n\n";

// List of duplicate product IDs to remove (keeping the oldest ones)
$duplicatesToRemove = [
    '695e07ace9dc00c6608bfd06', // black suit duplicate (newer)
    '69525fcfdb87988e9909b950', // Kurta set duplicate 1
    '69525fd3db87988e9909b961', // Kurta set duplicate 2
    '69525258db87988e9909b849', // blue jeanse duplicate 1
    '69525277db87988e9909b857', // blue jeanse duplicate 2
    '69521d93db87988e9909b1ca'  // track suit duplicate
];

$removedCount = 0;
$failedCount = 0;

foreach ($duplicatesToRemove as $productId) {
    echo "Removing product ID: $productId\n";
    
    $result = $apiClient->deleteProduct($productId);
    
    if ($result['success']) {
        echo "  ✅ Successfully removed\n";
        $removedCount++;
    } else {
        echo "  ❌ Failed to remove: " . ($result['error'] ?? 'Unknown error') . "\n";
        echo "  HTTP Code: " . ($result['http_code'] ?? 'N/A') . "\n";
        $failedCount++;
    }
    
    echo "\n";
    
    // Small delay to avoid overwhelming the API
    usleep(200000); // 200ms
}

echo "🧹 Cleanup Summary:\n";
echo "  - Successfully removed: $removedCount products\n";
echo "  - Failed to remove: $failedCount products\n";

if ($removedCount > 0) {
    echo "\n✅ Duplicate removal completed! Check the men's products page to verify.\n";
} else {
    echo "\n❌ No products were removed. Check authentication or backend status.\n";
}
?>