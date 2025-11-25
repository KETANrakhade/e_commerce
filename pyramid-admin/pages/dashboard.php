<?php
// Include API client
require_once __DIR__ . '/../config/api_client.php';

// Get dashboard data from Node.js backend API
$apiClient = getApiClient();
$dashboardStats = $apiClient->getDashboardStats();
$recentOrders = $apiClient->getRecentOrders();
$salesAnalytics = $apiClient->getSalesAnalytics();

// Extract stats from response
if ($dashboardStats['success'] && isset($dashboardStats['data'])) {
    $stats = $dashboardStats['data'];
    
    // Transform ordersByStatus from MongoDB aggregation format to associative array
    // Backend returns: [{_id: 'pending', count: 5}, {_id: 'shipped', count: 3}]
    // We need: {'pending': 5, 'shipped': 3}
    if (isset($stats['ordersByStatus']) && is_array($stats['ordersByStatus'])) {
        $ordersByStatusArray = [];
        foreach ($stats['ordersByStatus'] as $item) {
            if (is_array($item) && isset($item['_id']) && isset($item['count'])) {
                $ordersByStatusArray[$item['_id']] = (int)$item['count'];
            } elseif (is_object($item) && isset($item->_id) && isset($item->count)) {
                $ordersByStatusArray[$item->_id] = (int)$item->count;
            }
        }
        $stats['ordersByStatus'] = $ordersByStatusArray;
    } else {
        $stats['ordersByStatus'] = [];
    }
} else {
    $stats = [
        'totalOrders' => 0,
        'totalRevenue' => 0,
        'totalProducts' => 0,
        'totalUsers' => 0,
        'ordersByStatus' => []
    ];
}

// Extract orders from response
if ($recentOrders['success'] && isset($recentOrders['data'])) {
    $orders = is_array($recentOrders['data']) ? $recentOrders['data'] : [];
} else {
    $orders = [];
}

// Extract analytics from response
if ($salesAnalytics['success'] && isset($salesAnalytics['data'])) {
    $analytics = $salesAnalytics['data'];
} else {
    $analytics = ['salesData' => []];
}

// Handle API errors
$apiError = '';
$authError = false;
if (!$dashboardStats['success']) {
    if (isset($dashboardStats['http_code']) && $dashboardStats['http_code'] === 401) {
        $apiError = 'Authentication failed. Please <a href="login.php">login again</a>.';
        $authError = true;
    } elseif (isset($dashboardStats['http_code']) && $dashboardStats['http_code'] === 0) {
        $apiError = 'Connection error: Could not reach backend server. Make sure backend is running on port 5001.';
    } elseif (isset($dashboardStats['data']['error'])) {
        $apiError = 'Error: ' . $dashboardStats['data']['error'];
        if (strpos($dashboardStats['data']['error'], 'authorized') !== false || strpos($dashboardStats['data']['error'], 'token') !== false) {
            $authError = true;
            $apiError = 'Authentication failed. Please <a href="login.php">login again</a>.';
        }
    } else {
        $apiError = 'Failed to load dashboard data. Please ensure your backend server is running on port 5001.';
    }
}
?>

