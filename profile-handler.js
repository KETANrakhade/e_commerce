// Profile Handler for Login Page
// Shows user profile if logged in, otherwise shows login form

console.log('🔵 Profile handler loaded');

// Function to check and show profile
function checkAndShowProfile() {
    // Check for user token
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check for admin token (from frontend login)
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    console.log('🔍 Checking auth status...');
    console.log('User token exists:', !!token);
    console.log('Admin token exists:', !!adminToken);
    console.log('User data:', user);
    console.log('Admin data:', adminUser);
    
    // Priority: Check admin first, then regular user
    if (adminToken && adminUser.email) {
        // Admin is logged in - show admin profile
        console.log('✅ Admin logged in, showing admin profile');
        showUserProfile(adminUser, true); // true = isAdmin
    } else if (token && user.email) {
        // User is logged in - show profile instead of login form
        console.log('✅ User logged in, showing profile');
        const isAdmin = user.role === 'admin';
        showUserProfile(user, isAdmin);
    } else {
        // User not logged in - show normal login form
        console.log('❌ User not logged in, showing login form');
    }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Add small delay to ensure all elements are loaded
        setTimeout(checkAndShowProfile, 200);
    });
} else {
    // DOM is already ready, but wait a bit for elements to be fully rendered
    setTimeout(checkAndShowProfile, 200);
}

