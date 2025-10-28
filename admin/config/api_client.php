<?php
/**
 * API Client for Node.js Backend
 * Connects your existing PHP admin panel to Node.js backend
 */

class ApiClient {
    private $baseUrl;
    private $token;
    
    public function __construct($baseUrl = 'http://localhost:YOUR_PORT/api') {
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
        
        return [
            'success' => $httpCode >= 200 && $httpCode < 300,
            'data' => $decodedResponse,
            'http_code' => $httpCode,
            'raw_response' => $response
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
        return $this->makeRequest('admin/stats');
    }
    
    /**
     * Get recent orders from Node.js
     */
    public function getRecentOrders() {
        return $this->makeRequest('admin/recent-orders');
    }
    
    /**
     * Get sales analytics from Node.js
     */
    public function getSalesAnalytics($period = 30) {
        return $this->makeRequest('admin/sales-analytics?period=' . $period);
    }
    
    /**
     * Get products from Node.js
     */
    public function getAdminProducts($params = []) {
        $queryString = http_build_query($params);
        $endpoint = 'admin/products' . ($queryString ? '?' . $queryString : '');
        return $this->makeRequest($endpoint);
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
        return $this->makeRequest($endpoint);
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
        return $this->makeRequest($endpoint);
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