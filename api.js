// API Helper Functions
// This file contains reusable API call functions

const API = {
  // Generic API call function
  async call(endpoint, options = {}) {
    const url = CONFIG.getFullUrl(endpoint);
    const defaultOptions = {
      headers: CONFIG.getAuthHeaders(),
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'API call failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  // Auth APIs
  async login(email, password) {
    return this.call(CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  async register(name, email, password) {
    return this.call(CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },
  
  async getProfile() {
    return this.call(CONFIG.ENDPOINTS.PROFILE);
  },
  
  // Product APIs
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${CONFIG.ENDPOINTS.PRODUCTS}?${queryString}` : CONFIG.ENDPOINTS.PRODUCTS;
    return this.call(endpoint);
  },
  
  async getProductById(id) {
    return this.call(CONFIG.ENDPOINTS.PRODUCT_BY_ID(id));
  },
  
  async getFeaturedProducts(limit = 8) {
    return this.call(`${CONFIG.ENDPOINTS.FEATURED_PRODUCTS}?limit=${limit}`);
  },
  
  async getProductsByCategory(category) {
    return this.call(CONFIG.ENDPOINTS.PRODUCTS_BY_CATEGORY(category));
  },
  
  // Category APIs
  async getCategories() {
    return this.call(CONFIG.ENDPOINTS.CATEGORIES);
  },
  
  // Wishlist APIs
  async getWishlist() {
    return this.call(CONFIG.ENDPOINTS.WISHLIST);
  },
  
  async addToWishlist(productId) {
    return this.call(CONFIG.ENDPOINTS.ADD_TO_WISHLIST, {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },
  
  async removeFromWishlist(productId) {
    return this.call(CONFIG.ENDPOINTS.REMOVE_FROM_WISHLIST(productId), {
      method: 'DELETE'
    });
  },
  
  async clearWishlist() {
    return this.call(CONFIG.ENDPOINTS.CLEAR_WISHLIST, {
      method: 'DELETE'
    });
  },
  
  // Order APIs
  async createOrder(orderData) {
    return this.call(CONFIG.ENDPOINTS.CREATE_ORDER, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  
  async getMyOrders() {
    return this.call(CONFIG.ENDPOINTS.MY_ORDERS);
  },
  
  async getOrderById(id) {
    return this.call(CONFIG.ENDPOINTS.ORDER_BY_ID(id));
  },
  
  // Payment APIs
  async createCheckoutSession(orderData) {
    return this.call(CONFIG.ENDPOINTS.CREATE_CHECKOUT, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }
};

// Make it available globally
window.API = API;

console.log('✅ API helper loaded');
