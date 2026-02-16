<?php
// Suppress warnings and notices for cleaner user interface
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 0);

// Include API client
require_once __DIR__ . '/../config/api_client.php';

// Handle order actions
$action = $_GET['action'] ?? 'list';
$orderId = $_GET['id'] ?? '';

// Get orders data from API
$page = $_GET['p'] ?? 1;
$search = $_GET['search'] ?? '';
$status = $_GET['status'] ?? '';
$startDate = $_GET['start_date'] ?? '';
$endDate = $_GET['end_date'] ?? '';

// Build query parameters for orders API
$params = [
    'page' => $page,
    'limit' => 20
];
if ($search) $params['search'] = $search;
if ($status) $params['status'] = $status;
if ($startDate) $params['startDate'] = $startDate;
if ($endDate) $params['endDate'] = $endDate;

// Fetch orders from API
$apiClient = getApiClient();
$ordersData = $apiClient->getAdminOrders($params);

// Extract orders and pagination from response
// Handle different response structures
if ($ordersData['success'] && isset($ordersData['data'])) {
    $data = $ordersData['data'];
    
    // Check if orders are directly in data or nested
    if (isset($data['orders'])) {
        // Structure: { data: { orders: [...], pagination: {...}, statuses: [...] } }
        $allOrders = $data['orders'] ?? [];
        $pagination = $data['pagination'] ?? [
            'page' => 1,
            'pages' => 1,
            'total' => count($allOrders)
        ];
        $statuses = $data['statuses'] ?? [];
    } elseif (is_array($data) && isset($data[0])) {
        // Structure: { data: [{...}, {...}] } - array of orders
        $allOrders = $data;
        $pagination = [
            'page' => 1,
            'pages' => 1,
            'total' => count($data)
        ];
        $statuses = [];
    } else {
        // Fallback: empty
        $allOrders = [];
        $pagination = [
            'page' => 1,
            'pages' => 1,
            'total' => 0
        ];
        $statuses = [];
    }
} else {
    // Fallback: try recent orders endpoint
    $recentOrdersData = $apiClient->getRecentOrders();
    if ($recentOrdersData['success'] && isset($recentOrdersData['data'])) {
        $recentData = $recentOrdersData['data'];
        if (is_array($recentData) && isset($recentData[0])) {
            $allOrders = $recentData;
        } else {
            $allOrders = [];
        }
    } else {
        $allOrders = [];
    }
    $pagination = [
        'page' => 1,
        'pages' => 1,
        'total' => count($allOrders)
    ];
    $statuses = [];
}

// Create orders structure with pagination
$orders = [
    'orders' => $allOrders,
    'pagination' => $pagination,
    'statuses' => $statuses
];

// Handle status update
if ($_POST && isset($_POST['action']) && $_POST['action'] === 'update_status' && $orderId) {
    $newStatus = $_POST['status'] ?? '';
    
    if (empty($newStatus)) {
        $error = 'Please select a status';
    } else {
        $result = $apiClient->updateOrderStatus($orderId, $newStatus);
        
        if ($result['success']) {
            // Redirect back to order view to see updated status, or to list if viewing list
            if ($action === 'view') {
                header('Location: index.php?page=orders&action=view&id=' . $orderId . '&success=Order status updated successfully');
            } else {
                header('Location: index.php?page=orders&success=Order status updated successfully');
            }
            exit();
        } else {
            $error = $result['error'] ?? ($result['data']['error'] ?? 'Failed to update order status');
            if (isset($result['http_code']) && $result['http_code'] === 0) {
                $error = 'Connection error: Could not reach backend server. Make sure backend is running on port 5001.';
            }
        }
    }
}

// Get single order for details
$order = null;
$orderResult = null;
if ($action === 'view' && $orderId) {
    $orderResult = $apiClient->getOrderById($orderId);
    
    // Debug: Log the API response
    error_log("Order API Response: " . print_r($orderResult, true));
    
    if ($orderResult['success']) {
        // API client already extracts: { success: true, data: order }
        if (isset($orderResult['data'])) {
            $order = $orderResult['data'];
            error_log("Order data extracted: " . print_r($order, true));
        } else {
            $order = null;
            error_log("No order data found in response");
        }
    } else {
        error_log("Order API call failed: " . ($orderResult['error'] ?? 'Unknown error'));
    }
}
?>

