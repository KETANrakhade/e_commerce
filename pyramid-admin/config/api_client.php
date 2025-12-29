<?php
/**
 * API Client for Node.js Backend
 * Connects your existing PHP admin panel to Node.js backend
 */

class ApiClient {
    private $baseUrl;
    private $token;
    
    public function __construct($baseUrl = null) {
        // Use config value if available, otherwise use default
        if ($baseUrl === null) {
            $baseUrl = defined('NODEJS_BACKEND_URL') ? NODEJS_BACKEND_URL : 'http://localhost:5001/api';
        }
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->token = $_SESSION['admin_token'] ?? null;
    }
    
    /**
     * Make HTTP request to Node.js API
     */
    public function makeRequest($endpoint, $method = 'GET', $data = null, $headers = []) {
        $url = $this->baseUrl . '/' . ltrim($endpoint, '/');
        
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_CUSTOMREQUEST => $method,
        ]);
        
        // Set headers
        $defaultHeaders = [
            'Content-Type: application/json',
            'Accept: application/json'
        ];
        
        if ($this->token) {
            $defaultHeaders[] = 'Authorization: Bearer ' . $this->token;
        }
        
        $allHeaders = array_merge($defaultHeaders, $headers);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $allHeaders);
        
        // Set data for POST/PUT requests
        if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        if ($error) {
            return [
                'success' => false,
                'error' => 'Connection error: ' . $error,
                'http_code' => 0,
                'data' => null
            ];
        }
        
        $decodedResponse = json_decode($response, true);
        
        // Handle empty response or non-JSON response
        if ($decodedResponse === null && $response !== '') {
            // Try to extract error from raw response
            $decodedResponse = ['error' => 'Invalid JSON response: ' . substr($response, 0, 100)];
        }
        
        // If response is empty and we got a 404, it's likely a route not found
        if ($httpCode === 404 && (empty($decodedResponse) || $decodedResponse === null)) {
            $decodedResponse = ['error' => 'Resource not found. The API endpoint does not exist.'];
        }
        
        return [
            'success' => $httpCode >= 200 && $httpCode < 300,
            'data' => $decodedResponse,
            'http_code' => $httpCode,
            'raw_response' => $response,
            'error' => isset($decodedResponse['error']) ? $decodedResponse['error'] : null
        ];
    }
    
    /**
     * Admin login with Node.js backend
     */
    public function adminLogin($email, $password) {
        return $this->makeRequest('admin/login', 'POST', [
            'email' => $email,
            'password' => $password
        ]);
    }
    
    /**
     * Get dashboard stats from Node.js
     */
    public function getDashboardStats() {
        $result = $this->makeRequest('admin/stats');
        // Backend returns: {success: true, data: {...}}
        // makeRequest wraps it: {success: true, data: {success: true, data: {...}}}
        // So we need to extract: $result['data']['data']
        if ($result['success'] && isset($result['data'])) {
            // Check if nested data structure exists
            if (isset($result['data']['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data']['data'],
                    'http_code' => $result['http_code']
                ];
            } else {
                // Fallback: data might be directly in result['data']
                return [
                    'success' => true,
                    'data' => $result['data'],
                    'http_code' => $result['http_code']
                ];
            }
        }
        return $result;
    }
    
    /**
     * Get recent orders from Node.js
     */
    public function getRecentOrders() {
        $result = $this->makeRequest('admin/recent-orders');
        // Backend returns: {success: true, data: [...]}
        // makeRequest wraps it, so extract: $result['data']['data']
        if ($result['success'] && isset($result['data'])) {
            if (isset($result['data']['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data']['data'],
                    'http_code' => $result['http_code']
                ];
            } else {
                return [
                    'success' => true,
                    'data' => $result['data'],
                    'http_code' => $result['http_code']
                ];
            }
        }
        return $result;
    }
    
    /**
     * Get sales analytics from Node.js
     */
    public function getSalesAnalytics($period = 30) {
        $result = $this->makeRequest('admin/sales-analytics?period=' . $period);
        // Backend returns: {success: true, data: {...}}
        // makeRequest wraps it, so extract: $result['data']['data']
        if ($result['success'] && isset($result['data'])) {
            if (isset($result['data']['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data']['data'],
                    'http_code' => $result['http_code']
                ];
            } else {
                return [
                    'success' => true,
                    'data' => $result['data'],
                    'http_code' => $result['http_code']
                ];
            }
        }
        return $result;
    }
    
    /**
     * Get products from Node.js
     */
    public function getAdminProducts($params = []) {
        $queryString = http_build_query($params);
        $endpoint = 'admin/products' . ($queryString ? '?' . $queryString : '');
        $result = $this->makeRequest($endpoint);
        // Backend returns: {success: true, data: {products: [...], pagination: {...}}}
        // makeRequest wraps it, so extract: $result['data']['data']
        if ($result['success'] && isset($result['data'])) {
            if (isset($result['data']['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data']['data'],
                    'http_code' => $result['http_code']
                ];
            } else {
                // Fallback: data might be directly in result['data']
                return $result;
            }
        }
        return $result;
    }
    
    /**
     * Get product by ID from Node.js
     */
    public function getProductById($id) {
        return $this->makeRequest('admin/products/' . $id);
    }
    
    /**
     * Create product via Node.js
     */
    public function createProduct($productData) {
        return $this->makeRequest('admin/products', 'POST', $productData);
    }
    
    /**
     * Update product via Node.js
     */
    public function updateProduct($id, $productData) {
        return $this->makeRequest('admin/products/' . $id, 'PUT', $productData);
    }
    
    /**
     * Delete product via Node.js
     */
    public function deleteProduct($id) {
        return $this->makeRequest('admin/products/' . $id, 'DELETE');
    }
    
    /**
     * Get orders from Node.js
     */
    public function getAdminOrders($params = []) {
        $queryString = http_build_query($params);
        $endpoint = 'admin/orders' . ($queryString ? '?' . $queryString : '');
        $result = $this->makeRequest($endpoint);
        // Backend returns: {success: true, data: {orders: [...], pagination: {...}}}
        // makeRequest wraps it, so extract: $result['data']['data']
        if ($result['success'] && isset($result['data'])) {
            if (isset($result['data']['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data']['data'],
                    'http_code' => $result['http_code']
                ];
            } else {
                // Fallback: data might be directly in result['data']
                return $result;
            }
        }
        return $result;
    }
    
    /**
     * Get order by ID from Node.js
     */
    public function getOrderById($id) {
        return $this->makeRequest('admin/orders/' . $id);
    }
    
    /**
     * Update order status via Node.js
     */
    public function updateOrderStatus($id, $status) {
        return $this->makeRequest('admin/orders/' . $id . '/status', 'PUT', [
            'status' => $status
        ]);
    }
    
    /**
     * Get users from Node.js
     */
    public function getAdminUsers($params = []) {
        $queryString = http_build_query($params);
        $endpoint = 'admin/users' . ($queryString ? '?' . $queryString : '');
        $result = $this->makeRequest($endpoint);
        // Backend returns: {success: true, data: {users: [...], pagination: {...}}}
        // makeRequest wraps it, so extract: $result['data']['data']
        if ($result['success'] && isset($result['data'])) {
            if (isset($result['data']['data'])) {
                return [
                    'success' => true,
                    'data' => $result['data']['data'],
                    'http_code' => $result['http_code']
                ];
            } else {
                // Fallback: data might be directly in result['data']
                return $result;
            }
        }
        return $result;
    }
    
    /**
     * Get user by ID from Node.js
     */
    public function getUserById($id) {
        return $this->makeRequest('admin/users/' . $id);
    }
    
    /**
     * Update user status via Node.js
     */
    public function updateUserStatus($id, $isActive) {
        return $this->makeRequest('admin/users/' . $id . '/status', 'PUT', [
            'isActive' => $isActive
        ]);
    }
    
    /**
     * Get user orders from Node.js
     */
    public function getUserOrders($id) {
        return $this->makeRequest('admin/users/' . $id . '/orders');
    }
    
    /**
     * Get subcategories from Node.js
     */
    public function getSubcategories($params = []) {
        $queryString = http_build_query($params);
        $endpoint = 'subcategories' . ($queryString ? '?' . $queryString : '');
        return $this->makeRequest($endpoint);
    }
    
    /**
     * Get subcategories by category ID from Node.js
     */
    public function getSubcategoriesByCategory($categoryId) {
        return $this->makeRequest('subcategories/category/' . $categoryId);
    }
    
    /**
     * Get subcategory by ID from Node.js
     */
    public function getSubcategoryById($id) {
        return $this->makeRequest('subcategories/' . $id);
    }
    
    /**
     * Create subcategory via Node.js
     */
    public function createSubcategory($subcategoryData) {
        return $this->makeRequest('admin/subcategories', 'POST', $subcategoryData);
    }
    
    /**
     * Update subcategory via Node.js
     */
    public function updateSubcategory($id, $subcategoryData) {
        return $this->makeRequest('admin/subcategories/' . $id, 'PUT', $subcategoryData);
    }
    
    /**
     * Delete subcategory via Node.js
     */
    public function deleteSubcategory($id) {
        return $this->makeRequest('admin/subcategories/' . $id, 'DELETE');
    }

    /**
     * Set authentication token
     */
    public function setToken($token) {
        $this->token = $token;
    }
    
    /**
     * Get current token
     */
    public function getToken() {
        return $this->token;
    }
    
    /**
     * Update admin profile
     */
    public function updateAdminProfile($name, $email) {
        return $this->makeRequest('admin/profile', 'PUT', [
            'name' => $name,
            'email' => $email
        ]);
    }
    
    /**
     * Change admin password
     */
    public function changeAdminPassword($currentPassword, $newPassword) {
        return $this->makeRequest('admin/change-password', 'PUT', [
            'currentPassword' => $currentPassword,
            'newPassword' => $newPassword
        ]);
    }
}

