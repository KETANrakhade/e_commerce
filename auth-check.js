// Authentication and Role Check Script
// Add this to all your HTML pages

document.addEventListener('DOMContentLoaded', function() {
    updateNavigationBasedOnAuth();
});

function updateNavigationBasedOnAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Get navigation elements
    const userProfileBtn = document.getElementById('userProfile');
    const adminPanelBtn = document.getElementById('adminPanel');
    
    // Also check for crown icon or admin button with different selectors
    const adminIcons = document.querySelectorAll('.fa-crown, [title*="Admin"], [href*="admin"]');
    
    if (token && user.email) {
        // User is logged in
        console.log('✅ User logged in:', user.name, '| Role:', user.role);
        
        // Update user profile button
        if (userProfileBtn) {
            userProfileBtn.innerHTML = `<i class="fa-regular fa-user"></i> ${user.name}`;
            userProfileBtn.style.cursor = 'pointer';
        }
        
        // Show/hide admin panel button based on role
        if (user.role === 'admin') {
            // Show admin panel for admins
            if (adminPanelBtn) {
                adminPanelBtn.style.display = 'inline-block';
                adminPanelBtn.style.visibility = 'visible';
                console.log('✅ Admin panel visible');
            }
            // Show all admin-related icons
            adminIcons.forEach(icon => {
                if (icon.closest('.icon-btn') || icon.closest('span[id*="admin"]')) {
                    icon.closest('.icon-btn, span').style.display = 'inline-block';
                    icon.closest('.icon-btn, span').style.visibility = 'visible';
                }
            });
        } else {
            // Hide admin panel for regular users
            if (adminPanelBtn) {
                adminPanelBtn.style.display = 'none';
                adminPanelBtn.style.visibility = 'hidden';
                console.log('🔒 Admin panel hidden (not admin)');
            }
            // Hide all admin-related icons
            adminIcons.forEach(icon => {
                if (icon.closest('.icon-btn') || icon.closest('span[id*="admin"]')) {
                    icon.closest('.icon-btn, span').style.display = 'none';
                    icon.closest('.icon-btn, span').style.visibility = 'hidden';
                }
            });
        }
        
        // Add logout functionality
        addLogoutButton();
        
    } else {
        // User is not logged in
        console.log('❌ User not logged in');
        
        // Hide admin panel
        if (adminPanelBtn) {
            adminPanelBtn.style.display = 'none';
            adminPanelBtn.style.visibility = 'hidden';
        }
        
        // Hide all admin icons
        adminIcons.forEach(icon => {
            if (icon.closest('.icon-btn') || icon.closest('span[id*="admin"]')) {
                icon.closest('.icon-btn, span').style.display = 'none';
                icon.closest('.icon-btn, span').style.visibility = 'hidden';
            }
        });
        
        // Update user profile button to show login
        if (userProfileBtn) {
            userProfileBtn.innerHTML = '<i class="fa-regular fa-user"></i> Login';
            userProfileBtn.onclick = function() {
                window.location.href = 'login.html';
            };
        }
    }
}

function addLogoutButton() {
    // Check if logout button already exists
    if (document.getElementById('logoutBtn')) return;
    
    const userProfileBtn = document.getElementById('userProfile');
    if (!userProfileBtn) return;
    
    // Make user profile button clickable
    userProfileBtn.style.cursor = 'pointer';
    userProfileBtn.title = 'View Profile';
    
    // Add click event to user profile to go to login page (which shows profile)
    userProfileBtn.onclick = function(e) {
        e.preventDefault();
        window.location.href = 'login.html';
    };
    
    // Or create a separate logout button
    const logoutBtn = document.createElement('span');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.className = 'icon-btn ms-2';
    logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket" title="Logout"></i>';
    logoutBtn.style.cursor = 'pointer';
    logoutBtn.style.color = '#dc3545';
    logoutBtn.onclick = logout;
    
    // Insert after user profile button
    userProfileBtn.parentElement.appendChild(logoutBtn);
}

function logout() {
    // Use a better confirmation method
    const confirmed = window.confirm ? confirm('Are you sure you want to logout?') : true;
    
    if (confirmed) {
        // Clear all user and admin data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        // Clear cart and wishlist data
        localStorage.removeItem('cart_v1');
        localStorage.removeItem('wishlist_v1');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        
        console.log('✅ User logged out - all data cleared');
        if (typeof showToast === 'function') {
            showToast('Logged out successfully', 'success', 2000);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            window.location.href = 'login.html';
        }
    }
}

function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        if (typeof showToast === 'function') {
            showToast('Please login to access this page', 'warning', 2000);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            window.location.href = 'login.html';
        }
        return false;
    }
    return true;
}

function requireAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
        if (typeof showToast === 'function') {
            showToast('Access denied. Admin privileges required.', 'error', 2000);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            window.location.href = 'index.html';
        }
        return false;
    }
    return true;
}

// Make functions available globally
window.updateNavigationBasedOnAuth = updateNavigationBasedOnAuth;
window.logout = logout;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;

console.log('✅ Auth check loaded');
