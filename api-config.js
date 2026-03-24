// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5001/api'
  },
  production: {
    // ⚠️ UPDATE THIS after deploying backend to Vercel
    // Example: 'https://pyramid-backend-xyz.vercel.app/api'
    baseURL: 'https://ecommerce-drab-eight-28.vercel.app/api'
  }
};

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const environment = isDevelopment ? 'development' : 'production';

// Export the current API base URL
window.API_BASE_URL = API_CONFIG[environment].baseURL;

console.log('Environment:', environment);
console.log('API Base URL:', window.API_BASE_URL);
