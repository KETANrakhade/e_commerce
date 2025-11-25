<?php
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

$apiClient = getApiClient();
$ordersData = $apiClient->getAdminOrders();
$allOrders = ($ordersData['success'] && isset($ordersData['data']['data']['orders'])) 
    ? $ordersData['data']['data']['orders'] 
    : [];

// Create orders structure with pagination
$orders = [
    'orders' => $allOrders,
    'pagination' => [
        'page' => 1,
        'pages' => 1,
        'total' => count($allOrders)
    ]
];

// Handle status update
if ($_POST && isset($_POST['action']) && $_POST['action'] === 'update_status' && $orderId) {
    $newStatus = $_POST['status'];
    $result = $apiClient->updateOrderStatus($orderId, $newStatus);
    
    if ($result['success']) {
        header('Location: index.php?page=orders&success=Order status updated successfully');
        exit();
    } else {
        $error = $result['data']['error'] ?? $result['error'] ?? 'Failed to update order status';
    }
}

// Get single order for details
$order = null;
if ($action === 'view' && $orderId) {
    $orderResult = $apiClient->getOrderById($orderId);
    $order = ($orderResult['success'] && isset($orderResult['data']['data'])) 
        ? $orderResult['data']['data'] 
        : null;
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
                    <?php echo htmlspecialchars($error); ?>
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
                                    <div class="col-md-2">
                                        <button type="button" class="btn btn-primary" onclick="applyFilters()">Filter</button>
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
                                                <th scope="col">Payment</th>
                                                <th scope="col">Status</th>
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
                                                            <span class="badge badge-pill badge-soft-<?php echo $ord['isPaid'] ? 'success' : 'warning'; ?> font-size-11">
                                                                <?php echo $ord['isPaid'] ? 'Paid' : 'Unpaid'; ?>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span class="badge badge-pill badge-soft-<?php 
                                                                echo match($ord['status']) {
                                                                    'delivered' => 'success',
                                                                    'shipped' => 'info',
                                                                    'processing' => 'warning',
                                                                    'cancelled' => 'danger',
                                                                    default => 'secondary'
                                                                };
                                                            ?> font-size-11"><?php echo ucfirst($ord['status']); ?></span>
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
                                                    <td colspan="7" class="text-center">No orders found</td>
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
                <!-- Order Details -->
                <div class="row">
                    <div class="col-lg-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-lg-flex">
                                    <div class="flex-grow-1">
                                        <div class="mb-3">
                                            <h4 class="card-title mb-1">Order Details</h4>
                                            <p class="text-muted mb-0">Order ID: <?php echo htmlspecialchars($order['orderNumber']); ?></p>
                                        </div>
                                    </div>
                                    <div class="flex-shrink-0">
                                        <div class="d-flex gap-2 flex-wrap">
                                            <button type="button" class="btn btn-primary" onclick="window.print()">
                                                <i class="bx bxs-printer me-1"></i> Print
                                            </button>
                                            <button type="button" class="btn btn-secondary" onclick="window.location.href='index.php?page=orders'">
                                                <i class="bx bx-arrow-back me-1"></i> Back to Orders
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-lg-6">
                                        <div class="mt-4">
                                            <h5 class="font-size-15 mb-3">Customer Information</h5>
                                            <div class="text-muted">
                                                <h5 class="font-size-16 mb-2"><?php echo htmlspecialchars($order['user']['name']); ?></h5>
                                                <p class="mb-1"><?php echo htmlspecialchars($order['user']['email']); ?></p>
                                                <?php if (!empty($order['user']['phone'])): ?>
                                                    <p class="mb-1"><?php echo htmlspecialchars($order['user']['phone']); ?></p>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="mt-4">
                                            <h5 class="font-size-15 mb-3">Shipping Address</h5>
                                            <div class="text-muted">
                                                <p class="mb-1"><?php echo htmlspecialchars($order['shippingAddress']['address']); ?></p>
                                                <p class="mb-1"><?php echo htmlspecialchars($order['shippingAddress']['city']); ?>, <?php echo htmlspecialchars($order['shippingAddress']['postalCode']); ?></p>
                                                <p class="mb-0"><?php echo htmlspecialchars($order['shippingAddress']['country']); ?></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-lg-6">
                                        <div class="mt-4">
                                            <h5 class="font-size-15 mb-3">Order Status</h5>
                                            <form method="POST" action="index.php?page=orders&action=view&id=<?php echo $order['_id']; ?>">
                                                <input type="hidden" name="action" value="update_status">
                                                <div class="d-flex gap-2">
                                                    <select name="status" class="form-select" style="max-width: 200px;">
                                                        <option value="pending" <?php echo $order['status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                                        <option value="confirmed" <?php echo $order['status'] === 'confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                                                        <option value="processing" <?php echo $order['status'] === 'processing' ? 'selected' : ''; ?>>Processing</option>
                                                        <option value="shipped" <?php echo $order['status'] === 'shipped' ? 'selected' : ''; ?>>Shipped</option>
                                                        <option value="delivered" <?php echo $order['status'] === 'delivered' ? 'selected' : ''; ?>>Delivered</option>
                                                        <option value="cancelled" <?php echo $order['status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                                                    </select>
                                                    <button type="submit" class="btn btn-primary">Update Status</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="mt-4">
                                            <h5 class="font-size-15 mb-3">Payment Information</h5>
                                            <div class="text-muted">
                                                <p class="mb-1">Payment Method: <?php echo htmlspecialchars($order['paymentMethod']); ?></p>
                                                <p class="mb-1">Payment Status: 
                                                    <span class="badge badge-soft-<?php echo $order['isPaid'] ? 'success' : 'warning'; ?>">
                                                        <?php echo $order['isPaid'] ? 'Paid' : 'Unpaid'; ?>
                                                    </span>
                                                </p>
                                                <?php if ($order['isPaid'] && !empty($order['paidAt'])): ?>
                                                    <p class="mb-0">Paid At: <?php echo date('M d, Y H:i', strtotime($order['paidAt'])); ?></p>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-4">
                                    <h5 class="font-size-15 mb-3">Order Items</h5>
                                    <div class="table-responsive">
                                        <table class="table align-middle table-nowrap">
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
                                                            <div class="d-flex">
                                                                <div class="flex-shrink-0 me-3">
                                                                    <?php if (!empty($item['image'])): ?>
                                                                        <img src="<?php echo htmlspecialchars($item['image']); ?>" 
                                                                             alt="" class="avatar-sm">
                                                                    <?php else: ?>
                                                                        <div class="avatar-sm bg-light d-flex align-items-center justify-content-center">
                                                                            <i class="bx bx-package"></i>
                                                                        </div>
                                                                    <?php endif; ?>
                                                                </div>
                                                                <div class="flex-grow-1">
                                                                    <h5 class="text-truncate font-size-14 mb-1">
                                                                        <?php echo htmlspecialchars($item['name']); ?>
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>₹ <?php echo number_format($item['price'], 2); ?></td>
                                                        <td><?php echo $item['quantity']; ?></td>
                                                        <td class="text-end">₹ <?php echo number_format($item['price'] * $item['quantity'], 2); ?></td>
                                                    </tr>
                                                <?php endforeach; ?>
                                                <tr>
                                                    <td colspan="3" class="text-end">
                                                        <h6 class="m-0 fw-semibold">Sub Total:</h6>
                                                    </td>
                                                    <td class="text-end">
                                                        <h6 class="m-0">₹ <?php echo number_format($order['itemsPrice'], 2); ?></h6>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3" class="border-0 text-end">
                                                        <strong>Shipping:</strong>
                                                    </td>
                                                    <td class="border-0 text-end">
                                                        <h6 class="m-0">₹ <?php echo number_format($order['shippingPrice'], 2); ?></h6>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3" class="border-0 text-end">
                                                        <strong>Tax:</strong>
                                                    </td>
                                                    <td class="border-0 text-end">
                                                        <h6 class="m-0">₹ <?php echo number_format($order['taxPrice'], 2); ?></h6>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3" class="border-0 text-end">
                                                        <strong>Total:</strong>
                                                    </td>
                                                    <td class="border-0 text-end">
                                                        <h4 class="m-0 fw-semibold">₹ <?php echo number_format($order['totalPrice'], 2); ?></h4>
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
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
// Orders management JavaScript
document.addEventListener('DOMContentLoaded', function() {
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
    params.append('format', 'csv');
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    window.open(`/api/admin/orders/export?${params.toString()}`, '_blank');
}
</script>