<div class="main-content">
    <div class="page-content">
        <div class="container-fluid">
            <!-- Page Title -->
            <div class="row">
                <div class="col-12">
                    <div class="page-title-box d-sm-flex align-items-center justify-content-between">
                        <h4 class="mb-sm-0 font-size-18">Orders</h4>
                        <div class="page-title-right">
                            <ol class="breadcrumb m-0">
                                <li class="breadcrumb-item"><a href="index.php">Admin</a></li>
                                <li class="breadcrumb-item active">Orders</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <?php if (isset($_GET['success'])): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <?php echo htmlspecialchars($_GET['success']); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <?php if (isset($error)): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <?php 
            // Check API connection status
            $apiConnected = false;
            if (isset($ordersData['success']) && $ordersData['success']) {
                $apiConnected = true;
            } elseif (isset($ordersData['http_code']) && $ordersData['http_code'] === 0) {
                // Connection error
            } elseif (isset($ordersData['http_code']) && $ordersData['http_code'] === 401) {
                // Authentication error
            }
            ?>
            
            <?php if (!$apiConnected && empty($orders['orders'])): ?>
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>⚠️ Connection Issue:</strong> 
                    <?php if (isset($ordersData['http_code']) && $ordersData['http_code'] === 401): ?>
                        <strong>Authentication failed.</strong> Please <a href="login.php">login again</a> to access orders.
                        <br><small>Admin API endpoints require a valid authentication token.</small>
                    <?php elseif (isset($ordersData['http_code']) && $ordersData['http_code'] === 0): ?>
                        Cannot connect to backend server. Please ensure:
                        <ul class="mb-0 mt-2">
                            <li>Backend server is running on port 5001</li>
                            <li>Run: <code>cd backend && npm start</code></li>
                            <li>Check: <a href="http://localhost:5001/api/admin/stats" target="_blank">http://localhost:5001/api/admin/stats</a></li>
                        </ul>
                    <?php elseif (isset($ordersData['data']['error'])): ?>
                        Error: <?php echo htmlspecialchars($ordersData['data']['error']); ?>
                        <?php if (strpos($ordersData['data']['error'], 'authorized') !== false || strpos($ordersData['data']['error'], 'token') !== false): ?>
                            <br><a href="login.php">Please login again</a>
                        <?php endif; ?>
                    <?php else: ?>
                        Failed to load orders. Check backend connection and try refreshing the page.
                        <br><small>If you see this message but have orders in your database, you may need to <a href="login.php">login again</a>.</small>
                    <?php endif; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php elseif ($apiConnected && empty($orders['orders'])): ?>
                <div class="alert alert-info alert-dismissible fade show" role="alert">
                    <strong>ℹ️ No Orders Found</strong>
                    <p class="mb-0 mt-2">There are no orders in the database yet. Orders will appear here after customers make purchases through your frontend.</p>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <?php if ($action === 'list'): ?>
                <!-- Orders List -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row mb-2">
                                    <div class="col-sm-4">
                                        <div class="search-box me-2 mb-2 d-inline-block">
                                            <div class="position-relative">
                                                <input type="text" class="form-control" id="searchInput" 
                                                       placeholder="Search orders..." value="<?php echo htmlspecialchars($search); ?>">
                                                <i class="bx bx-search-alt search-icon"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-8">
                                        <div class="text-sm-end">
                                            <button type="button" class="btn btn-success btn-rounded waves-effect waves-light mb-2 me-2" onclick="exportOrders()">
                                                <i class="mdi mdi-download me-1"></i> Export Orders
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Filters -->
                                <div class="row mb-3">
                                    <div class="col-md-2">
                                        <select class="form-select" id="statusFilter">
                                            <option value="">All Status</option>
                                            <?php if (!empty($orders['statuses'])): ?>
                                                <?php foreach ($orders['statuses'] as $stat): ?>
                                                    <option value="<?php echo htmlspecialchars($stat); ?>" 
                                                            <?php echo $status === $stat ? 'selected' : ''; ?>>
                                                        <?php echo ucfirst($stat); ?>
                                                    </option>
                                                <?php endforeach; ?>
                                            <?php endif; ?>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <input type="date" class="form-control" id="startDate" 
                                               value="<?php echo htmlspecialchars($startDate); ?>" placeholder="Start Date">
                                    </div>
                                    <div class="col-md-3">
                                        <input type="date" class="form-control" id="endDate" 
                                               value="<?php echo htmlspecialchars($endDate); ?>" placeholder="End Date">
                                    </div>
                                    <div class="col-md-4">
                                        <button type="button" class="btn btn-primary me-2" onclick="applyFilters()">Filter</button>
                                        <button type="button" class="btn btn-secondary" onclick="clearFilters()">Clear</button>
                                    </div>
                                </div>

                                <div class="table-responsive">
                                    <table class="table align-middle table-nowrap table-hover">
                                        <thead class="table-light">
                                            <tr>
                                                <th scope="col">Order ID</th>
                                                <th scope="col">Customer</th>
                                                <th scope="col">Date</th>
                                                <th scope="col">Amount</th>
                                                <th scope="col">
                                                    Payment
                                                    <i class="bx bx-info-circle text-muted" 
                                                       data-bs-toggle="tooltip" 
                                                       data-bs-placement="top" 
                                                       title="Payment Colors: Paid (Yellow), Unpaid (Brown)"></i>
                                                </th>
                                                <th scope="col">
                                                    Status 
                                                    <i class="bx bx-info-circle text-muted" 
                                                       data-bs-toggle="tooltip" 
                                                       data-bs-placement="top" 
                                                       title="Order Status Colors: Pending (Orange), Confirmed (Blue), Processing (Light Blue), Shipped (Dark), Delivered (Green), Cancelled (Red)"></i>
                                                </th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php if (!empty($orders['orders'])): ?>
                                                <?php foreach ($orders['orders'] as $ord): ?>
                                                    <tr>
                                                        <td>
                                                            <a href="index.php?page=orders&action=view&id=<?php echo $ord['_id']; ?>" 
                                                               class="text-body fw-bold"><?php echo htmlspecialchars($ord['orderNumber']); ?></a>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <h5 class="text-truncate font-size-14 mb-1">
                                                                    <?php echo htmlspecialchars($ord['user']['name'] ?? 'N/A'); ?>
                                                                </h5>
                                                                <p class="text-muted mb-0"><?php echo htmlspecialchars($ord['user']['email'] ?? ''); ?></p>
                                                            </div>
                                                        </td>
                                                        <td><?php echo date('M d, Y', strtotime($ord['createdAt'])); ?></td>
                                                        <td>₹ <?php echo number_format($ord['totalPrice'], 2); ?></td>
                                                        <td>
                                                            <span class="badge badge-pill badge-soft-<?php echo $ord['isPaid'] ? 'yellow' : 'brown'; ?> font-size-11">
                                                                <?php echo $ord['isPaid'] ? 'Paid' : 'Unpaid'; ?>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span class="badge badge-pill badge-soft-<?php 
                                                                $statusClass = 'secondary'; // Default fallback
                                                                $statusLower = strtolower($ord['status']);
                                                                switch($statusLower) {
                                                                    case 'pending':
                                                                        $statusClass = 'warning'; // Orange/Yellow for pending
                                                                        break;
                                                                    case 'confirmed':
                                                                        $statusClass = 'primary'; // Blue for confirmed
                                                                        break;
                                                                    case 'processing':
                                                                        $statusClass = 'info'; // Light blue for processing
                                                                        break;
                                                                    case 'shipped':
                                                                        $statusClass = 'dark'; // Dark for shipped
                                                                        break;
                                                                    case 'delivered':
                                                                        $statusClass = 'success'; // Green for delivered
                                                                        break;
                                                                    case 'cancelled':
                                                                    case 'canceled':
                                                                        $statusClass = 'danger'; // Red for cancelled
                                                                        break;
                                                                    case 'refunded':
                                                                        $statusClass = 'secondary'; // Gray for refunded
                                                                        break;
                                                                    case 'on_hold':
                                                                    case 'on-hold':
                                                                        $statusClass = 'warning'; // Orange for on hold
                                                                        break;
                                                                    default:
                                                                        $statusClass = 'light'; // Light gray for unknown status
                                                                        break;
                                                                }
                                                                echo $statusClass;
                                                            ?> status-<?php echo $statusLower; ?> font-size-11"><?php echo ucfirst($ord['status']); ?></span>
                                                        </td>
                                                        <td>
                                                            <div class="d-flex gap-3">
                                                                <a href="index.php?page=orders&action=view&id=<?php echo $ord['_id']; ?>" 
                                                                   class="text-success">
                                                                    <i class="mdi mdi-eye font-size-18"></i>
                                                                </a>
                                                                <div class="dropdown">
                                                                    <a class="text-muted font-size-16" role="button" 
                                                                       data-bs-toggle="dropdown" aria-haspopup="true">
                                                                        <i class="bx bx-dots-horizontal-rounded"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-menu-end">
                                                                        <a class="dropdown-item" href="#" onclick="updateOrderStatus('<?php echo $ord['_id']; ?>', 'confirmed')">Mark Confirmed</a>
                                                                        <a class="dropdown-item" href="#" onclick="updateOrderStatus('<?php echo $ord['_id']; ?>', 'processing')">Mark Processing</a>
                                                                        <a class="dropdown-item" href="#" onclick="updateOrderStatus('<?php echo $ord['_id']; ?>', 'shipped')">Mark Shipped</a>
                                                                        <a class="dropdown-item" href="#" onclick="updateOrderStatus('<?php echo $ord['_id']; ?>', 'delivered')">Mark Delivered</a>
                                                                        <div class="dropdown-divider"></div>
                                                                        <a class="dropdown-item text-danger" href="#" onclick="updateOrderStatus('<?php echo $ord['_id']; ?>', 'cancelled')">Cancel Order</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            <?php else: ?>
                                                <tr>
                                                    <td colspan="7" class="text-center">
                                                        <?php if (!$apiConnected): ?>
                                                            <div class="text-warning">
                                                                <i class="bx bx-error-circle"></i> Cannot connect to backend
                                                            </div>
                                                            <small class="text-muted">Make sure backend is running on port 5001</small>
                                                        <?php else: ?>
                                                            <div class="text-muted">
                                                                <!-- <i class="bx bx-package"></i> No orders found -->
                                                            </div>
                                                            <small class="text-muted">Orders will appear here after customers make purchases</small>
                                                        <?php endif; ?>
                                                    </td>
                                                </tr>
                                            <?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Pagination -->
                                <?php if (!empty($orders['pagination']) && $orders['pagination']['pages'] > 1): ?>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <ul class="pagination pagination-rounded justify-content-end mb-2">
                                                <?php 
                                                $pagination = $orders['pagination'];
                                                $currentPage = $pagination['page'];
                                                $totalPages = $pagination['pages'];
                                                ?>
                                                
                                                <?php if ($currentPage > 1): ?>
                                                    <li class="page-item">
                                                        <a class="page-link" href="?page=orders&p=<?php echo $currentPage - 1; ?>&search=<?php echo urlencode($search); ?>&status=<?php echo urlencode($status); ?>">Previous</a>
                                                    </li>
                                                <?php endif; ?>
                                                
                                                <?php for ($i = max(1, $currentPage - 2); $i <= min($totalPages, $currentPage + 2); $i++): ?>
                                                    <li class="page-item <?php echo $i === $currentPage ? 'active' : ''; ?>">
                                                        <a class="page-link" href="?page=orders&p=<?php echo $i; ?>&search=<?php echo urlencode($search); ?>&status=<?php echo urlencode($status); ?>"><?php echo $i; ?></a>
                                                    </li>
                                                <?php endfor; ?>
                                                
                                                <?php if ($currentPage < $totalPages): ?>
                                                    <li class="page-item">
                                                        <a class="page-link" href="?page=orders&p=<?php echo $currentPage + 1; ?>&search=<?php echo urlencode($search); ?>&status=<?php echo urlencode($status); ?>">Next</a>
                                                    </li>
                                                <?php endif; ?>
                                            </ul>
                                        </div>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>

            <?php elseif ($action === 'view' && $order): ?>
                <!-- Enhanced Order Details -->
                <style>
                    .order-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        border-radius: 10px 10px 0 0;
                        margin: -20px -20px 0 -20px;
                    }
                    .order-id-badge {
                        background: rgba(255, 255, 255, 0.2);
                        padding: 8px 16px;
                        border-radius: 20px;
                        display: inline-block;
                        font-size: 14px;
                        backdrop-filter: blur(10px);
                    }
                    .info-card {
                        background: #f8f9fa;
                        border-radius: 10px;
                        padding: 20px;
                        height: 100%;
                        border-left: 4px solid #667eea;
                        transition: all 0.3s ease;
                    }
                    .info-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    }
                    .info-card h5 {
                        color: #667eea;
                        font-weight: 600;
                        margin-bottom: 15px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .info-card h5 i {
                        font-size: 20px;
                    }
                    .status-select-wrapper {
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        border: 2px solid #e9ecef;
                    }
                    .status-select-wrapper select {
                        border: 2px solid #667eea;
                        border-radius: 8px;
                        padding: 10px 15px;
                        font-weight: 500;
                    }
                    .status-select-wrapper button {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        padding: 10px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    }
                    .status-select-wrapper button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                    }
                    .payment-badge {
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 600;
                    }
                    .payment-badge.paid {
                        background: #d4edda;
                        color: #155724;
                    }
                    .payment-badge.unpaid {
                        background: #f8d7da;
                        color: #721c24;
                    }
                    .product-table {
                        background: white;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    }
                    .product-table thead {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    .product-table thead th {
                        border: none;
                        padding: 15px;
                        font-weight: 600;
                    }
                    .product-table tbody td {
                        padding: 15px;
                        vertical-align: middle;
                    }
                    .product-img {
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 8px;
                        border: 2px solid #e9ecef;
                    }
                    .total-row {
                        background: #f8f9fa;
                        font-weight: 600;
                    }
                    .grand-total-row {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    .action-buttons .btn {
                        border-radius: 8px;
                        padding: 10px 20px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    }
                    .action-buttons .btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                    }
                    .action-buttons .btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    }
                </style>
                
                <div class="row">
                    <div class="col-lg-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="order-header">
                                    <div class="d-flex justify-content-between align-items-center flex-wrap">
                                        <div>
                                            <h3 class="mb-2" style="font-weight: 700;">Order Details</h3>
                                            <div class="order-id-badge">
                                                <i class="bx bx-receipt me-1"></i>
                                                Order ID: <?php echo htmlspecialchars($order['orderNumber']); ?>
                                            </div>
                                        </div>
                                        <div class="action-buttons d-flex gap-2 mt-3 mt-lg-0">
                                            <button type="button" class="btn btn-light" onclick="window.print()">
                                                <i class="bx bxs-printer me-1"></i> Print
                                            </button>
                                            <button type="button" class="btn btn-light" onclick="window.location.href='index.php?page=orders'">
                                                <i class="bx bx-arrow-back me-1"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="row mt-4">
                                    <div class="col-lg-6 mb-3">
                                        <div class="info-card">
                                            <h5><i class="bx bx-user"></i> Customer Information</h5>
                                            <div class="text-dark">
                                                <p class="mb-2" style="font-size: 16px; font-weight: 600;">
                                                    <?php echo htmlspecialchars($order['user']['name']); ?>
                                                </p>
                                                <p class="mb-1 text-muted">
                                                    <i class="bx bx-envelope me-1"></i>
                                                    <?php echo htmlspecialchars($order['user']['email']); ?>
                                                </p>
                                                <?php if (!empty($order['user']['phone'])): ?>
                                                    <p class="mb-0 text-muted">
                                                        <i class="bx bx-phone me-1"></i>
                                                        <?php echo htmlspecialchars($order['user']['phone']); ?>
                                                    </p>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-6 mb-3">
                                        <div class="info-card">
                                            <h5><i class="bx bx-map"></i> Shipping Address</h5>
                                            <div class="text-dark">
                                                <p class="mb-1"><?php echo htmlspecialchars($order['shippingAddress']['address']); ?></p>
                                                <p class="mb-1"><?php echo htmlspecialchars($order['shippingAddress']['city']); ?>, <?php echo htmlspecialchars($order['shippingAddress']['postalCode']); ?></p>
                                                <p class="mb-0"><?php echo htmlspecialchars($order['shippingAddress']['country']); ?></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-lg-6 mb-3">
                                        <div class="status-select-wrapper">
                                            <h5 class="mb-3" style="color: #667eea; font-weight: 600;">
                                                <i class="bx bx-package me-1"></i> Order Status
                                            </h5>
                                            <form method="POST" action="index.php?page=orders&action=view&id=<?php echo $order['_id']; ?>">
                                                <input type="hidden" name="action" value="update_status">
                                                <div class="d-flex gap-2">
                                                    <select name="status" class="form-select">
                                                        <option value="pending" <?php echo $order['status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                                        <option value="confirmed" <?php echo $order['status'] === 'confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                                                        <option value="processing" <?php echo $order['status'] === 'processing' ? 'selected' : ''; ?>>Processing</option>
                                                        <option value="shipped" <?php echo $order['status'] === 'shipped' ? 'selected' : ''; ?>>Shipped</option>
                                                        <option value="delivered" <?php echo $order['status'] === 'delivered' ? 'selected' : ''; ?>>Delivered</option>
                                                        <option value="cancelled" <?php echo $order['status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                                                    </select>
                                                    <button type="submit" class="btn btn-primary">
                                                        <i class="bx bx-check me-1"></i> Update
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div class="col-lg-6 mb-3">
                                        <div class="info-card">
                                            <h5><i class="bx bx-credit-card"></i> Payment Information</h5>
                                            <div class="text-dark">
                                                <p class="mb-2">
                                                    <strong>Method:</strong> 
                                                    <span class="text-uppercase"><?php echo htmlspecialchars($order['paymentMethod']); ?></span>
                                                </p>
                                                <p class="mb-2">
                                                    <strong>Status:</strong> 
                                                    <span class="payment-badge <?php echo $order['isPaid'] ? 'paid' : 'unpaid'; ?>">
                                                        <?php echo $order['isPaid'] ? '✓ Paid' : '✗ Unpaid'; ?>
                                                    </span>
                                                </p>
                                                <?php if ($order['isPaid'] && !empty($order['paidAt'])): ?>
                                                    <p class="mb-0 text-muted">
                                                        <i class="bx bx-time me-1"></i>
                                                        Paid: <?php echo date('M d, Y H:i', strtotime($order['paidAt'])); ?>
                                                    </p>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-4">
                                    <h5 class="mb-3" style="color: #667eea; font-weight: 600;">
                                        <i class="bx bx-shopping-bag me-1"></i> Order Items
                                    </h5>
                                    <div class="product-table">
                                        <table class="table align-middle table-nowrap mb-0">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Product</th>
                                                    <th scope="col">Price</th>
                                                    <th scope="col">Quantity</th>
                                                    <th scope="col" class="text-end">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($order['orderItems'] as $item): ?>
                                                    <tr>
                                                        <td>
                                                            <div class="d-flex align-items-center">
                                                                <div class="flex-shrink-0 me-3">
                                                                    <?php if (!empty($item['image'])): 
                                                                        $imageUrl = $item['image'];
                                                                        if (strpos($imageUrl, 'http') !== 0) {
                                                                            $imageUrl = 'http://localhost:5001/' . ltrim($imageUrl, '/');
                                                                        }
                                                                    ?>
                                                                        <img src="<?php echo htmlspecialchars($imageUrl); ?>" 
                                                                             alt="" class="product-img"
                                                                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect fill=%22%23e9ecef%22 width=%2260%22 height=%2260%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2210%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                                                                    <?php else: ?>
                                                                        <div class="product-img bg-light d-flex align-items-center justify-content-center">
                                                                            <i class="bx bx-package text-muted"></i>
                                                                        </div>
                                                                    <?php endif; ?>
                                                                </div>
                                                                <div class="flex-grow-1">
                                                                    <h6 class="mb-0" style="font-weight: 600;">
                                                                        <?php echo htmlspecialchars($item['name']); ?>
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><strong>₹<?php echo number_format($item['price'], 2); ?></strong></td>
                                                        <td>
                                                            <span class="badge bg-light text-dark" style="font-size: 14px; padding: 6px 12px;">
                                                                <?php echo $item['quantity']; ?>
                                                            </span>
                                                        </td>
                                                        <td class="text-end"><strong>₹<?php echo number_format($item['price'] * $item['quantity'], 2); ?></strong></td>
                                                    </tr>
                                                <?php endforeach; ?>
                                                <tr class="total-row">
                                                    <td colspan="3" class="text-end">
                                                        <strong>Sub Total:</strong>
                                                    </td>
                                                    <td class="text-end">
                                                        <strong>₹<?php echo number_format($order['itemsPrice'], 2); ?></strong>
                                                    </td>
                                                </tr>
                                                <tr class="total-row">
                                                    <td colspan="3" class="text-end">
                                                        <strong>Shipping:</strong>
                                                    </td>
                                                    <td class="text-end">
                                                        <strong>₹<?php echo number_format($order['shippingPrice'], 2); ?></strong>
                                                    </td>
                                                </tr>
                                                <tr class="total-row">
                                                    <td colspan="3" class="text-end">
                                                        <strong>Tax:</strong>
                                                    </td>
                                                    <td class="text-end">
                                                        <strong>₹<?php echo number_format($order['taxPrice'], 2); ?></strong>
                                                    </td>
                                                </tr>
                                                <tr class="grand-total-row">
                                                    <td colspan="3" class="text-end">
                                                        <h5 class="mb-0" style="color: white;">Total:</h5>
                                                    </td>
                                                    <td class="text-end">
                                                        <h4 class="mb-0" style="color: white; font-weight: 700;">₹<?php echo number_format($order['totalPrice'], 2); ?></h4>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php elseif ($action === 'view' && $orderId && !$order): ?>
                <!-- Order Not Found -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body text-center">
                                <div class="mb-4">
                                    <i class="bx bx-error-circle display-4 text-warning"></i>
                                </div>
                                <h4 class="mb-3">Order Details Not Available</h4>
                                <p class="text-muted mb-4">
                                    The order with ID "<?php echo htmlspecialchars($orderId); ?>" could not be loaded.
                                </p>
                                
                                <div class="alert alert-info text-start">
                                    <strong>Possible causes:</strong>
                                    <ul class="mb-0 mt-2">
                                        <li><strong>Authentication Issue:</strong> Your admin session may have expired - try <a href="login.php">logging in again</a></li>
                                        <li><strong>Invalid Order ID:</strong> The order ID may not exist in the database</li>
                                        <li><strong>Backend Connection:</strong> Backend server may not be running on port 5001</li>
                                        <li><strong>Database Issue:</strong> Order data may be corrupted or missing related data</li>
                                    </ul>
                                </div>
                                
                                <?php if (isset($orderResult)): ?>
                                    <div class="alert alert-secondary text-start">
                                        <strong>Debug Information:</strong><br>
                                        API Success: <?php echo $orderResult['success'] ? 'Yes' : 'No'; ?><br>
                                        HTTP Code: <?php echo $orderResult['http_code'] ?? 'Unknown'; ?><br>
                                        <?php if (isset($orderResult['error'])): ?>
                                            Error: <?php echo htmlspecialchars($orderResult['error']); ?><br>
                                        <?php endif; ?>
                                    </div>
                                <?php endif; ?>
                                
                                <div class="d-flex gap-2 justify-content-center">
                                    <button type="button" class="btn btn-secondary" onclick="window.location.href='index.php?page=orders'">
                                        <i class="bx bx-arrow-back me-1"></i> Back to Orders
                                    </button>
                                    <button type="button" class="btn btn-primary" onclick="window.location.reload()">
                                        <i class="bx bx-refresh me-1"></i> Retry
                                    </button>
                                    <a href="login.php" class="btn btn-warning">
                                        <i class="bx bx-log-in me-1"></i> Re-login
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
// Custom CSS to prevent export button from appearing faded when disabled
const style = document.createElement('style');
style.textContent = `
    .btn-success:disabled {
        opacity: 1 !important;
        background-color: #198754 !important;
        border-color: #198754 !important;
        color: #fff !important;
    }
    
    .btn-success:disabled .mdi-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Orders management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 500);
        });
    }
});

// Enhanced status badge styles
const statusBadgeStyles = `
<style>
/* Enhanced Order Status Badge Colors */
.badge-soft-primary {
    color: #0d6efd !important;
    background-color: rgba(13, 110, 253, 0.1) !important;
    border: 1px solid rgba(13, 110, 253, 0.2) !important;
}

.badge-soft-info {
    color: #0dcaf0 !important;
    background-color: rgba(13, 202, 240, 0.1) !important;
    border: 1px solid rgba(13, 202, 240, 0.2) !important;
}

.badge-soft-warning {
    color: #fd7e14 !important;
    background-color: rgba(253, 126, 20, 0.1) !important;
    border: 1px solid rgba(253, 126, 20, 0.2) !important;
}

.badge-soft-success {
    color: #198754 !important;
    background-color: rgba(25, 135, 84, 0.1) !important;
    border: 1px solid rgba(25, 135, 84, 0.2) !important;
}

.badge-soft-danger {
    color: #dc3545 !important;
    background-color: rgba(220, 53, 69, 0.1) !important;
    border: 1px solid rgba(220, 53, 69, 0.2) !important;
}

.badge-soft-dark {
    color: #212529 !important;
    background-color: rgba(33, 37, 41, 0.1) !important;
    border: 1px solid rgba(33, 37, 41, 0.2) !important;
}

.badge-soft-secondary {
    color: #6c757d !important;
    background-color: rgba(108, 117, 125, 0.1) !important;
    border: 1px solid rgba(108, 117, 125, 0.2) !important;
}

.badge-soft-light {
    color: #495057 !important;
    background-color: rgba(248, 249, 250, 0.8) !important;
    border: 1px solid rgba(222, 226, 230, 0.5) !important;
}

.badge-soft-brown {
    color: #8B4513 !important;
    background-color: rgba(139, 69, 19, 0.1) !important;
    border: 1px solid rgba(139, 69, 19, 0.2) !important;
}

.badge-soft-yellow {
    color: #B8860B !important;
    background-color: rgba(255, 215, 0, 0.15) !important;
    border: 1px solid rgba(255, 215, 0, 0.3) !important;
}

/* Status-specific enhancements */
.status-pending {
    animation: pulse-warning 2s infinite;
}

.status-processing {
    animation: pulse-info 2s infinite;
}

@keyframes pulse-warning {
    0% { box-shadow: 0 0 0 0 rgba(253, 126, 20, 0.4); }
    70% { box-shadow: 0 0 0 4px rgba(253, 126, 20, 0); }
    100% { box-shadow: 0 0 0 0 rgba(253, 126, 20, 0); }
}

@keyframes pulse-info {
    0% { box-shadow: 0 0 0 0 rgba(13, 202, 240, 0.4); }
    70% { box-shadow: 0 0 0 4px rgba(13, 202, 240, 0); }
    100% { box-shadow: 0 0 0 0 rgba(13, 202, 240, 0); }
}

/* Hover effects for better UX */
.badge-pill:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
}
</style>
`;

// Inject the styles
document.head.insertAdjacentHTML('beforeend', statusBadgeStyles);

function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const status = document.getElementById('statusFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const params = new URLSearchParams();
    params.append('page', 'orders');
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    window.location.href = '?' + params.toString();
}

function clearFilters() {
    // Clear all filter inputs
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    // Redirect to orders page without any filters
    window.location.href = '?page=orders';
}

function updateOrderStatus(orderId, status) {
    if (confirm(`Are you sure you want to update this order status to ${status}?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `index.php?page=orders&action=view&id=${orderId}`;
        
        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'action';
        actionInput.value = 'update_status';
        
        const statusInput = document.createElement('input');
        statusInput.type = 'hidden';
        statusInput.name = 'status';
        statusInput.value = status;
        
        form.appendChild(actionInput);
        form.appendChild(statusInput);
        document.body.appendChild(form);
        form.submit();
    }
}

