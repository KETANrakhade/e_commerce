// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5001/api'
  },
  production: {
    baseURL: 'https://your-backend-app.vercel.app/api' // You'll update this after backend deployment
  }
};

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const environment = isDevelopment ? 'development' : 'production';

// Export the current API base URL
window.API_BASE_URL = API_CONFIG[environment].baseURL;

console.log('Environment:', environment);
console.log('API Base URL:', window.API_BASE_URL);