function showUserProfile(user, isAdmin = false) {
    // Determine if user is admin
    const userIsAdmin = isAdmin || user.role === 'admin';
    
    console.log('📝 Building profile view for:', user.name);
    console.log('Is Admin:', userIsAdmin);
    
    // Find the auth card - try multiple selectors with retry
    function findAuthCard() {
        let authCard = document.querySelector('.auth-card');
        if (authCard) return authCard;
        
        authCard = document.querySelector('.card-form .card');
        if (authCard) return authCard;
        
        authCard = document.querySelector('.card-form');
        if (authCard) return authCard;
        
        authCard = document.querySelector('.card-body');
        if (authCard) return authCard;
        
        authCard = document.querySelector('.tab-content');
        if (authCard) return authCard;
        
        return null;
    }
    
    let authCard = findAuthCard();
    
    if (!authCard) {
        console.error('❌ Auth card not found in DOM, retrying...');
        console.log('Available elements:', document.querySelectorAll('.card, .auth-card, .card-body, .card-form'));
        // Try again after a short delay
        setTimeout(function() {
            showUserProfile(user, isAdmin);
        }, 500);
        return;
    }
    
    console.log('✅ Auth card found:', authCard);
    
    // Create profile view
    const profileHTML = `
        <div class="card-body" style="overflow: visible !important; padding: 20px !important;">
            <div class="profile-view text-center p-4" style="overflow: visible !important; width: 100% !important;">
                <div class="profile-header mb-4">
                    <div class="profile-avatar mx-auto mb-3">
                        <i class="fas fa-${userIsAdmin ? 'crown' : 'user-circle'}" style="font-size: 80px; color: ${userIsAdmin ? '#ffc107' : '#6c63ff'};"></i>
                    </div>
                    <h3 class="welcome-title mb-2" style="overflow: visible !important; white-space: normal !important; text-overflow: clip !important; width: 100% !important; font-size: 28px !important;">
                        Welcome Back${userIsAdmin ? ', Admin' : ''}!
                    </h3>
                    <p class="text-muted" style="overflow: visible !important; white-space: normal !important;">You are already logged in</p>
                </div>
                
                <div class="profile-info mb-4">
                    <div class="info-card p-3 mb-3" style="background: #f8f9fa; border-radius: 10px;">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="text-start">
                                <small class="text-muted d-block">Name</small>
                                <strong>${user.name || 'User'}</strong>
                            </div>
                            <i class="fas fa-user text-muted"></i>
                        </div>
                    </div>
                    
                    <div class="info-card p-3 mb-3" style="background: #f8f9fa; border-radius: 10px;">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="text-start">
                                <small class="text-muted d-block">Email</small>
                                <strong>${user.email || 'N/A'}</strong>
                            </div>
                            <i class="fas fa-envelope text-muted"></i>
                        </div>
                    </div>
                    
                    <div class="info-card p-3 mb-3" style="background: #f8f9fa; border-radius: 10px;">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="text-start">
                                <small class="text-muted d-block">Role</small>
                                <strong style="text-transform: capitalize;">${user.role || 'User'}</strong>
                                ${userIsAdmin ? '<span class="badge bg-warning ms-2">Admin</span>' : ''}
                            </div>
                            <i class="fas fa-${userIsAdmin ? 'crown' : 'user-tag'} text-muted"></i>
                        </div>
                    </div>
                </div>
                
                <div class="profile-actions" style="margin-top: 30px; opacity: 1 !important; display: block !important; width: 100% !important;">
                    ${userIsAdmin ? `
                        <button id="adminDashboardBtn" type="button" class="btn btn-warning mb-3" 
                                style="width: 100% !important; padding: 14px !important; font-weight: 600 !important; font-size: 16px !important; 
                                       display: block !important; visibility: visible !important; opacity: 1 !important; 
                                       background-color: #ffc107 !important; color: #000 !important; border: 2px solid #ffc107 !important;
                                       cursor: pointer !important; height: auto !important; min-height: 50px !important;
                                       border-radius: 8px !important;">
                            <i class="fas fa-tachometer-alt me-2"></i>
                            Go to Dashboard
                        </button>
                    ` : ''}
                    
                    <button id="homeBtn" type="button" class="btn btn-primary mb-3" 
                            style="width: 100% !important; padding: 14px !important; font-weight: 600 !important; font-size: 16px !important; 
                                   display: block !important; visibility: visible !important; opacity: 1 !important;
                                   background-color: #0d6efd !important; color: white !important; border: 2px solid #0d6efd !important;
                                   cursor: pointer !important; height: auto !important; min-height: 50px !important;
                                   border-radius: 8px !important;">
                        <i class="fas fa-home me-2"></i>
                        Go to Homepage
                    </button>
                    
                    <button id="logoutBtn" type="button" class="btn btn-danger" 
                            style="width: 100% !important; padding: 14px !important; font-weight: 600 !important; font-size: 16px !important; 
                                   display: block !important; visibility: visible !important; opacity: 1 !important;
                                   background-color: #dc3545 !important; color: white !important; border: 2px solid #dc3545 !important; 
                                   cursor: pointer !important; height: auto !important; min-height: 50px !important; 
                                   position: relative !important; z-index: 999 !important;
                                   box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4) !important;
                                   border-radius: 8px !important;">
                        <i class="fas fa-right-from-bracket me-2"></i>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Replace the entire auth card content
    authCard.innerHTML = profileHTML;
    console.log('✅ Profile HTML injected');
    
    // Force a reflow to ensure styles are applied
    authCard.offsetHeight;
    
    // Attach event listeners AFTER HTML is in DOM
    setTimeout(function() {
        attachEventListeners(user, userIsAdmin);
    }, 50);
}

function attachEventListeners(user, isAdmin = false) {
    console.log('🔗 Attaching event listeners...');
    console.log('Is Admin:', isAdmin);
    
    // Wait a tiny bit for DOM to settle
    setTimeout(() => {
        // Home button
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            console.log('✅ Home button found, attaching listener');
            homeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🏠 Home button clicked');
                window.location.href = 'index.html';
            });
        } else {
            console.error('❌ Home button not found');
        }
        
        // Admin dashboard button (only if admin)
        if (isAdmin) {
            const adminDashboardBtn = document.getElementById('adminDashboardBtn');
            if (adminDashboardBtn) {
                console.log('✅ Admin dashboard button found, attaching listener');
                adminDashboardBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('👑 Admin dashboard button clicked');
                    window.location.href = 'http://localhost:8000';
                });
            } else {
                console.error('❌ Admin dashboard button not found');
            }
        }
        
        // Logout button - MOST IMPORTANT
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            console.log('✅ Logout button found, attaching listener');
            console.log('Logout button styles:', window.getComputedStyle(logoutBtn).display);
            console.log('Logout button visibility:', window.getComputedStyle(logoutBtn).visibility);
            
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚪 Logout button clicked!');
                logoutUser();
            });
            
            // Also make it work with Enter key
            logoutBtn.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🚪 Logout via Enter key');
                    logoutUser();
                }
            });
        } else {
            console.error('❌ Logout button NOT FOUND in DOM!');
            console.log('Available buttons:', document.querySelectorAll('button'));
        }
        
        console.log('✅ All event listeners attached');
        console.log('Total buttons found:', document.querySelectorAll('.profile-actions button').length);
        
        // Force logout button to be visible (fix CSS hiding issue)
        if (window.forceLogoutVisible) {
            window.forceLogoutVisible();
        }
        
    }, 100); // Small delay to ensure DOM is ready
}

function logoutUser() {
    console.log('🚪 Logout function called');
    
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
    
    console.log('✅ All tokens and user data cleared from localStorage');
    console.log('🛒 Cart and wishlist cleared');
    
    // Show success message
    if (typeof showToast === 'function') {
        showToast('Logged out successfully!', 'success', 2000);
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        // Reload the page to show login form
        console.log('🔄 Reloading page...');
        window.location.reload();
    }
}

// Make functions globally available (backup)
window.logoutUser = logoutUser;
window.showUserProfile = showUserProfile;

// Debug function to force logout button visible
window.forceLogoutVisible = function() {
    console.log('🔧 Forcing logout button visible...');
    const btn = document.getElementById('logoutBtn');
    
    if (!btn) {
        console.error('❌ Logout button not found in DOM!');
        console.log('All buttons:', document.querySelectorAll('button'));
        return;
    }
    
    console.log('✅ Logout button found:', btn);
    
    // Force all styles
    btn.style.cssText = `
        width: 100% !important;
        padding: 20px !important;
        font-weight: 700 !important;
        font-size: 18px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        background-color: #dc3545 !important;
        color: white !important;
        border: 3px solid #dc3545 !important;
        cursor: pointer !important;
        height: auto !important;
        min-height: 60px !important;
        position: relative !important;
        z-index: 9999 !important;
        margin: 20px 0 !important;
        box-shadow: 0 8px 16px rgba(220, 53, 69, 0.5) !important;
        border-radius: 8px !important;
    `;
    
    console.log('✅ Styles applied');
    console.log('Display:', window.getComputedStyle(btn).display);
    console.log('Visibility:', window.getComputedStyle(btn).visibility);
    console.log('Opacity:', window.getComputedStyle(btn).opacity);
    console.log('Background:', window.getComputedStyle(btn).backgroundColor);
    
    // Scroll into view
    btn.scrollIntoView({behavior: 'smooth', block: 'center'});
    
    console.log('✅ Button should now be visible!');
};

console.log('✅ Profile handler fully loaded and ready');
console.log('💡 Run forceLogoutVisible() in console if button is not visible');