function exportOrders() {
    const status = document.getElementById('statusFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const params = new URLSearchParams();
    params.append('format', 'pdf');
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    // Find the export button more reliably
    const exportBtn = document.querySelector('button[onclick="exportOrders()"]');
    if (!exportBtn) {
        console.error('Export button not found');
        return;
    }
    
    // Store original button state
    const originalText = exportBtn.innerHTML;
    const originalDisabled = exportBtn.disabled;
    
    // Show loading state
    exportBtn.disabled = true;
    exportBtn.innerHTML = '<i class="mdi mdi-loading mdi-spin me-1"></i> Generating PDF...';
    
    // Function to restore button state
    const restoreButton = () => {
        exportBtn.disabled = originalDisabled;
        exportBtn.innerHTML = originalText;
        
        // Force a repaint to ensure visual update
        exportBtn.style.opacity = '1';
        exportBtn.offsetHeight; // Trigger reflow
    };
    
    // Add timeout as fallback to ensure button is restored
    const timeoutId = setTimeout(() => {
        console.warn('Export timeout - restoring button');
        restoreButton();
    }, 30000); // 30 second timeout
    
    // Use PHP endpoint for proper authentication and session handling
    fetch(`export-orders.php?${params.toString()}`, {
        method: 'GET'
    })
    .then(response => {
        clearTimeout(timeoutId); // Clear timeout since we got a response
        
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Export failed');
            });
        }
        return response.blob();
    })
    .then(blob => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Reset button state
        restoreButton();
    })
    .catch(error => {
        clearTimeout(timeoutId); // Clear timeout since we got an error
        console.error('Export error:', error);
        alert('Failed to export orders: ' + error.message);
        
        // Reset button state
        restoreButton();
    });
}
</script>