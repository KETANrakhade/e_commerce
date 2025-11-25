// Frontend Configuration
// This file centralizes all API endpoints and configuration

const CONFIG = {
  // API Base URL
  API_BASE_URL: 'http://localhost:5001/api',
  BACKEND_URL: 'http://localhost:5001',
  
  // API Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    PROFILE: '/users/profile',
    
    // Products
    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id) => `/products/${id}`,
    PRODUCTS_BY_CATEGORY: (category) => `/products/category/${category}`,
    FEATURED_PRODUCTS: '/products/featured',
    
    // Categories
    CATEGORIES: '/categories',
    CATEGORY_BY_ID: (id) => `/categories/${id}`,
    
    // Brands
    BRANDS: '/brands',
    
    // Cart & Orders
    CREATE_ORDER: '/orders',
    MY_ORDERS: '/orders/myorders',
    ORDER_BY_ID: (id) => `/orders/${id}`,
    
    // Wishlist
    WISHLIST: '/wishlist',
    ADD_TO_WISHLIST: '/wishlist/add',
    REMOVE_FROM_WISHLIST: (productId) => `/wishlist/remove/${productId}`,
    CLEAR_WISHLIST: '/wishlist/clear',
    
    // Payment
    CREATE_CHECKOUT: '/payments/create-checkout-session',
    
    // Admin
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_USERS: '/admin/users',
    ADMIN_CATEGORIES: '/admin/categories',
  },
  
  // Helper function to get full URL
  getFullUrl: function(endpoint) {
    return this.API_BASE_URL + endpoint;
  },
  
  // Helper function to get auth headers
  getAuthHeaders: function() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }
};

// Make it available globally
window.CONFIG = CONFIG;

console.log('✅ Config loaded:', CONFIG.API_BASE_URL);