// Global API client instance
function getApiClient() {
    static $apiClient = null;
    if ($apiClient === null) {
        $apiClient = new ApiClient();
    }
    return $apiClient;
}

// API function - connects directly to Node.js backend
function makeApiCall($endpoint) {
    $apiClient = getApiClient();
    
    // Parse endpoint to determine which API method to call
    if (strpos($endpoint, '/admin/stats') === 0) {
        return $apiClient->getDashboardStats();
    } elseif (strpos($endpoint, '/admin/recent-orders') === 0) {
        return $apiClient->getRecentOrders();
    } elseif (strpos($endpoint, '/admin/sales-analytics') === 0) {
        return $apiClient->getSalesAnalytics();
    } elseif (strpos($endpoint, '/admin/products') === 0) {
        // Extract query parameters if present
        $params = [];
        if (strpos($endpoint, '?') !== false) {
            parse_str(parse_url($endpoint, PHP_URL_QUERY), $params);
        }
        return $apiClient->getAdminProducts($params);
    } elseif (strpos($endpoint, '/admin/orders') === 0) {
        $params = [];
        if (strpos($endpoint, '?') !== false) {
            parse_str(parse_url($endpoint, PHP_URL_QUERY), $params);
        }
        return $apiClient->getAdminOrders($params);
    } elseif (strpos($endpoint, '/admin/users') === 0) {
        $params = [];
        if (strpos($endpoint, '?') !== false) {
            parse_str(parse_url($endpoint, PHP_URL_QUERY), $params);
        }
        return $apiClient->getAdminUsers($params);
    } else {
        return ['success' => false, 'error' => 'Endpoint not found'];
    }
}
?>