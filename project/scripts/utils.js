/**
 * Utility Functions
 * Helper functions for common operations
 */

/**
 * Load HTML content from a file and inject it into an element
 * @param {string} filePath - Path to the HTML file
 * @param {string} targetId - ID of the target element
 * @returns {Promise} - Promise that resolves when content is loaded
 */
async function loadHTML(filePath, targetId) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
        }
        const html = await response.text();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.innerHTML = html;
            return true;
        } else {
            console.error(`Target element with ID "${targetId}" not found`);
            return false;
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        return false;
    }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} format - Format style (default: 'long')
 * @returns {string} - Formatted date string
 */
function formatDate(date, format = 'long') {
    const dateObj = date instanceof Date ? date : new Date(date);
    const options = {
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    return dateObj.toLocaleDateString('en-US', options[format] || options.long);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show loading spinner
 * @param {string} containerId - ID of container to show spinner in
 */
function showLoader(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loader"></div>';
    }
}

/**
 * Hide loading spinner
 * @param {string} containerId - ID of container to hide spinner in
 */
function hideLoader(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loader = container.querySelector('.loader');
        if (loader) {
            loader.remove();
        }
    }
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, error, warning, info)
 * @param {string} containerId - ID of container to show alert in
 */
function showAlert(message, type = 'info', containerId = 'alert-container') {
    const container = document.getElementById(containerId) || document.body;
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.insertBefore(alert, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const toggleButton = document.getElementById('mobileMenuToggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleMobileMenu);
    }
}








