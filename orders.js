// Orders Page JavaScript
console.log('📦 Orders page JavaScript loaded');
console.log('🌐 API Base URL:', window.API_BASE_URL);

let currentFilter = 'all';
let selectedRating = 0;
let currentProductId = null;
let currentOrderId = null;

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded event fired');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    console.log('👤 User:', user);
    console.log('🔑 Token exists:', !!token);
    
    if (!user._id || !token) {
        console.error('❌ User not logged in');
        alert('Please login to view your orders');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ User is logged in, loading orders...');
    
    // Load orders
    loadOrders();
    
    // Setup filter tabs
    setupFilterTabs();
    
    // Setup star rating
    setupStarRating();
    
    // Setup navigation
    setupNavigation();
});

// Setup filter tabs
function setupFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-status');
            loadOrders();
        });
    });
}

// Load orders from API
async function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading your orders...</p>
        </div>
    `;
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('❌ No token found');
            alert('Please login to view your orders');
            window.location.href = 'login.html';
            return;
        }
        
        const url = currentFilter === 'all' 
            ? `${window.API_BASE_URL}/orders/myorders`
            : `${window.API_BASE_URL}/orders/myorders?status=${currentFilter}`;
        
        console.log('📡 Fetching orders from:', url);
        console.log('🔑 Using token:', token.substring(0, 20) + '...');
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response ok:', response.ok);
        
        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ Unauthorized - token expired');
                alert('Your session has expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Orders data received:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load orders');
        }
        
        if (!data.data || data.data.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No Orders Found</h3>
                    <p>You haven't placed any orders yet. Start shopping!</p>
                    <a href="index-backup.html" class="action-btn" style="display: inline-block; margin-top: 20px; text-decoration: none;">Start Shopping</a>
                </div>
            `;
            return;
        }
        
        console.log(`✅ Successfully loaded ${data.data.length} orders`);
        displayOrders(data.data);
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        console.error('Error stack:', error.stack);
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <h3>Error Loading Orders</h3>
                <p>${error.message}</p>
                <button class="action-btn" onclick="loadOrders()" style="margin-top: 20px;">Try Again</button>
            </div>
        `;
    }
}

// Display orders
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    let ordersHTML = '';
    
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const statusClass = `status-${order.status.toLowerCase()}`;
        
        let itemsHTML = '';
        order.orderItems.forEach(item => {
            let productId = item.productId || item.product || item._id;
            
            if (typeof productId === 'object' && productId !== null) {
                productId = productId._id || productId.toString();
            }
            
            productId = String(productId);
            
            const imageUrl = item.image || 'https://via.placeholder.com/80';
            const hasReview = item.hasReview || false;
            const canReview = order.status === 'delivered';
            
            const escapedName = (item.name || '').replace(/'/g, "\\'");
            const escapedImage = (imageUrl || '').replace(/'/g, "\\'");
            
            itemsHTML += `
                <div class="order-item">
                    <img src="${imageUrl}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/80'">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-quantity">Quantity: ${item.quantity}</div>
                        <div class="item-price">₹${item.price.toLocaleString()}</div>
                        ${canReview && productId && productId !== 'undefined' ? `
                            <div class="rating-section">
                                ${hasReview ? `
                                    <div class="product-rating">
                                        ${generateStars(item.userRating || 0)}
                                        <span class="rating-text">You rated this product</span>
                                    </div>
                                ` : `
                                    <button class="rate-btn" onclick="openRatingModal('${productId}', '${escapedName}', '${escapedImage}', '${order._id}')">
                                        <i class="fas fa-star"></i> Rate Product
                                    </button>
                                `}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        // Determine which action buttons to show based on order status
        let actionButtons = `
            <button class="action-btn" onclick="viewOrderDetails('${order._id}')">
                <i class="fas fa-eye"></i> View Details
            </button>
        `;
        
        // Show Cancel button for pending/confirmed orders
        if (order.status === 'pending' || order.status === 'confirmed') {
            actionButtons += `
                <button class="action-btn" style="background: #dc3545; color: white; border-color: #dc3545;" onclick="cancelOrder('${order._id}', '${order.orderNumber || order._id.substring(0, 8)}')">
                    <i class="fas fa-times"></i> Cancel Order
                </button>
            `;
        }
        
        // Show Return button for delivered orders (within 7 days)
        if (order.status === 'delivered') {
            const orderDate = new Date(order.createdAt);
            const currentDate = new Date();
            const daysDiff = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 7) {
                actionButtons += `
                    <button class="action-btn" style="background: #ff9800; color: white; border-color: #ff9800;" onclick="returnOrder('${order._id}', '${order.orderNumber || order._id.substring(0, 8)}')">
                        <i class="fas fa-undo"></i> Return Product
                    </button>
                `;
            }
        }
        
        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order #${order.orderNumber || order._id.substring(0, 8)}</div>
                        <div class="order-date">${orderDate}</div>
                    </div>
                    <div class="order-status ${statusClass}">${order.status}</div>
                </div>
                <div class="order-items">
                    ${itemsHTML}
                </div>
                <div class="order-footer">
                    <div class="order-total">Total: ₹${order.totalPrice.toLocaleString()}</div>
                    <div class="order-actions">
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
    });
    
    ordersList.innerHTML = ordersHTML;
}

// Generate star HTML
function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<i class="fas fa-star star"></i>';
        } else {
            starsHTML += '<i class="far fa-star star"></i>';
        }
    }
    return starsHTML;
}

// Setup star rating in modal
function setupStarRating() {
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            updateStarDisplay();
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
    });
    
    document.getElementById('starRating').addEventListener('mouseleave', updateStarDisplay);
}

// Update star display
function updateStarDisplay() {
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

// Open rating modal
function openRatingModal(productId, productName, productImage, orderId) {
    console.log('🎯 Opening rating modal:', { productId, productName, orderId });
    
    if (!productId || productId === 'undefined' || productId === 'null') {
        console.error('❌ Invalid product ID:', productId);
        alert('Error: Invalid product ID. Please try again or contact support.');
        return;
    }
    
    currentProductId = productId;
    currentOrderId = orderId;
    selectedRating = 0;
    
    const displayName = productName.replace(/\\'/g, "'");
    const displayImage = productImage.replace(/\\'/g, "'");
    
    document.getElementById('modalProductInfo').innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px;">
            <img src="${displayImage}" alt="${displayName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 10px;" onerror="this.src='https://via.placeholder.com/60'">
            <div>
                <div style="font-weight: 600; color: #2c3e50;">${displayName}</div>
                <div style="font-size: 0.85rem; color: #666;">Rate your experience</div>
            </div>
        </div>
    `;
    
    document.getElementById('reviewComment').value = '';
    updateStarDisplay();
    
    document.getElementById('ratingModal').classList.add('active');
    
    console.log('✅ Modal opened successfully');
}

