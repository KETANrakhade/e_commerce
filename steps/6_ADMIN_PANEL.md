# 👑 Admin Panel Implementation

## Complete Admin Panel
**File: `admin.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel | Pyramid</title>
    <link rel="icon" type="image/x-icon" href="/img/bars.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .admin-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
            max-width: 1400px;
            overflow: hidden;
        }

        .admin-header {
            background: linear-gradient(135deg, #65AAC3, #5F9FB6);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .admin-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .admin-nav {
            background: white;
            padding: 20px;
            border-bottom: 1px solid #eee;
        }

        .nav-tabs {
            border: none;
        }

        .nav-tabs .nav-link {
            border: none;
            color: #65AAC3;
            font-weight: 600;
            padding: 15px 25px;
            margin-right: 10px;
            border-radius: 10px;
            transition: all 0.3s ease;
        }

        .nav-tabs .nav-link.active {
            background: linear-gradient(135deg, #65AAC3, #5F9FB6);
            color: white;
        }

        .nav-tabs .nav-link:hover {
            background: rgba(101, 170, 195, 0.1);
        }

        .admin-content {
            padding: 30px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border-left: 5px solid #65AAC3;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-card h3 {
            color: #65AAC3;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .stat-card p {
            color: #666;
            font-size: 1.1rem;
            margin: 0;
        }

        .data-table {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .table {
            margin: 0;
        }

        .table thead {
            background: linear-gradient(135deg, #65AAC3, #5F9FB6);
            color: white;
        }

        .table th {
            border: none;
            padding: 15px;
            font-weight: 600;
        }

        .table td {
            padding: 15px;
            border-color: #f0f0f0;
        }

        .btn-action {
            padding: 8px 15px;
            border-radius: 8px;
            border: none;
            font-weight: 500;
            margin-right: 5px;
            transition: all 0.3s ease;
        }

        .btn-edit {
            background: #28a745;
            color: white;
        }

        .btn-delete {
            background: #dc3545;
            color: white;
        }

        .btn-view {
            background: #17a2b8;
            color: white;
        }

        .btn-action:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .status-pending { background: #fff3cd; color: #856404; }
        .status-confirmed { background: #d4edda; color: #155724; }
        .status-shipped { background: #cce5ff; color: #004085; }
        .status-delivered { background: #d1ecf1; color: #0c5460; }
        .status-cancelled { background: #f8d7da; color: #721c24; }

        .modal-content {
            border-radius: 15px;
            border: none;
        }

        .modal-header {
            background: linear-gradient(135deg, #65AAC3, #5F9FB6);
            color: white;
            border-radius: 15px 15px 0 0;
        }

        .form-control {
            border-radius: 10px;
            border: 2px solid #e9ecef;
            padding: 12px 15px;
            transition: all 0.3s ease;
        }

        .form-control:focus {
            border-color: #65AAC3;
            box-shadow: 0 0 0 0.2rem rgba(101, 170, 195, 0.25);
        }

        .btn-primary {
            background: linear-gradient(135deg, #65AAC3, #5F9FB6);
            border: none;
            border-radius: 10px;
            padding: 12px 25px;
            font-weight: 600;
        }

        .loading {
            text-align: center;
            padding: 50px;
            color: #666;
        }

        .empty-state {
            text-align: center;
            padding: 50px;
            color: #666;
        }

        .empty-state i {
            font-size: 4rem;
            margin-bottom: 20px;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="admin-header">
            <h1><i class="fas fa-crown"></i> Admin Dashboard</h1>
            <p>Manage your Pyramid e-commerce platform</p>
        </div>

        <div class="admin-nav">
            <ul class="nav nav-tabs" id="adminTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                        <i class="fas fa-chart-bar"></i> Dashboard
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="orders-tab" data-bs-toggle="tab" data-bs-target="#orders" type="button" role="tab">
                        <i class="fas fa-shopping-cart"></i> Orders
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="products-tab" data-bs-toggle="tab" data-bs-target="#products" type="button" role="tab">
                        <i class="fas fa-box"></i> Products
                    </button>
                </li>
            </ul>
        </div>

        <div class="admin-content">
            <div class="tab-content" id="adminTabContent">
                <!-- Dashboard Tab -->
                <div class="tab-pane fade show active" id="dashboard" role="tabpanel">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3 id="totalOrders">-</h3>
                            <p><i class="fas fa-shopping-cart"></i> Total Orders</p>
                        </div>
                        <div class="stat-card">
                            <h3 id="totalProducts">-</h3>
                            <p><i class="fas fa-box"></i> Total Products</p>
                        </div>
                        <div class="stat-card">
                            <h3 id="totalUsers">-</h3>
                            <p><i class="fas fa-users"></i> Total Users</p>
                        </div>
                        <div class="stat-card">
                            <h3 id="totalRevenue">₹-</h3>
                            <p><i class="fas fa-rupee-sign"></i> Total Revenue</p>
                        </div>
                    </div>
                    
                    <div class="data-table">
                        <h4 class="p-3 mb-0">Recent Orders</h4>
                        <div id="recentOrdersTable"></div>
                    </div>
                </div>

                <!-- Orders Tab -->
                <div class="tab-pane fade" id="orders" role="tabpanel">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4>All Orders</h4>
                        <button class="btn btn-primary" onclick="refreshOrders()">
                            <i class="fas fa-refresh"></i> Refresh
                        </button>
                    </div>
                    <div class="data-table">
                        <div id="ordersTable"></div>
                    </div>
                </div>

                <!-- Products Tab -->
                <div class="tab-pane fade" id="products" role="tabpanel">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4>All Products</h4>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productModal">
                            <i class="fas fa-plus"></i> Add Product
                        </button>
                    </div>
                    <div class="data-table">
                        <div id="productsTable"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Product Modal -->
    <div class="modal fade" id="productModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add/Edit Product</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="productForm">
                        <input type="hidden" id="productId">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Product Name</label>
                                    <input type="text" class="form-control" id="productName" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Price (₹)</label>
                                    <input type="number" class="form-control" id="productPrice" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Category</label>
                                    <select class="form-control" id="productCategory" required>
                                        <option value="">Select Category</option>
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                        <option value="Footwear">Footwear</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Stock</label>
                                    <input type="number" class="form-control" id="productStock" required>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea class="form-control" id="productDescription" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Image URL</label>
                            <input type="url" class="form-control" id="productImage" placeholder="https://example.com/image.jpg">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveProduct()">Save Product</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Check admin authentication
        document.addEventListener('DOMContentLoaded', function() {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!token || user.role !== 'admin') {
                alert('Access denied. Admin privileges required.');
                window.location.href = 'login.html';
                return;
            }
            
            loadDashboard();
        });

        // API helper function
        async function apiCall(endpoint, options = {}) {
            const token = localStorage.getItem('token');
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            
            const response = await fetch(`http://localhost:5000/api${endpoint}`, {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...options.headers }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response.json();
        }

        // Load dashboard data
        async function loadDashboard() {
            try {
                const [orders, products] = await Promise.all([
                    apiCall('/orders'),
                    apiCall('/products')
                ]);

                // Update stats
                document.getElementById('totalOrders').textContent = orders.length;
                document.getElementById('totalProducts').textContent = products.products ? products.products.length : products.length;
                
                const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
                document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;

                // Load recent orders
                loadRecentOrders(orders.slice(0, 5));
                
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        }

        // Load recent orders table
        function loadRecentOrders(orders) {
            const container = document.getElementById('recentOrdersTable');
            
            if (orders.length === 0) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><h5>No orders yet</h5></div>';
                return;
            }

            const tableHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>${order.orderNumber}</td>
                                <td>${order.shippingAddress.name}</td>
                                <td>₹${order.totalPrice}</td>
                                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHTML;
        }

        // Load orders
        async function loadOrders() {
            try {
                const orders = await apiCall('/orders');
                const container = document.getElementById('ordersTable');
                
                if (orders.length === 0) {
                    container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><h5>No orders found</h5></div>';
                    return;
                }

                const tableHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr>
                                    <td>${order.orderNumber}</td>
                                    <td>
                                        <strong>${order.shippingAddress.name}</strong><br>
                                        <small>${order.shippingAddress.phone}</small>
                                    </td>
                                    <td>${order.orderItems.length} items</td>
                                    <td>₹${order.totalPrice}</td>
                                    <td>
                                        <span class="badge ${order.isPaid ? 'bg-success' : 'bg-warning'}">${order.isPaid ? 'Paid' : 'Pending'}</span><br>
                                        <small>${order.paymentMethod}</small>
                                    </td>
                                    <td>
                                        <select class="form-select form-select-sm" onchange="updateOrderStatus('${order._id}', this.value)">
                                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                        </select>
                                    </td>
                                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn-action btn-view" onclick="viewOrder('${order._id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                
                container.innerHTML = tableHTML;
            } catch (error) {
                console.error('Error loading orders:', error);
                document.getElementById('ordersTable').innerHTML = '<div class="loading">Error loading orders</div>';
            }
        }

        // Load products
        async function loadProducts() {
            try {
                const data = await apiCall('/products');
                const products = data.products || data;
                const container = document.getElementById('productsTable');
                
                if (products.length === 0) {
                    container.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><h5>No products found</h5></div>';
                    return;
                }

                const tableHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr>
                                    <td>
                                        <img src="${product.images && product.images[0] ? product.images[0] : 'img/default-product.jpg'}" 
                                             alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                                    </td>
                                    <td>
                                        <strong>${product.name}</strong><br>
                                        <small class="text-muted">${product.description ? product.description.substring(0, 50) + '...' : ''}</small>
                                    </td>
                                    <td>${product.category || 'N/A'}</td>
                                    <td>₹${product.price}</td>
                                    <td>
                                        <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                                            ${product.stock || 0}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-action btn-edit" onclick="editProduct('${product._id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-action btn-delete" onclick="deleteProduct('${product._id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                
                container.innerHTML = tableHTML;
            } catch (error) {
                console.error('Error loading products:', error);
                document.getElementById('productsTable').innerHTML = '<div class="loading">Error loading products</div>';
            }
        }

        // Tab change handlers
        document.getElementById('orders-tab').addEventListener('click', loadOrders);
        document.getElementById('products-tab').addEventListener('click', loadProducts);

        // Update order status
        async function updateOrderStatus(orderId, status) {
            try {
                await apiCall(`/orders/${orderId}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status })
                });
                
                alert('Order status updated successfully!');
                loadOrders();
            } catch (error) {
                console.error('Error updating order status:', error);
                alert('Failed to update order status');
            }
        }

        // View order details
        function viewOrder(orderId) {
            alert(`View order details for: ${orderId}`);
        }

        // Edit product
        async function editProduct(productId) {
            try {
                const product = await apiCall(`/products/${productId}`);
                
                document.getElementById('productId').value = product._id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productCategory').value = product.category || '';
                document.getElementById('productStock').value = product.stock || 0;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productImage').value = product.images && product.images[0] ? product.images[0] : '';
                
                new bootstrap.Modal(document.getElementById('productModal')).show();
            } catch (error) {
                console.error('Error loading product:', error);
                alert('Failed to load product details');
            }
        }

        // Delete product
        async function deleteProduct(productId) {
            if (!confirm('Are you sure you want to delete this product?')) return;
            
            try {
                await apiCall(`/products/${productId}`, { method: 'DELETE' });
                alert('Product deleted successfully!');
                loadProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }

        // Save product
        async function saveProduct() {
            const productId = document.getElementById('productId').value;
            const productData = {
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                stock: parseInt(document.getElementById('productStock').value),
                description: document.getElementById('productDescription').value,
                images: document.getElementById('productImage').value ? [document.getElementById('productImage').value] : []
            };

            try {
                if (productId) {
                    await apiCall(`/products/${productId}`, {
                        method: 'PUT',
                        body: JSON.stringify(productData)
                    });
                    alert('Product updated successfully!');
                } else {
                    await apiCall('/products', {
                        method: 'POST',
                        body: JSON.stringify(productData)
                    });
                    alert('Product created successfully!');
                }
                
                bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
                document.getElementById('productForm').reset();
                loadProducts();
            } catch (error) {
                console.error('Error saving product:', error);
                alert('Failed to save product');
            }
        }

        // Refresh functions
        function refreshOrders() {
            loadOrders();
        }
    </script>
</body>
</html>
```