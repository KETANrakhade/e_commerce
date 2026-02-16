// Customer Care JavaScript
let currentRating = 0;
let currentProductId = null;

// Modal Functions
function openReturnModal() {
    document.getElementById('returnModal').classList.add('active');
}

function openExchangeModal() {
    document.getElementById('exchangeModal').classList.add('active');
}

function openTrackModal() {
    document.getElementById('trackModal').classList.add('active');
}

function openSupportModal() {
    document.getElementById('supportModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Reset forms
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // Clear tracking result if it's the track modal
    if (modalId === 'trackModal') {
        const trackingResult = document.getElementById('trackingResult');
        if (trackingResult) {
            trackingResult.style.display = 'none';
            trackingResult.innerHTML = '';
        }
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

// FAQ Toggle
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const isActive = answer.classList.contains('active');
    
    // Close all FAQs
    document.querySelectorAll('.faq-answer').forEach(ans => {
        ans.classList.remove('active');
    });
    document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
    });
    
    // Open clicked FAQ if it wasn't active
    if (!isActive) {
        answer.classList.add('active');
        element.classList.add('active');
    }
}

// Submit Return Request
async function submitReturn(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    const formData = new FormData(event.target);
    const data = {
        orderId: formData.get('orderId'),
        productName: formData.get('productName'),
        reason: formData.get('reason'),
        details: formData.get('details') || '',
        type: 'return',
        status: 'pending',
        requestDate: new Date().toISOString()
    };
    
    console.log('📤 Submitting return request:', data);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to submit a return request');
            window.location.href = 'login.html';
            return;
        }
        
        const apiUrl = window.API_BASE_URL || 'http://localhost:5001/api';
        console.log('🌐 API URL:', apiUrl);
        console.log('🔑 Token:', token.substring(0, 20) + '...');
        
        const response = await fetch(`${apiUrl}/customer-care/return`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        const result = await response.json();
        console.log('📦 Response data:', result);
        
        if (response.ok && result.success) {
            // Show success message with better styling
            const successModal = document.createElement('div');
            successModal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                z-index: 10001;
                text-align: center;
                max-width: 400px;
                animation: modalSlideUp 0.4s ease;
            `;
            successModal.innerHTML = `
                <div style="color: #28a745; font-size: 4rem; margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 1.5rem;">Return Request Submitted!</h3>
                <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
                    Your return request has been received. Our team will contact you within 24 hours to arrange pickup.
                </p>
                <button onclick="this.parentElement.remove(); document.querySelector('.modal-overlay.active').classList.remove('active');" 
                    style="padding: 12px 30px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
                    Got it!
                </button>
            `;
            document.body.appendChild(successModal);
            
            // Reset form
            event.target.reset();
            
        } else {
            // Show detailed error message
            const errorMsg = result.message || 'Failed to submit return request. Please try again.';
            console.error('❌ Error:', errorMsg);
            alert(`Error: ${errorMsg}\n\nPlease check the console for more details.`);
        }
    } catch (error) {
        console.error('❌ Error submitting return:', error);
        console.error('Error details:', error.message);
        alert(`An error occurred: ${error.message}\n\nPlease check the console for more details.`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Submit Exchange Request
async function submitExchange(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    const formData = new FormData(event.target);
    const data = {
        orderId: formData.get('orderId'),
        productName: formData.get('productName'),
        exchangeType: formData.get('exchangeType'),
        preference: formData.get('preference') || '',
        details: formData.get('details') || '',
        type: 'exchange',
        status: 'pending',
        requestDate: new Date().toISOString()
    };
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to submit an exchange request');
            window.location.href = 'login.html';
            return;
        }
        
        const apiUrl = window.API_BASE_URL || 'http://localhost:5001/api';
        
        const response = await fetch(`${apiUrl}/customer-care/exchange`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Exchange request submitted successfully! Our team will contact you soon.');
            closeModal('exchangeModal');
            event.target.reset();
        } else {
            alert(result.message || 'Failed to submit exchange request. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting exchange:', error);
        alert('An error occurred. Please try again later.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Track Order
async function trackOrder(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const orderId = formData.get('orderId');
    const contact = formData.get('contact');
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to track your order');
            window.location.href = 'login.html';
            return;
        }
        
        const apiUrl = window.API_BASE_URL || 'http://localhost:5001/api';
        
        const response = await fetch(`${apiUrl}/orders/track/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            displayTrackingResult(result.data);
        } else {
            alert(result.message || 'Order not found. Please check your Order ID.');
        }
    } catch (error) {
        console.error('Error tracking order:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Display Tracking Result
function displayTrackingResult(order) {
    const trackingResult = document.getElementById('trackingResult');
    
    const statusColors = {
        pending: '#ffc107',
        confirmed: '#17a2b8',
        processing: '#007bff',
        shipped: '#28a745',
        delivered: '#28a745',
        cancelled: '#dc3545'
    };
    
    const statusColor = statusColors[order.status] || '#6c757d';
    
    trackingResult.innerHTML = `
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h4 style="color: #2c3e50; margin-bottom: 15px;">Order Details</h4>
            <p><strong>Order ID:</strong> ${order.orderNumber || order._id}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600; text-transform: uppercase;">${order.status}</span></p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> Rs.${order.totalPrice?.toLocaleString('en-IN')}</p>
            ${order.isDelivered ? `<p><strong>Delivered On:</strong> ${new Date(order.deliveredAt).toLocaleDateString()}</p>` : ''}
            
            <div style="margin-top: 20px;">
                <h5 style="color: #2c3e50; margin-bottom: 10px;">Items:</h5>
                ${order.orderItems.map(item => `
                    <div style="padding: 10px; background: white; border-radius: 8px; margin-bottom: 8px;">
                        <p style="margin: 0; font-weight: 600;">${item.name}</p>
                        <p style="margin: 5px 0 0 0; color: #666;">Quantity: ${item.quantity} | Price: Rs.${item.price}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    trackingResult.style.display = 'block';
}

// Submit Support Request
async function submitSupport(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        subject: formData.get('subject'),
        message: formData.get('message'),
        status: 'open',
        createdAt: new Date().toISOString()
    };
    
    try {
        const token = localStorage.getItem('token');
        const apiUrl = window.API_BASE_URL || 'http://localhost:5001/api';
        
        const response = await fetch(`${apiUrl}/customer-care/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Support request submitted successfully! We will get back to you within 24 hours.');
            closeModal('supportModal');
            event.target.reset();
        } else {
            alert(result.message || 'Failed to submit support request. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting support:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Check authentication and update navbar
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userProfile = document.getElementById('userProfile');
    
    if (userProfile) {
        userProfile.addEventListener('click', () => {
            if (token) {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }
    
    // Wishlist icon
    const wishlistIcon = document.getElementById('viewWishlist');
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', () => {
            window.location.href = 'wishlist.html';
        });
    }
    
    // Cart icon
    const cartIcon = document.getElementById('viewCart');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }
    
    // Check if redirected from orders page for return
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'return') {
        const returnOrderId = localStorage.getItem('returnOrderId');
        if (returnOrderId) {
            // Pre-fill the return form
            openReturnModal();
            const orderIdInput = document.querySelector('#returnForm input[name="orderId"]');
            if (orderIdInput) {
                orderIdInput.value = returnOrderId;
            }
            // Clear the stored order ID
            localStorage.removeItem('returnOrderId');
        }
    }
});