// Close rating modal
function closeRatingModal() {
    document.getElementById('ratingModal').classList.remove('active');
    currentProductId = null;
    currentOrderId = null;
    selectedRating = 0;
}

// Submit review
async function submitReview() {
    if (selectedRating === 0) {
        alert('Please select a rating');
        return;
    }
    
    const comment = document.getElementById('reviewComment').value.trim();
    if (!comment) {
        alert('Please write a review');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Please login to submit a review');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('📝 Submitting review:', {
            productId: currentProductId,
            rating: selectedRating,
            comment: comment.substring(0, 50) + '...'
        });
        
        const response = await fetch(`${window.API_BASE_URL}/reviews/${currentProductId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rating: selectedRating,
                comment: comment
            })
        });
        
        console.log('📡 Response status:', response.status);
        
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (!response.ok) {
            if (response.status === 401) {
                alert('Your session has expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            
            if (response.status === 400 && data.message) {
                alert(data.message);
                return;
            }
            
            throw new Error(data.message || 'Failed to submit review');
        }
        
        console.log('✅ Review submitted successfully:', data);
        alert('Thank you for your review! 🌟');
        closeRatingModal();
        loadOrders();
        
    } catch (error) {
        console.error('❌ Error submitting review:', error);
        alert(error.message || 'Failed to submit review. Please try again.');
    }
}

// View order details
async function viewOrderDetails(orderId) {
    console.log('📋 View order details:', orderId);
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Please login to view order details');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('🔄 Fetching order details...');
        
        const response = await fetch(`${window.API_BASE_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        console.log('📦 Order data received:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load order details');
        }
        
        console.log('✅ Opening modal with order data');
        showOrderDetailsModal(data.data);
        
    } catch (error) {
        console.error('❌ Error loading order details:', error);
        alert('Failed to load order details. Please try again.');
    }
}

