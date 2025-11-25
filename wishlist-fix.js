// Wishlist Fix - Add this to wishlist.html or include as separate file

// Constants
const WISHLIST_KEY = 'wishlist_v1';
const CART_KEY = 'cart_v1';
const API_BASE = 'http://localhost:5001/api';

// Get token
function getToken() {
    return localStorage.getItem('token');
}

// Get wishlist from localStorage
function getWishlist() {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    updateWishlistBadge();
}

// Remove from wishlist - FIXED VERSION
async function removeFromWishlist(productId) {
    console.log('🗑️ Removing from wishlist:', productId);
    
    const token = getToken();
    
    if (token) {
        // Try backend API first
        try {
            const response = await fetch(`${API_BASE}/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('✅ Removed from backend wishlist');
            }
        } catch (error) {
            console.error('❌ Backend remove failed:', error);
        }
    }
    
    // Always update localStorage
    let wishlist = getWishlist();
    const itemName = wishlist.find(item => 
        (item._id === productId || item.id === productId || item.productId === productId)
    )?.name || 'Item';
    
    wishlist = wishlist.filter(item => 
        item._id !== productId && item.id !== productId && item.productId !== productId
    );
    
    saveWishlist(wishlist);
    showWishlist(); // Reload display
    showSuccessMessage(`${itemName} removed from wishlist`);
}

// Add to cart from wishlist - FIXED VERSION
async function addToCartFromWishlist(productId) {
    console.log('🛒 Adding to cart from wishlist:', productId);
    
    const wishlist = getWishlist();
    const item = wishlist.find(i => 
        i._id === productId || i.id === productId || i.productId === productId
    );
    
    if (!item) {
        showErrorMessage('Item not found in wishlist');
        return;
    }
    
    const token = getToken();
    
    if (token) {
        // Try backend API first
        try {
            const response = await fetch(`${API_BASE}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: item._id || item.id || item.productId,
                    quantity: 1
                })
            });

            if (response.ok) {
                console.log('✅ Added to backend cart');
                showSuccessMessage(`${item.name} added to cart`);
                return;
            }
        } catch (error) {
            console.error('❌ Backend cart add failed:', error);
        }
    }
    
    // Fallback to localStorage cart
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    const existingItem = cart.find(cartItem => 
        cartItem.productId === (item._id || item.id || item.productId)
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
        showSuccessMessage(`${item.name} quantity updated in cart`);
    } else {
        cart.push({
            productId: item._id || item.id || item.productId,
            name: item.name,
            price: item.price,
            image: item.image || item.images?.[0],
            quantity: 1
        });
        showSuccessMessage(`${item.name} added to cart`);
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

// Update wishlist badge - FIXED VERSION
function updateWishlistBadge() {
    const wishlistBadges = document.querySelectorAll('#viewWishlist .badge, .wishlist-badge');
    const wishlist = getWishlist();
    const totalItems = wishlist.length;
    
    wishlistBadges.forEach(badge => {
        if (badge) {
            badge.textContent = totalItems > 0 ? totalItems : '';
            badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    });
    
    console.log(`💝 Wishlist badge updated: ${totalItems} items`);
}

// Update cart badge
function updateCartBadge() {
    const cartBadges = document.querySelectorAll('#viewCart .badge, .cart-badge');
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    cartBadges.forEach(badge => {
        if (badge) {
            badge.textContent = totalItems > 0 ? totalItems : '';
            badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    });
}

// Show success message
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; animation: slideIn 0.3s ease;';
    notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Show error message
function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-danger position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Wishlist fix loaded');
    updateWishlistBadge();
    updateCartBadge();
});

console.log('✅ Wishlist fix script loaded');
