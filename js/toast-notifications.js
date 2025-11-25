/**
 * Toast Notification Utility
 * Replaces alert() with beautiful toast notifications
 */

// Toast container
let toastContainer = null;

/**
 * Initialize toast container
 */
function initToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
    // Initialize container
    const container = initToastContainer();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.style.cssText = `
        background: ${getToastColor(type).bg};
        color: ${getToastColor(type).text};
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 400px;
        pointer-events: auto;
        animation: slideInRight 0.3s ease-out;
        position: relative;
        border-left: 4px solid ${getToastColor(type).border};
    `;
    
    // Icon
    const icon = document.createElement('i');
    icon.className = getToastIcon(type);
    icon.style.cssText = 'font-size: 20px; flex-shrink: 0;';
    toast.appendChild(icon);
    
    // Message
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    messageEl.style.cssText = 'flex: 1; line-height: 1.5;';
    toast.appendChild(messageEl);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: ${getToastColor(type).text};
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        transition: opacity 0.2s;
    `;
    closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.7';
    closeBtn.onclick = () => removeToast(toast);
    toast.appendChild(closeBtn);
    
    // Add to container
    container.appendChild(toast);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
    
    return toast;
}

/**
 * Remove toast with animation
 */
function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * Get toast colors based on type
 */
function getToastColor(type) {
    const colors = {
        success: {
            bg: '#d4edda',
            text: '#155724',
            border: '#28a745'
        },
        error: {
            bg: '#f8d7da',
            text: '#721c24',
            border: '#dc3545'
        },
        warning: {
            bg: '#fff3cd',
            text: '#856404',
            border: '#ffc107'
        },
        info: {
            bg: '#d1ecf1',
            text: '#0c5460',
            border: '#17a2b8'
        }
    };
    return colors[type] || colors.info;
}

/**
 * Get toast icon based on type
 */
function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

/**
 * Add CSS animations
 */
function addToastStyles() {
    if (document.getElementById('toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @media (max-width: 768px) {
            #toast-container {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: 100%;
            }
            
            .toast-notification {
                min-width: auto;
                max-width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize styles when script loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addToastStyles);
    } else {
        addToastStyles();
    }
}

// Make functions globally available
window.showToast = showToast;
window.removeToast = removeToast;

console.log('✅ Toast notifications utility loaded');








