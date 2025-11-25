// Cart Cleaner - Validates cart items against database
console.log('🧹 Cart cleaner loaded');

// Validate and clean cart on page load
async function validateAndCleanCart() {
    const cart = JSON.parse(localStorage.getItem('cart_v1') || '[]');
    
    if (cart.length === 0) {
        console.log('✅ Cart is empty, nothing to clean');
        return;
    }
    
    console.log(`🔍 Validating ${cart.length} cart items...`);
    
    const validCart = [];
    const invalidItems = [];
    
    for (const item of cart) {
        try {
            // Check if product exists in database
            const response = await fetch(`http://localhost:5001/api/products/${item.id || item._id}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    // Product exists, keep it
                    validCart.push(item);
                    console.log(`✅ Valid: ${item.name}`);
                } else {
                    invalidItems.push(item.name);
                    console.log(`❌ Invalid: ${item.name} (not found in database)`);
                }
            } else {
                invalidItems.push(item.name);
                console.log(`❌ Invalid: ${item.name} (API error)`);
            }
        } catch (error) {
            console.error(`❌ Error checking ${item.name}:`, error);
            invalidItems.push(item.name);
        }
    }
    
    // Update cart with only valid items
    if (invalidItems.length > 0) {
        localStorage.setItem('cart_v1', JSON.stringify(validCart));
        console.log(`🧹 Cleaned cart: Removed ${invalidItems.length} invalid items`);
        console.log('Removed items:', invalidItems);
        
        // Show notification to user
        if (typeof showToast === 'function') {
            showToast(
                `Removed ${invalidItems.length} unavailable product(s) from cart`, 
                'info'
            );
        } else if (typeof showNotification === 'function') {
            showNotification(
                `Removed ${invalidItems.length} unavailable product(s) from cart`, 
                'info'
            );
        } else {
            console.log(`Cart cleaned: Removed ${invalidItems.length} unavailable product(s)`);
        }
        
        // Reload page to update cart display
        setTimeout(() => {
            location.reload();
        }, 2000);
    } else {
        console.log('✅ All cart items are valid');
    }
}

// Manual cart clear function
window.clearCart = function() {
    const confirmed = window.confirm ? confirm('Are you sure you want to clear your entire cart?') : true;
    if (confirmed) {
        localStorage.removeItem('cart_v1');
        console.log('🗑️ Cart cleared');
        if (typeof showToast === 'function') {
            showToast('Cart cleared successfully!', 'success', 2000);
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            location.reload();
        }
    }
};

// Auto-validate cart on checkout page
if (window.location.pathname.includes('checkout') || window.location.pathname.includes('cart')) {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 Checkout/Cart page detected, validating cart...');
        validateAndCleanCart();
    });
}

console.log('💡 Run clearCart() in console to manually clear cart');
