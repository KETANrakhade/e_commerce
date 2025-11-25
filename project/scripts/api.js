/**
 * API Utility Functions
 * Functions for making API calls and handling responses
 */

// Base API URL - Update this to match your backend
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint (e.g., '/products')
 * @param {Object} params - Query parameters
 * @returns {Promise} - Promise that resolves with response data
 */
async function apiGet(endpoint, params = {}, token = null) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
        
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('API GET Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Make a POST request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {string} token - Optional authentication token
 * @returns {Promise} - Promise that resolves with response data
 */
async function apiPost(endpoint, data = {}, token = null) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        const responseData = await response.json();
        return { success: true, data: responseData };
    } catch (error) {
        console.error('API POST Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Make a PUT request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {string} token - Optional authentication token
 * @returns {Promise} - Promise that resolves with response data
 */
async function apiPut(endpoint, data = {}, token = null) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        const responseData = await response.json();
        return { success: true, data: responseData };
    } catch (error) {
        console.error('API PUT Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - API endpoint
 * @param {string} token - Optional authentication token
 * @returns {Promise} - Promise that resolves with response data
 */
async function apiDelete(endpoint, token = null) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        const responseData = await response.json().catch(() => ({ success: true }));
        return { success: true, data: responseData };
    } catch (error) {
        console.error('API DELETE Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get authentication token from localStorage
 * @returns {string|null} - Authentication token or null
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Set authentication token in localStorage
 * @param {string} token - Authentication token
 */
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

/**
 * Remove authentication token from localStorage
 */
function removeAuthToken() {
    localStorage.removeItem('authToken');
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
function isAuthenticated() {
    return !!getAuthToken();
}

