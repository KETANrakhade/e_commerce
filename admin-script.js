// Admin Panel JavaScript
const API_BASE = 'http://localhost:5001/api';
let adminToken = localStorage.getItem('adminToken');
let salesChart, statusChart;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginSpinner = document.getElementById('loginSpinner');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (adminToken) {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
    
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu a[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            showPage(page);
            
            // Update active state
            document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoginSpinner(true);
    hideLoginError();
    
    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            adminToken = result.data.token;
            localStorage.setItem('adminToken', adminToken);
            localStorage.setItem('adminUser', JSON.stringify(result.data));
            
            showAdminPanel();
        } else {
            showLoginError(result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Unable to connect to server. Please ensure the backend is running.');
    } finally {
        showLoginSpinner(false);
    }
}

function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    adminToken = null;
    showLoginScreen();
}

// UI Functions
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    adminPanel.classList.add('hidden');
}

function showAdminPanel() {
    loginScreen.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    
    // Set admin name
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    document.getElementById('adminName').textContent = adminUser.name || 'Admin User';
    
    // Load dashboard data
    loadDashboardData();
}

function showLoginSpinner(show) {
    if (show) {
        loginSpinner.classList.remove('hidden');
    } else {
        loginSpinner.classList.add('hidden');
    }
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
}

function hideLoginError() {
    loginError.classList.add('hidden');
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName).classList.add('active');
    
    // Load page data
    switch(pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

// API Functions
async function makeApiCall(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        ...options
    };
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        // Load stats
        const stats = await makeApiCall('/admin/stats');
        updateDashboardStats(stats.data);
        
        // Load recent orders
        const orders = await makeApiCall('/admin/recent-orders');
        updateRecentOrders(orders.data);
        
        // Load sales analytics
        const analytics = await makeApiCall('/admin/sales-analytics');
        updateCharts(analytics.data);
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function updateDashboardStats(stats) {
    document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
    document.getElementById('totalRevenue').textContent = `₹${(stats.totalRevenue || 0).toLocaleString()}`;
    document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
    document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
}

function updateRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersTable');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent orders</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.orderNumber || 'N/A'}</td>
            <td>${order.user?.name || 'Unknown'}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>₹${(order.totalPrice || 0).toLocaleString()}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function updateCharts(analytics) {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    
    if (salesChart) {
        salesChart.destroy();
    }
    
    const salesData = analytics.salesData || [];
    
    salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: salesData.map(item => item._id),
            datasets: [{
                label: 'Revenue',
                data: salesData.map(item => item.revenue),
                borderColor: '#65AAC3',
                backgroundColor: 'rgba(101, 170, 195, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Status Chart
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    
    if (statusChart) {
        statusChart.destroy();
    }
    
    // Mock status data for now
    const statusData = [
        { status: 'pending', count: 5 },
        { status: 'confirmed', count: 8 },
        { status: 'shipped', count: 12 },
        { status: 'delivered', count: 25 }
    ];
    
    statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: statusData.map(item => item.status),
            datasets: [{
                data: statusData.map(item => item.count),
                backgroundColor: [
                    '#ffc107',
                    '#28a745',
                    '#17a2b8',
                    '#6f42c1'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Products Functions
async function loadProducts() {
    try {
        const result = await makeApiCall('/admin/products');
        updateProductsTable(result.data.products);
    } catch (error) {
        console.error('Failed to load products:', error);
        document.getElementById('productsTable').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">Failed to load products</td></tr>';
    }
}

function updateProductsTable(products) {
    const tbody = document.getElementById('productsTable');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.images?.[0] || 'img/default-product.jpg'}" 
                     alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.price.toLocaleString()}</td>
            <td>${product.stock}</td>
            <td>
                <span class="badge ${product.isActive ? 'bg-success' : 'bg-secondary'}">
                    ${product.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct('${product._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Orders Functions
async function loadOrders() {
    try {
        const result = await makeApiCall('/admin/orders');
        updateOrdersTable(result.data.orders);
    } catch (error) {
        console.error('Failed to load orders:', error);
        document.getElementById('ordersTable').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">Failed to load orders</td></tr>';
    }
}

function updateOrdersTable(orders) {
    const tbody = document.getElementById('ordersTable');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.orderNumber || 'N/A'}</td>
            <td>${order.user?.name || 'Unknown'}</td>
            <td>${order.orderItems?.length || 0} items</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>₹${(order.totalPrice || 0).toLocaleString()}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewOrder('${order._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <select class="form-select form-select-sm" style="width: auto; display: inline-block;" 
                        onchange="updateOrderStatus('${order._id}', this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

// Users Functions
async function loadUsers() {
    try {
        const result = await makeApiCall('/admin/users');
        updateUsersTable(result.data.users);
    } catch (error) {
        console.error('Failed to load users:', error);
        document.getElementById('usersTable').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Failed to load users</td></tr>';
    }
}

function updateUsersTable(users) {
    const tbody = document.getElementById('usersTable');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">
                    ${user.role}
                </span>
            </td>
            <td>
                <span class="badge ${user.isActive ? 'bg-success' : 'bg-secondary'}">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewUser('${user._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}" 
                        onclick="toggleUserStatus('${user._id}', ${!user.isActive})">
                    <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Action Functions
async function updateOrderStatus(orderId, status) {
    try {
        await makeApiCall(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        showNotification('Order status updated successfully', 'success');
        loadOrders(); // Reload orders
    } catch (error) {
        console.error('Failed to update order status:', error);
        showNotification('Failed to update order status', 'error');
    }
}

async function toggleUserStatus(userId, isActive) {
    try {
        await makeApiCall(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isActive })
        });
        
        showNotification(`User ${isActive ? 'activated' : 'deactivated'} successfully`, 'success');
        loadUsers(); // Reload users
    } catch (error) {
        console.error('Failed to update user status:', error);
        showNotification('Failed to update user status', 'error');
    }
}

function editProduct(productId) {
    // TODO: Implement product editing
    showNotification('Product editing feature coming soon', 'info');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        // TODO: Implement product deletion
        showNotification('Product deletion feature coming soon', 'info');
    }
}

function viewOrder(orderId) {
    // TODO: Implement order details view
    showNotification('Order details view coming soon', 'info');
}

function viewUser(userId) {
    // TODO: Implement user details view
    showNotification('User details view coming soon', 'info');
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}