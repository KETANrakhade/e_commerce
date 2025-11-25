/**
 * Admin Panel JavaScript Functions
 */

// Show notification
function showNotification(message, type = 'success') {
    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Find container or create one
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container position-fixed';
        container.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        document.body.appendChild(container);
    }
    
    container.innerHTML = alertHtml;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

// Confirm dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Format currency
function formatCurrency(amount) {
    return '₹ ' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    confirmAction(`Are you sure you want to change the order status to "${newStatus}"?`, function() {
        // Create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `index.php?page=orders&action=update&id=${orderId}`;
        
        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'action';
        actionInput.value = 'update_status';
        
        const statusInput = document.createElement('input');
        statusInput.type = 'hidden';
        statusInput.name = 'status';
        statusInput.value = newStatus;
        
        form.appendChild(actionInput);
        form.appendChild(statusInput);
        document.body.appendChild(form);
        form.submit();
    });
}

// Toggle user status
function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    confirmAction(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`, function() {
        // Create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `index.php?page=users&action=update&id=${userId}`;
        
        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'action';
        actionInput.value = 'update_status';
        
        if (newStatus === 'active') {
            const statusInput = document.createElement('input');
            statusInput.type = 'hidden';
            statusInput.name = 'isActive';
            statusInput.value = '1';
            form.appendChild(statusInput);
        }
        
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
    });
}

// Initialize tooltips
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initTooltips();
    
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    });
});

// Export functions for global use
window.showNotification = showNotification;
window.confirmAction = confirmAction;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.updateOrderStatus = updateOrderStatus;
window.toggleUserStatus = toggleUserStatus;