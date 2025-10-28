# 👤 User Profile Implementation

## User Profile Page
**File: `profile.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile | Pyramid</title>
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

        .profile-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
            max-width: 1200px;
            overflow: hidden;
        }

        .profile-header {
            background: linear-gradient(135deg, #65AAC3, #5F9FB6);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .profile-nav {
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

        .profile-content {
            padding: 30px;
        }

        .profile-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
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

        .order-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            border-left: 5px solid #65AAC3;
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
    <nav class="navbar navbar-expand-lg shadow-sm sticky-top" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
        <div class="container">
            <img class="mx-2" src="img/pyramidal.png" width="40px" height="40px">
            <a class="navbar-brand" href="index.html" style="font-weight: 700; color: #65AAC3;">PYRAMID</a>
            <div class="ms-auto">
                <a href="index.html" class="btn btn-outline-primary">
                    <i class="fas fa-home"></i> Back to Home
                </a>
            </div>
        </div>
    </nav>

    <div class="profile-container">
        <div class="profile-header">
            <h1><i class="fas fa-user-circle"></i> My Profile</h1>
            <p id="welcomeMessage">Welcome back!</p>
        </div>

        <div class="profile-nav">
            <ul class="nav nav-tabs" id="profileTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab">
                        <i class="fas fa-user"></i> Profile Info
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="orders-tab" data-bs-toggle="tab" data-bs-target="#orders" type="button" role="tab">
                        <i class="fas fa-shopping-cart"></i> My Orders
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="security-tab" data-bs-toggle="tab" data-bs-target="#security" type="button" role="tab">
                        <i class="fas fa-lock"></i> Security
                    </button>
                </li>
            </ul>
        </div>

        <div class="profile-content">
            <div class="tab-content" id="profileTabContent">
                <!-- Profile Info Tab -->
                <div class="tab-pane fade show active" id="profile" role="tabpanel">
                    <div class="profile-card">
                        <h4 class="mb-4">Profile Information</h4>
                        <form id="profileForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="userName" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Email Address</label>
                                        <input type="email" class="form-control" id="userEmail" readonly>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Phone Number</label>
                                        <input type="tel" class="form-control" id="userPhone">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Role</label>
                                        <input type="text" class="form-control" id="userRole" readonly>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Update Profile
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Orders Tab -->
                <div class="tab-pane fade" id="orders" role="tabpanel">
                    <div class="profile-card">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4>My Orders</h4>
                            <button class="btn btn-primary" onclick="loadOrders()">
                                <i class="fas fa-refresh"></i> Refresh
                            </button>
                        </div>
                        <div id="ordersContainer"></div>
                    </div>
                </div>

                <!-- Security Tab -->
                <div class="tab-pane fade" id="security" role="tabpanel">
                    <div class="profile-card">
                        <h4 class="mb-4">Change Password</h4>
                        <form id="passwordForm">
                            <div class="mb-3">
                                <label class="form-label">Current Password</label>
                                <input type="password" class="form-control" id="currentPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">New Password</label>
                                <input type="password" class="form-control" id="newPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Confirm New Password</label>
                                <input type="password" class="form-control" id="confirmPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-key"></i> Change Password
                            </button>
                        </form>
                    </div>
                    
                    <div class="profile-card">
                        <h4 class="mb-4">Account Actions</h4>
                        <button class="btn btn-danger" onclick="logout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Check authentication
        document.addEventListener('DOMContentLoaded', function() {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!token) {
                alert('Please login to access your profile');
                window.location.href = 'login.html';
                return;
            }
            
            loadProfile();
        });

        // Load profile data
        function loadProfile() {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.name}!`;
            document.getElementById('userName').value = user.name || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('userRole').value = user.role || 'user';
        }

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

        // Load user orders
        async function loadOrders() {
            try {
                const orders = await apiCall('/orders/myorders');
                const container = document.getElementById('ordersContainer');
                
                if (orders.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-shopping-cart"></i>
                            <h5>No orders yet</h5>
                            <p>Start shopping to see your orders here</p>
                            <a href="index.html" class="btn btn-primary">Start Shopping</a>
                        </div>
                    `;
                    return;
                }

                const ordersHTML = orders.map(order => `
                    <div class="order-card">
                        <div class="row">
                            <div class="col-md-8">
                                <h6>Order #${order.orderNumber}</h6>
                                <p class="mb-1">
                                    <strong>${order.orderItems.length} items</strong> • 
                                    <span class="status-badge status-${order.status}">${order.status}</span>
                                </p>
                                <p class="text-muted mb-0">
                                    Ordered on ${new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div class="col-md-4 text-end">
                                <h5 class="text-primary">₹${order.totalPrice}</h5>
                                <p class="mb-0">
                                    <span class="badge ${order.isPaid ? 'bg-success' : 'bg-warning'}">
                                        ${order.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            ${order.orderItems.map(item => `
                                <div class="col-md-6 mb-2">
                                    <div class="d-flex align-items-center">
                                        <img src="${item.image || 'img/default-product.jpg'}" 
                                             alt="${item.name}" 
                                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px; margin-right: 10px;">
                                        <div>
                                            <small><strong>${item.name}</strong></small><br>
                                            <small class="text-muted">Qty: ${item.quantity} • ₹${item.price}</small>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
                
                container.innerHTML = ordersHTML;
            } catch (error) {
                console.error('Error loading orders:', error);
                document.getElementById('ordersContainer').innerHTML = '<div class="empty-state">Error loading orders</div>';
            }
        }

        // Load orders when tab is clicked
        document.getElementById('orders-tab').addEventListener('click', loadOrders);

        // Profile form submission
        document.getElementById('profileForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            alert('Profile update functionality coming soon!');
        });

        // Password form submission
        document.getElementById('passwordForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            alert('Password change functionality coming soon!');
            this.reset();
        });

        // Logout function
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        }
    </script>
</body>
</html>
```

## Navigation Updates
**Add to `script.js`:**

```javascript
// Admin panel access
const checkAdminAccess = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

// Add admin link to navbar for admin users
const addAdminLink = () => {
  if (checkAdminAccess()) {
    const navbar = document.querySelector('.navbar-nav');
    if (navbar && !document.getElementById('adminLink')) {
      const adminLi = document.createElement('li');
      adminLi.className = 'nav-item';
      adminLi.innerHTML = '<a class="nav-link" href="admin.html" id="adminLink"><i class="fas fa-crown"></i> Admin</a>';
      navbar.appendChild(adminLi);
    }
  }
};

// Update user profile click handler
const updateNavbar = () => {
  const userProfileBtn = document.getElementById('userProfile');
  if (userProfileBtn) {
    if (isLoggedIn()) {
      const user = getCurrentUser();
      userProfileBtn.innerHTML = `<i class="fa-solid fa-user"></i>`;
      userProfileBtn.title = `Welcome, ${user.name}`;
      
      // Add profile page navigation
      userProfileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'profile.html';
      });
    } else {
      userProfileBtn.innerHTML = `<i class="fa-regular fa-user"></i>`;
      userProfileBtn.title = 'Login';
    }
  }
};

// Update navbar function to include admin link
const updateNavbarWithAdmin = () => {
  updateNavbar();
  addAdminLink();
};

// Override the original updateNavbar call
document.addEventListener('DOMContentLoaded', function() {
  updateNavbarWithAdmin();
  updateCartBadge();
});
```