<div class="main-content">
    <div class="page-content">
        <div class="container-fluid">
            <!-- start page title -->
            <div class="row">
                <div class="col-12">
                    <div class="page-title-box d-sm-flex align-items-center justify-content-between">
                        <h4 class="mb-sm-0 font-size-18">Dashboard</h4>
                        <div class="page-title-right">
                            <ol class="breadcrumb m-0">
                                <li class="breadcrumb-item"><a href="javascript: void(0);">Admin</a></li>
                                <li class="breadcrumb-item active">Dashboard</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <!-- end page title -->

            <!-- Welcome Card -->
            <div class="row">
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="d-flex">
                                        <div class="flex-shrink-0 me-3">
                                            <img src="assets/images/users/avatar-1.jpg" alt="" class="avatar-md rounded-circle img-thumbnail">
                                        </div>
                                        <div class="flex-grow-1 align-self-center">
                                            <div class="text-muted">
                                                <p class="mb-2">Welcome to E-Commerce Admin</p>
                                                <h5 class="mb-1"><?php echo htmlspecialchars($admin_user['name'] ?? 'Admin'); ?></h5>
                                                <p class="mb-0">Administrator</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-4 align-self-center">
                                    <div class="text-lg-center mt-4 mt-lg-0">
                                        <div class="row">
                                            <div class="col-4">
                                                <div>
                                                    <p class="text-muted text-truncate mb-2">Total Orders</p>
                                                    <h5 class="mb-0"><?php echo number_format($stats['totalOrders'] ?? 0); ?></h5>
                                                </div>
                                            </div>
                                            <div class="col-4">
                                                <div>
                                                    <p class="text-muted text-truncate mb-2">Products</p>
                                                    <h5 class="mb-0"><?php echo number_format($stats['totalProducts'] ?? 0); ?></h5>
                                                </div>
                                            </div>
                                            <div class="col-4">
                                                <div>
                                                    <p class="text-muted text-truncate mb-2">Users</p>
                                                    <h5 class="mb-0"><?php echo number_format($stats['totalUsers'] ?? 0); ?></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-4 d-none d-lg-block">
                                    <div class="clearfix mt-4 mt-lg-0">
                                        <div class="dropdown float-end">
                                            <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <i class="bx bxs-cog align-middle me-1"></i> Quick Actions
                                            </button>
                                            <div class="dropdown-menu dropdown-menu-end">
                                                <a class="dropdown-item" href="index.php?page=products">Add Product</a>
                                                <a class="dropdown-item" href="index.php?page=orders">View Orders</a>
                                                <a class="dropdown-item" href="index.php?page=users">Manage Users</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="row">
                <div class="col-xl-3 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="avatar-xs me-3">
                                    <span class="avatar-title rounded-circle bg-primary-subtle text-primary font-size-18">
                                        <i class="bx bx-copy-alt"></i>
                                    </span>
                                </div>
                                <h5 class="font-size-14 mb-0">Total Orders</h5>
                            </div>
                            <div class="text-muted mt-4">
                                <h4><?php echo number_format($stats['totalOrders'] ?? 0); ?></h4>
                                <div class="d-flex">
                                    <span class="badge badge-soft-success font-size-12">Active</span>
                                    <span class="ms-2 text-truncate">All time orders</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="avatar-xs me-3">
                                    <span class="avatar-title rounded-circle bg-primary-subtle text-primary font-size-18">
                                        <i class="bx bx-archive-in"></i>
                                    </span>
                                </div>
                                <h5 class="font-size-14 mb-0">Revenue</h5>
                            </div>
                            <div class="text-muted mt-4">
                                <h4>₹ <?php echo number_format($stats['totalRevenue'] ?? 0, 2); ?></h4>
                                <div class="d-flex">
                                    <span class="badge badge-soft-success font-size-12">Total</span>
                                    <span class="ms-2 text-truncate">All time revenue</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="avatar-xs me-3">
                                    <span class="avatar-title rounded-circle bg-primary-subtle text-primary font-size-18">
                                        <i class="bx bx-package"></i>
                                    </span>
                                </div>
                                <h5 class="font-size-14 mb-0">Products</h5>
                            </div>
                            <div class="text-muted mt-4">
                                <h4><?php echo number_format($stats['totalProducts'] ?? 0); ?></h4>
                                <div class="d-flex">
                                    <span class="badge badge-soft-info font-size-12">Active</span>
                                    <span class="ms-2 text-truncate">Total products</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="avatar-xs me-3">
                                    <span class="avatar-title rounded-circle bg-primary-subtle text-primary font-size-18">
                                        <i class="bx bx-user"></i>
                                    </span>
                                </div>
                                <h5 class="font-size-14 mb-0">Users</h5>
                            </div>
                            <div class="text-muted mt-4">
                                <h4><?php echo number_format($stats['totalUsers'] ?? 0); ?></h4>
                                <div class="d-flex">
                                    <span class="badge badge-soft-warning font-size-12">Registered</span>
                                    <span class="ms-2 text-truncate">Total users</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts and Recent Orders -->
            <div class="row">
                <div class="col-xl-8">
                    <div class="card">
                        <div class="card-body">
                            <div class="clearfix">
                                <div class="float-end">
                                    <div class="input-group input-group-sm">
                                        <select class="form-select form-select-sm" id="salesPeriod">
                                            <option value="30">Last 30 Days</option>
                                            <option value="7">Last 7 Days</option>
                                            <option value="90">Last 90 Days</option>
                                        </select>
                                        <label class="input-group-text">Period</label>
                                    </div>
                                </div>
                                <h4 class="card-title mb-4">Sales Analytics</h4>
                            </div>
                            <div id="sales-chart" class="apex-charts" data-colors='["--bs-primary"]' dir="ltr"></div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-4">
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title mb-4">Order Status</h4>
                            <div id="order-status-chart" data-colors='["--bs-primary", "--bs-success", "--bs-warning", "--bs-danger", "--bs-info"]' class="apex-charts"></div>
                            
                            <div class="text-center text-muted mt-4">
                                <?php if (!empty($stats['ordersByStatus'])): ?>
                                    <?php foreach ($stats['ordersByStatus'] as $status => $count): ?>
                                        <div class="row mb-2">
                                            <div class="col-6 text-start">
                                                <i class="mdi mdi-circle text-primary me-1"></i> <?php echo ucfirst($status); ?>
                                            </div>
                                            <div class="col-6 text-end">
                                                <strong><?php echo $count; ?></strong>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Orders -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-sm-flex flex-wrap">
                                <h4 class="card-title mb-4">Recent Orders</h4>
                                <div class="ms-auto">
                                    <a href="index.php?page=orders" class="btn btn-primary btn-sm">View All Orders</a>
                                </div>
                            </div>

                            <div class="table-responsive">
                                <table class="table align-middle table-nowrap mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Status</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (!empty($orders)): ?>
                                            <?php foreach (array_slice($orders, 0, 5) as $order): ?>
                                                <tr>
                                                    <td>
                                                        <a href="javascript: void(0);" class="text-body fw-bold"><?php echo htmlspecialchars($order['orderNumber']); ?></a>
                                                    </td>
                                                    <td><?php echo htmlspecialchars($order['user']['name'] ?? 'N/A'); ?></td>
                                                    <td>
                                                        <span class="badge badge-pill badge-soft-<?php 
                                                            echo match($order['status']) {
                                                                'delivered' => 'success',
                                                                'shipped' => 'info',
                                                                'processing' => 'warning',
                                                                'cancelled' => 'danger',
                                                                default => 'secondary'
                                                            };
                                                        ?> font-size-11"><?php echo ucfirst($order['status']); ?></span>
                                                    </td>
                                                    <td>₹ <?php echo number_format($order['totalPrice'], 2); ?></td>
                                                    <td><?php echo date('M d, Y', strtotime($order['createdAt'])); ?></td>
                                                    <td>
                                                        <div class="d-flex gap-3">
                                                            <a href="javascript:void(0);" class="text-success" onclick="viewOrder('<?php echo $order['_id']; ?>')">
                                                                <i class="mdi mdi-eye font-size-18"></i>
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            <?php endforeach; ?>
                                        <?php else: ?>
                                            <tr>
                                                <td colspan="6" class="text-center">No recent orders found</td>
                                            </tr>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initSalesChart();
    initOrderStatusChart();
    
    // Sales period change handler
    document.getElementById('salesPeriod').addEventListener('change', function() {
        loadSalesData(this.value);
    });
});

