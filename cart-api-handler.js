// Cart API Handler - Uses backend Cart API instead of localStorage
console.log('🛒 Cart API Handler loaded');

const CART_API = 'http://localhost:5001/api/cart';

// Get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Get cart from backend API
async function getCart() {
    if (!isLoggedIn()) {
        console.log('⚠️ User not logged in, returning empty cart');
        return [];
    }

    try {
        const response = await fetch(CART_API, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const cart = data.cart || data;
            console.log('✅ Cart fetched from API:', cart.items?.length || 0, 'items');
            return cart.items || [];
        } else {
            console.error('❌ Failed to fetch cart:', response.status);
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching cart:', error);
        return [];
    }
}

// Add item to cart
async function addToCart(productId, quantity = 1) {
    if (!isLoggedIn()) {
        if (typeof showToast === 'function') {
            showToast('Please login to add items to cart', 'warning', 2000);
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            window.location.href = '/login.html';
        }
        return false;
    }

    try {
        console.log('➕ Adding to cart:', productId, 'qty:', quantity);
        
        const response = await fetch(CART_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ productId, quantity })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Added to cart successfully');
            return true;
        } else {
            console.error('❌ Failed to add to cart:', data.message);
            if (typeof showToast === 'function') {
                showToast(data.message || 'Failed to add to cart', 'error');
            } else {
                console.error('Failed to add to cart:', data.message);
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        if (typeof showToast === 'function') {
            showToast('Error adding to cart. Please try again.', 'error');
        } else {
            console.error('Error adding to cart:', error);
        }
        return false;
    }
}

// Update cart item quantity
async function updateCartItem(productId, quantity) {
    if (!isLoggedIn()) {
        return false;
    }

    try {
        console.log('🔄 Updating cart item:', productId, 'new qty:', quantity);
        
        const response = await fetch(`${CART_API}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ quantity })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Cart item updated');
            return true;
        } else {
            console.error('❌ Failed to update cart:', data.message);
            if (typeof showToast === 'function') {
                showToast(data.message || 'Failed to update cart', 'error');
            } else {
                console.error('Failed to update cart:', data.message);
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Error updating cart:', error);
        return false;
    }
}

// Remove item from cart
async function removeFromCart(productId) {
    if (!isLoggedIn()) {
        return false;
    }

    try {
        console.log('🗑️ Removing from cart:', productId);
        
        const response = await fetch(`${CART_API}/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Item removed from cart');
            return true;
        } else {
            console.error('❌ Failed to remove from cart:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error removing from cart:', error);
        return false;
    }
}

// Clear entire cart
async function clearCart() {
    if (!isLoggedIn()) {
        return false;
    }

    if (!confirm('Are you sure you want to clear your entire cart?')) {
        return false;
    }

    try {
        console.log('🗑️ Clearing cart...');
        
        const response = await fetch(CART_API, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Cart cleared');
            return true;
        } else {
            console.error('❌ Failed to clear cart:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error clearing cart:', error);
        return false;
    }
}

// Get cart count for badge
async function getCartCount() {
    const cart = await getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    return count;
}

// Update cart badge in navbar
async function updateCartBadge() {
    const count = await getCartCount();
    const badge = document.querySelector('.cart-badge, .badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Migrate old localStorage cart to API (one-time migration)
async function migrateLocalStorageCart() {
    const oldCart = JSON.parse(localStorage.getItem('cart_v1') || '[]');
    
    if (oldCart.length === 0) {
        console.log('ℹ️ No old cart to migrate');
        return;
    }

    if (!isLoggedIn()) {
        console.log('⚠️ Cannot migrate cart - user not logged in');
        return;
    }

    console.log(`🔄 Migrating ${oldCart.length} items from localStorage to API...`);

    let migrated = 0;
    for (const item of oldCart) {
        const productId = item.id || item._id;
        const quantity = item.quantity || 1;
        
        const success = await addToCart(productId, quantity);
        if (success) {
            migrated++;
        }
    }

    if (migrated > 0) {
        console.log(`✅ Migrated ${migrated} items to API cart`);
        // Clear old cart
        localStorage.removeItem('cart_v1');
        if (typeof showToast === 'function') {
            showToast(`Successfully migrated ${migrated} items to your cart!`, 'success');
        } else {
            console.log(`Successfully migrated ${migrated} items to your cart!`);
        }
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        if (isLoggedIn()) {
            await migrateLocalStorageCart();
            await updateCartBadge();
        }
    });
} else {
    if (isLoggedIn()) {
        migrateLocalStorageCart();
        updateCartBadge();
    }
}

// Export functions for global use
window.cartAPI = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount,
    updateCartBadge
};

console.log('✅ Cart API Handler ready. Use window.cartAPI to interact with cart.');