// Show order details modal
function showOrderDetailsModal(order) {
    console.log('🎨 Rendering order details modal for order:', order._id);
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const statusColors = {
        pending: '#ffc107',
        confirmed: '#17a2b8',
        processing: '#007bff',
        shipped: '#28a745',
        delivered: '#28a745',
        cancelled: '#dc3545'
    };
    
    const statusColor = statusColors[order.status] || '#6c757d';
    
    // Status descriptions
    const statusDescriptions = {
        pending: 'Your order has been placed and is awaiting confirmation.',
        confirmed: 'Your order has been confirmed and will be processed soon.',
        processing: 'Your order is being prepared for shipment.',
        shipped: 'Your order has been shipped and is on the way.',
        delivered: 'Your order has been successfully delivered.',
        cancelled: 'This order has been cancelled.'
    };
    
    // Calculate delivery estimate
    let deliveryInfo = '';
    if (order.status === 'shipped' || order.status === 'processing') {
        const estimatedDate = new Date(order.createdAt);
        estimatedDate.setDate(estimatedDate.getDate() + 5);
        deliveryInfo = `<div style="color: #28a745; font-size: 0.9rem; margin-top: 5px;">
            <i class="fas fa-truck"></i> Expected delivery by ${estimatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>`;
    } else if (order.status === 'delivered' && order.deliveredAt) {
        deliveryInfo = `<div style="color: #28a745; font-size: 0.9rem; margin-top: 5px;">
            <i class="fas fa-check-circle"></i> Delivered on ${new Date(order.deliveredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>`;
    }
    
    let itemsHTML = '';
    let totalItems = 0;
    order.orderItems.forEach(item => {
        totalItems += item.quantity;
        const imageUrl = item.image || 'https://via.placeholder.com/100';
        const itemTotal = item.price * item.quantity;
        itemsHTML += `
            <div style="display: flex; gap: 15px; padding: 15px; background: white; border: 1px solid #e9ecef; border-radius: 10px; margin-bottom: 12px; transition: all 0.3s ease;">
                <img src="${imageUrl}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #e9ecef;" onerror="this.src='https://via.placeholder.com/100'">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 8px; font-size: 1.05rem;">${item.name}</div>
                    <div style="display: flex; gap: 20px; margin-bottom: 8px;">
                        <div style="color: #666; font-size: 0.9rem;">
                            <i class="fas fa-box"></i> Qty: <span style="font-weight: 600; color: #2c3e50;">${item.quantity}</span>
                        </div>
                        <div style="color: #666; font-size: 0.9rem;">
                            <i class="fas fa-tag"></i> Price: <span style="font-weight: 600; color: #2c3e50;">₹${item.price.toLocaleString()}</span>
                        </div>
                    </div>
                    <div style="color: #667eea; font-weight: 700; font-size: 1.1rem;">
                        Subtotal: ₹${itemTotal.toLocaleString()}
                    </div>
                </div>
            </div>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay" id="orderDetailsModal" style="display: flex; z-index: 10000;">
            <div class="rating-modal-content" style="max-width: 700px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                <div class="modal-header" style="flex-shrink: 0; border-bottom: 2px solid #e9ecef; padding-bottom: 15px;">
                    <div>
                        <h3 class="modal-title" style="margin-bottom: 5px;">
                            <i class="fas fa-receipt"></i> Order Details
                        </h3>
                        <div style="color: #666; font-size: 0.9rem;">Order #${order.orderNumber || order._id.substring(0, 8)}</div>
                    </div>
                    <button class="close-modal" onclick="closeOrderDetailsModal()" style="position: absolute; right: 20px; top: 20px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="flex: 1; overflow-y: auto; padding: 20px 0;">
                    <!-- Order Status Section -->
                    <div style="margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, ${statusColor}15, ${statusColor}05); border-left: 4px solid ${statusColor}; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div>
                                <div style="font-weight: 700; color: #2c3e50; font-size: 1.15rem; margin-bottom: 5px;">
                                    <i class="fas fa-info-circle"></i> Order Status
                                </div>
                                <div style="color: #666; font-size: 0.9rem;">Placed on ${orderDate}</div>
                            </div>
                            <div style="padding: 8px 20px; border-radius: 25px; font-size: 0.9rem; font-weight: 700; text-transform: uppercase; background: ${statusColor}; color: white; box-shadow: 0 2px 8px ${statusColor}40;">
                                ${order.status}
                            </div>
                        </div>
                        <div style="color: #555; font-size: 0.95rem; margin-top: 10px;">
                            ${statusDescriptions[order.status] || 'Order is being processed.'}
                        </div>
                        ${deliveryInfo}
                    </div>
                    
                    <!-- Order Items Section -->
                    <div style="margin-bottom: 25px;">
                        <h4 style="color: #2c3e50; margin-bottom: 15px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-shopping-bag"></i> Order Items <span style="background: #667eea; color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.85rem;">${totalItems}</span>
                        </h4>
                        ${itemsHTML}
                    </div>
                    
                    <!-- Two Column Layout for Address and Payment -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                        <!-- Shipping Address -->
                        <div>
                            <h4 style="color: #2c3e50; margin-bottom: 15px; font-size: 1.1rem;">
                                <i class="fas fa-map-marker-alt"></i> Shipping Address
                            </h4>
                            <div style="padding: 15px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e9ecef;">
                                <div style="color: #2c3e50; font-weight: 600; margin-bottom: 8px;">
                                    <i class="fas fa-home"></i> Delivery Location
                                </div>
                                <div style="color: #555; margin-bottom: 5px; line-height: 1.6;">
                                    ${order.shippingAddress.address}
                                </div>
                                <div style="color: #666; font-size: 0.95rem;">
                                    ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}
                                </div>
                                <div style="color: #666; font-size: 0.95rem;">
                                    ${order.shippingAddress.country}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Payment Method -->
                        <div>
                            <h4 style="color: #2c3e50; margin-bottom: 15px; font-size: 1.1rem;">
                                <i class="fas fa-credit-card"></i> Payment Method
                            </h4>
                            <div style="padding: 15px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e9ecef;">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                                    <i class="fas fa-wallet" style="font-size: 1.5rem; color: #667eea;"></i>
                                    <div>
                                        <div style="font-weight: 600; color: #2c3e50;">${order.paymentMethod}</div>
                                        <div style="font-size: 0.85rem; color: #666;">Payment Method</div>
                                    </div>
                                </div>
                                <div style="padding: 8px 12px; border-radius: 8px; background: ${order.isPaid ? '#d4edda' : '#f8d7da'}; border: 1px solid ${order.isPaid ? '#c3e6cb' : '#f5c6cb'};">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <i class="fas ${order.isPaid ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="color: ${order.isPaid ? '#28a745' : '#dc3545'};"></i>
                                        <span style="font-weight: 600; color: ${order.isPaid ? '#155724' : '#721c24'}; font-size: 0.9rem;">
                                            ${order.isPaid ? 'Payment Successful' : 'Payment Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Price Breakdown -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #2c3e50; margin-bottom: 15px; font-size: 1.1rem;">
                            <i class="fas fa-file-invoice-dollar"></i> Price Details
                        </h4>
                        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e9ecef;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #dee2e6;">
                                <span style="color: #666;">Items Price (${totalItems} items)</span>
                                <span style="color: #2c3e50; font-weight: 600;">₹${order.itemsPrice.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #dee2e6;">
                                <span style="color: #666;">
                                    <i class="fas fa-shipping-fast"></i> Shipping Charges
                                </span>
                                <span style="color: ${order.shippingPrice === 0 ? '#28a745' : '#2c3e50'}; font-weight: 600;">
                                    ${order.shippingPrice === 0 ? 'FREE' : '₹' + order.shippingPrice.toLocaleString()}
                                </span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #dee2e6;">
                                <span style="color: #666;">
                                    <i class="fas fa-receipt"></i> Tax
                                </span>
                                <span style="color: #2c3e50; font-weight: 600;">₹${order.taxPrice.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #667eea;">
                                <span style="font-weight: 700; color: #2c3e50; font-size: 1.2rem;">
                                    <i class="fas fa-money-bill-wave"></i> Total Amount
                                </span>
                                <span style="font-weight: 700; color: #667eea; font-size: 1.3rem;">₹${order.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Help Section -->
                    <div style="padding: 15px; background: linear-gradient(135deg, #667eea15, #764ba215); border-radius: 10px; border: 1px solid #667eea30; text-align: center;">
                        <div style="color: #2c3e50; font-weight: 600; margin-bottom: 8px;">
                            <i class="fas fa-headset"></i> Need Help?
                        </div>
                        <div style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">
                            Contact our customer support for any queries
                        </div>
                        <a href="customer-care.html" style="display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 0.9rem;">
                            <i class="fas fa-phone-alt"></i> Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add click outside to close
    setTimeout(() => {
        document.getElementById('orderDetailsModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeOrderDetailsModal();
            }
        });
    }, 100);
}

// Close order details modal
function closeOrderDetailsModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// Cancel order
async function cancelOrder(orderId, orderNumber) {
    if (!confirm(`Are you sure you want to cancel Order #${orderNumber}?`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Please login to cancel order');
            window.location.href = 'login.html';
            return;
        }
        
        const response = await fetch(`${window.API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to cancel order');
        }
        
        alert('Order cancelled successfully!');
        loadOrders(); // Reload orders
        
    } catch (error) {
        console.error('❌ Error cancelling order:', error);
        alert(error.message || 'Failed to cancel order. Please try again.');
    }
}

// Return order
function returnOrder(orderId, orderNumber) {
    // Redirect to customer care page with pre-filled return form
    localStorage.setItem('returnOrderId', orderNumber);
    window.location.href = 'customer-care.html?action=return';
}

// Setup navigation
function setupNavigation() {
    document.getElementById('userProfile')?.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
    
    document.getElementById('viewWishlist')?.addEventListener('click', () => {
        window.location.href = 'wishlist.html';
    });
    
    document.getElementById('viewCart')?.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
}

// Close modal when clicking outside
document.getElementById('ratingModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeRatingModal();
    }
});