function initSalesChart() {
    const salesData = <?php echo json_encode($analytics['salesData'] ?? []); ?>;
    
    const options = {
        series: [{
            name: 'Revenue',
            data: salesData.map(item => item.revenue || 0)
        }],
        chart: {
            type: 'area',
            height: 350,
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            categories: salesData.map(item => item._id || '')
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return '₹' + val.toLocaleString();
                }
            }
        },
        colors: ['#556ee6']
    };

    if (document.getElementById('sales-chart')) {
        const chart = new ApexCharts(document.querySelector("#sales-chart"), options);
        chart.render();
    }
}

function initOrderStatusChart() {
    const ordersByStatus = <?php echo json_encode($stats['ordersByStatus'] ?? []); ?>;
    
    const labels = Object.keys(ordersByStatus);
    const series = Object.values(ordersByStatus);
    
    const options = {
        series: series,
        chart: {
            type: 'donut',
            height: 300
        },
        labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
        colors: ['#556ee6', '#34c38f', '#f1b44c', '#f46a6a', '#50a5f1'],
        legend: {
            show: false
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                }
            }
        }]
    };

    if (document.getElementById('order-status-chart')) {
        const chart = new ApexCharts(document.querySelector("#order-status-chart"), options);
        chart.render();
    }
}

function loadSalesData(period) {
    // Reload sales data for different period
    fetch(`/api/admin/sales-analytics?period=${period}`, {
        headers: {
            'Authorization': 'Bearer <?php echo $_SESSION['admin_token']; ?>'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update chart with new data
            initSalesChart();
        }
    })
    .catch(error => console.error('Error loading sales data:', error));
}

function viewOrder(orderId) {
    // Redirect to order details or open modal
    window.location.href = `index.php?page=orders&action=view&id=${orderId}`;
}
</script>