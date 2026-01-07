<?php
// Suppress warnings and notices for cleaner user interface
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 0);

// Include API client
require_once __DIR__ . '/../config/api_client.php';

// Handle user actions
$action = $_GET['action'] ?? 'list';
$userId = $_GET['id'] ?? '';

// Get users data from API
$page = $_GET['p'] ?? 1;
$search = $_GET['search'] ?? '';
$role = $_GET['role'] ?? '';
$status = $_GET['status'] ?? '';

// Build query parameters
$params = [
    'page' => $page,
    'limit' => 20
];
if ($search) $params['search'] = $search;
if ($role) $params['role'] = $role;
if ($status) $params['status'] = $status;

// Fetch users from API
$apiClient = getApiClient();
$usersData = $apiClient->getAdminUsers($params);

// Extract users from response
// Handle different response structures
if ($usersData['success'] && isset($usersData['data'])) {
    $data = $usersData['data'];
    
    // Check if users are directly in data or nested
    if (isset($data['users'])) {
        // Structure: { data: { users: [...], pagination: {...} } }
        $allUsers = $data['users'] ?? [];
        $pagination = $data['pagination'] ?? [
            'page' => 1,
            'pages' => 1,
            'total' => count($allUsers)
        ];
    } elseif (is_array($data) && isset($data[0])) {
        // Structure: { data: [{...}, {...}] } - array of users
        $allUsers = $data;
        $pagination = [
            'page' => 1,
            'pages' => 1,
            'total' => count($data)
        ];
    } else {
        // Fallback: empty
        $allUsers = [];
        $pagination = [
            'page' => 1,
            'pages' => 1,
            'total' => 0
        ];
    }
} else {
    $allUsers = [];
    $pagination = [
        'page' => 1,
        'pages' => 1,
        'total' => 0
    ];
}

// Extract unique roles from users data
$availableRoles = [];
if (!empty($allUsers)) {
    foreach ($allUsers as $user) {
        if (isset($user['role']) && !in_array($user['role'], $availableRoles)) {
            $availableRoles[] = $user['role'];
        }
    }
    // Sort roles alphabetically
    sort($availableRoles);
}

// Add default roles if none found (for empty user list)
if (empty($availableRoles)) {
    $availableRoles = ['admin', 'user'];
}

// Create users structure with pagination and roles
$users = [
    'users' => $allUsers,
    'pagination' => $pagination,
    'roles' => $availableRoles
];

// Handle status update
if ($_POST && isset($_POST['action']) && $_POST['action'] === 'update_status' && $userId) {
    $isActive = isset($_POST['isActive']);
    $result = $apiClient->updateUserStatus($userId, $isActive);
    
    if ($result['success']) {
        header('Location: index.php?page=users&success=User status updated successfully');
        exit();
    } else {
        $error = $result['error'] ?? ($result['data']['error'] ?? 'Failed to update user status');
        if (isset($result['http_code']) && $result['http_code'] === 0) {
            $error = 'Connection error: Could not reach backend server. Make sure backend is running on port 5001.';
        }
    }
}

// Get single user for details
$user = null;
$userOrders = [];
if ($action === 'view' && $userId) {
    $userResult = $apiClient->getUserById($userId);
    if ($userResult['success']) {
        // API client already extracts: { success: true, data: user }
        if (isset($userResult['data'])) {
            $user = $userResult['data'];
        }
    }
    
    if ($user) {
        $ordersResult = $apiClient->getUserOrders($userId);
        if ($ordersResult['success']) {
            // API client already extracts: { success: true, data: orders }
            if (isset($ordersResult['data'])) {
                $userOrders = is_array($ordersResult['data']) ? $ordersResult['data'] : [];
            }
        }
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
                        <h4 class="mb-sm-0 font-size-18">Users</h4>
                        <div class="page-title-right">
                            <ol class="breadcrumb m-0">
                                <li class="breadcrumb-item"><a href="index.php">Admin</a></li>
                                <li class="breadcrumb-item active">Users</li>
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
            if (isset($usersData['success']) && $usersData['success']) {
                $apiConnected = true;
            }
            ?>
            
            <?php if (!$apiConnected && empty($users['users'])): ?>
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>⚠️ Connection Issue:</strong> 
                    <?php if (isset($usersData['http_code']) && $usersData['http_code'] === 401): ?>
                        Authentication failed. Please <a href="login.php">login again</a> to access user data.
                    <?php elseif (isset($usersData['http_code']) && $usersData['http_code'] === 0): ?>
                        Cannot connect to backend server. Please ensure:
                        <ul class="mb-0 mt-2">
                            <li>Backend server is running on port 5001</li>
                            <li>Run: <code>cd backend && npm start</code></li>
                        </ul>
                    <?php elseif (isset($usersData['data']['error'])): ?>
                        Error: <?php echo htmlspecialchars($usersData['data']['error']); ?>
                        <?php if (strpos($usersData['data']['error'], 'authorized') !== false): ?>
                            <br><a href="login.php">Please login again</a>
                        <?php endif; ?>
                    <?php else: ?>
                        Failed to load users. Check backend connection and try refreshing the page.
                    <?php endif; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
            
            <?php if (empty($users['users']) && $apiConnected): ?>
                <div class="alert alert-info alert-dismissible fade show" role="alert">
                    <strong>ℹ️ No Users Found</strong>
                    <p class="mb-0 mt-2">There are no users registered yet.</p>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <?php if ($action === 'list'): ?>
                <!-- Users List -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row mb-2">
                                    <div class="col-sm-4">
                                        <div class="search-box me-2 mb-2 d-inline-block">
                                            <div class="position-relative">
                                                <input type="text" class="form-control" id="searchInput" 
                                                       placeholder="Search users..." value="<?php echo htmlspecialchars($search); ?>">
                                                <i class="bx bx-search-alt search-icon"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-8">
                                        <div class="text-sm-end">
                                            <div class="btn-group" role="group">
                                                <button type="button" class="btn btn-outline-secondary">
                                                    <i class="bx bx-archive-in font-size-16 align-middle"></i>
                                                </button>
                                                <button type="button" class="btn btn-outline-secondary">
                                                    <i class="bx bx-download font-size-16 align-middle"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Filters -->
                                <div class="row mb-3">
                                    <div class="col-md-3">
                                        <select class="form-select" id="roleFilter">
                                            <option value="">All Roles</option>
                                            <?php if (!empty($users['roles'])): ?>
                                                <?php foreach ($users['roles'] as $r): ?>
                                                    <option value="<?php echo htmlspecialchars($r); ?>" 
                                                            <?php echo $role === $r ? 'selected' : ''; ?>>
                                                        <?php echo ucfirst($r); ?>
                                                    </option>
                                                <?php endforeach; ?>
                                            <?php endif; ?>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <select class="form-select" id="statusFilter">
                                            <option value="">All Status</option>
                                            <option value="active" <?php echo $status === 'active' ? 'selected' : ''; ?>>Active</option>
                                            <option value="inactive" <?php echo $status === 'inactive' ? 'selected' : ''; ?>>Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="table-responsive">
                                    <table class="table align-middle table-nowrap table-hover">
                                        <thead class="table-light">
                                            <tr>
                                                <th scope="col" style="width: 50px;">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="checkAll">
                                                        <label class="form-check-label" for="checkAll"></label>
                                                    </div>
                                                </th>
                                                <th scope="col">Name</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Role</th>
                                                <th scope="col">Joined Date</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php if (!empty($users['users'])): ?>
                                                <?php foreach ($users['users'] as $usr): ?>
                                                    <tr>
                                                        <th scope="row">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" 
                                                                       name="userIds[]" value="<?php echo $usr['_id']; ?>">
                                                            </div>
                                                        </th>
                                                        <td>
                                                            <div class="d-flex align-items-center">
                                                                <div class="avatar-xs me-3">
                                                                    <span class="avatar-title rounded-circle bg-soft-primary text-primary font-size-16">
                                                                        <?php echo strtoupper(substr($usr['name'] ?? 'U', 0, 1)); ?>
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h5 class="text-truncate font-size-14 mb-1">
                                                                        <a href="index.php?page=users&action=view&id=<?php echo htmlspecialchars($usr['_id'] ?? ''); ?>" class="text-dark">
                                                                            <?php echo htmlspecialchars($usr['name'] ?? 'Unknown User'); ?>
                                                                        </a>
                                                                    </h5>
                                                                    <?php if (!empty($usr['lastLogin'])): ?>
                                                                        <p class="text-muted mb-0">Last login: <?php echo date('M d, Y', strtotime($usr['lastLogin'])); ?></p>
                                                                    <?php endif; ?>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><?php echo htmlspecialchars($usr['email'] ?? 'No email'); ?></td>
                                                        <td>
                                                            <span class="badge badge-pill badge-soft-<?php echo ($usr['role'] ?? 'user') === 'admin' ? 'danger' : 'primary'; ?> font-size-11">
                                                                <?php echo ucfirst($usr['role'] ?? 'user'); ?>
                                                            </span>
                                                        </td>
                                                        <td><?php echo isset($usr['createdAt']) ? date('M d, Y', strtotime($usr['createdAt'])) : 'N/A'; ?></td>
                                                        <td>
                                                            <span class="badge badge-pill badge-soft-<?php echo ($usr['isActive'] ?? false) ? 'success' : 'danger'; ?> font-size-11">
                                                                <?php echo ($usr['isActive'] ?? false) ? 'Active' : 'Inactive'; ?>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div class="d-flex gap-3">
                                                                <a href="index.php?page=users&action=view&id=<?php echo htmlspecialchars($usr['_id'] ?? ''); ?>" 
                                                                   class="text-success">
                                                                    <i class="mdi mdi-eye font-size-18"></i>
                                                                </a>
                                                                <div class="dropdown">
                                                                    <a class="text-muted font-size-16" role="button" 
                                                                       data-bs-toggle="dropdown" aria-haspopup="true">
                                                                        <i class="bx bx-dots-horizontal-rounded"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-menu-end">
                                                                        <?php if ($usr['isActive'] ?? false): ?>
                                                                            <a class="dropdown-item text-warning" href="#" onclick="updateUserStatus('<?php echo htmlspecialchars($usr['_id'] ?? ''); ?>', false)">Deactivate User</a>
                                                                        <?php else: ?>
                                                                            <a class="dropdown-item text-success" href="#" onclick="updateUserStatus('<?php echo htmlspecialchars($usr['_id'] ?? ''); ?>', true)">Activate User</a>
                                                                        <?php endif; ?>
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
                                                                <i class="bx bx-user"></i> No users found
                                                            </div>
                                                            <small class="text-muted">Users will appear here after they register</small>
                                                        <?php endif; ?>
                                                    </td>
                                                </tr>
                                            <?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Pagination -->
                                <?php if (!empty($users['pagination']) && $users['pagination']['pages'] > 1): ?>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <ul class="pagination pagination-rounded justify-content-end mb-2">
                                                <?php 
                                                $pagination = $users['pagination'];
                                                $currentPage = $pagination['page'];
                                                $totalPages = $pagination['pages'];
                                                ?>
                                                
                                                <?php if ($currentPage > 1): ?>
                                                    <li class="page-item">
                                                        <a class="page-link" href="?page=users&p=<?php echo $currentPage - 1; ?>&search=<?php echo urlencode($search); ?>&role=<?php echo urlencode($role); ?>&status=<?php echo urlencode($status); ?>">Previous</a>
                                                    </li>
                                                <?php endif; ?>
                                                
                                                <?php for ($i = max(1, $currentPage - 2); $i <= min($totalPages, $currentPage + 2); $i++): ?>
                                                    <li class="page-item <?php echo $i === $currentPage ? 'active' : ''; ?>">
                                                        <a class="page-link" href="?page=users&p=<?php echo $i; ?>&search=<?php echo urlencode($search); ?>&role=<?php echo urlencode($role); ?>&status=<?php echo urlencode($status); ?>"><?php echo $i; ?></a>
                                                    </li>
                                                <?php endfor; ?>
                                                
                                                <?php if ($currentPage < $totalPages): ?>
                                                    <li class="page-item">
                                                        <a class="page-link" href="?page=users&p=<?php echo $currentPage + 1; ?>&search=<?php echo urlencode($search); ?>&role=<?php echo urlencode($role); ?>&status=<?php echo urlencode($status); ?>">Next</a>
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

            <?php elseif ($action === 'view' && $userId): ?>
                <!-- User Details -->
                <?php if ($user): ?>
                    <div class="row">
                        <div class="col-lg-4">
                            <!-- User Profile Card -->
                            <div class="card">
                                <div class="card-body">
                                    <div class="d-flex">
                                        <div class="flex-shrink-0 me-3">
                                            <div class="avatar-md">
                                                <span class="avatar-title rounded-circle bg-primary text-white font-size-24">
                                                    <?php echo strtoupper(substr($user['name'] ?? 'U', 0, 1)); ?>
                                                </span>
                                            </div>
                                        </div>
                                        <div class="flex-grow-1 align-self-center">
                                            <div class="text-muted">
                                                <h5 class="mb-1"><?php echo htmlspecialchars($user['name'] ?? 'Unknown User'); ?></h5>
                                                <p class="mb-1 text-muted"><?php echo htmlspecialchars($user['email'] ?? 'No email'); ?></p>
                                                <p class="mb-0">
                                                    <span class="badge badge-soft-<?php echo ($user['role'] ?? 'user') === 'admin' ? 'danger' : 'primary'; ?>">
                                                        <?php echo ucfirst($user['role'] ?? 'user'); ?>
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- User Information Card -->
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title mb-3">
                                        <i class="mdi mdi-account-circle me-2"></i>User Information
                                    </h5>
                                    <div class="table-responsive">
                                        <table class="table table-nowrap mb-0">
                                            <tbody>
                                                <tr>
                                                    <th scope="row" style="width: 40%;">Full Name:</th>
                                                    <td><?php echo htmlspecialchars($user['name'] ?? 'Unknown User'); ?></td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Email:</th>
                                                    <td><?php echo htmlspecialchars($user['email'] ?? 'No email'); ?></td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Role:</th>
                                                    <td>
                                                        <span class="badge badge-soft-<?php echo ($user['role'] ?? 'user') === 'admin' ? 'danger' : 'primary'; ?>">
                                                            <?php echo ucfirst($user['role'] ?? 'user'); ?>
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Status:</th>
                                                    <td>
                                                        <span class="badge badge-soft-<?php echo ($user['isActive'] ?? false) ? 'success' : 'danger'; ?>">
                                                            <?php echo ($user['isActive'] ?? false) ? 'Active' : 'Inactive'; ?>
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Joined Date:</th>
                                                    <td><?php echo isset($user['createdAt']) ? date('M d, Y', strtotime($user['createdAt'])) : 'N/A'; ?></td>
                                                </tr>
                                                <?php if (!empty($user['lastLogin'])): ?>
                                                    <tr>
                                                        <th scope="row">Last Login:</th>
                                                        <td><?php echo date('M d, Y H:i', strtotime($user['lastLogin'])); ?></td>
                                                    </tr>
                                                <?php endif; ?>
                                                <?php if (!empty($user['phone'])): ?>
                                                    <tr>
                                                        <th scope="row">Phone:</th>
                                                        <td><?php echo htmlspecialchars($user['phone']); ?></td>
                                                    </tr>
                                                <?php endif; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <!-- Order Statistics Card -->
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title mb-3">
                                        <i class="mdi mdi-chart-line me-2"></i>Order Statistics
                                    </h5>
                                    <?php if (!empty($user['orderStats']) && is_array($user['orderStats'])): ?>
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="text-center">
                                                    <h4 class="mb-1 text-primary"><?php echo intval($user['orderStats']['totalOrders'] ?? 0); ?></h4>
                                                    <p class="text-muted mb-0">Total Orders</p>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="text-center">
                                                    <h4 class="mb-1 text-success">₹<?php echo number_format(floatval($user['orderStats']['totalSpent'] ?? 0), 2); ?></h4>
                                                    <p class="text-muted mb-0">Total Spent</p>
                                                </div>
                                            </div>
                                        </div>
                                    <?php else: ?>
                                        <div class="text-center">
                                            <i class="mdi mdi-chart-line-variant text-muted" style="font-size: 3rem;"></i>
                                            <p class="text-muted mt-2 mb-0">No order statistics available</p>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </div>

                            <!-- Actions Card -->
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title mb-3">
                                        <i class="mdi mdi-cog me-2"></i>Actions
                                    </h5>
                                    <form method="POST" action="index.php?page=users&action=view&id=<?php echo htmlspecialchars($user['_id'] ?? ''); ?>">
                                        <input type="hidden" name="action" value="update_status">
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="isActive" name="isActive" 
                                                   <?php echo ($user['isActive'] ?? false) ? 'checked' : ''; ?>>
                                            <label class="form-check-label" for="isActive">
                                                <strong>Active User</strong>
                                                <br><small class="text-muted">Toggle to activate/deactivate this user</small>
                                            </label>
                                        </div>
                                        <div class="d-grid gap-2">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="mdi mdi-content-save me-1"></i>Update Status
                                            </button>
                                            <button type="button" class="btn btn-secondary" onclick="window.location.href='index.php?page=users'">
                                                <i class="mdi mdi-arrow-left me-1"></i>Back to Users
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-8">
                            <!-- Order History Card -->
                            <div class="card">
                                <div class="card-body">
                                    <div class="d-sm-flex flex-wrap align-items-center mb-4">
                                        <h4 class="card-title mb-0">
                                            <i class="mdi mdi-package-variant me-2"></i>Order History
                                        </h4>
                                        <div class="ms-auto">
                                            <div class="btn-group" role="group">
                                                <button type="button" class="btn btn-outline-secondary btn-sm">
                                                    <i class="mdi mdi-download me-1"></i>Export
                                                </button>
                                                <button type="button" class="btn btn-outline-secondary btn-sm">
                                                    <i class="mdi mdi-refresh me-1"></i>Refresh
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="table-responsive">
                                        <table class="table align-middle table-nowrap table-hover mb-0">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Date</th>
                                                    <th>Items</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php if (!empty($userOrders) && is_array($userOrders)): ?>
                                                    <?php 
                                                    $orders = isset($userOrders['orders']) ? $userOrders['orders'] : $userOrders;
                                                    if (!empty($orders)):
                                                    ?>
                                                        <?php foreach ($orders as $order): ?>
                                                            <tr>
                                                                <td>
                                                                    <a href="index.php?page=orders&action=view&id=<?php echo htmlspecialchars($order['_id'] ?? ''); ?>" 
                                                                       class="text-body fw-bold">
                                                                        #<?php echo htmlspecialchars($order['orderNumber'] ?? $order['_id'] ?? 'N/A'); ?>
                                                                    </a>
                                                                </td>
                                                                <td><?php echo isset($order['createdAt']) ? date('M d, Y', strtotime($order['createdAt'])) : 'N/A'; ?></td>
                                                                <td>
                                                                    <span class="badge badge-soft-info">
                                                                        <?php echo count($order['orderItems'] ?? []); ?> items
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <strong>₹<?php echo number_format($order['totalPrice'] ?? 0, 2); ?></strong>
                                                                </td>
                                                                <td>
                                                                    <span class="badge badge-soft-<?php 
                                                                        $statusClass = 'secondary';
                                                                        switch($order['status']) {
                                                                            case 'delivered':
                                                                                $statusClass = 'success';
                                                                                break;
                                                                            case 'shipped':
                                                                                $statusClass = 'info';
                                                                                break;
                                                                            case 'processing':
                                                                                $statusClass = 'warning';
                                                                                break;
                                                                            case 'cancelled':
                                                                                $statusClass = 'danger';
                                                                                break;
                                                                        }
                                                                        echo $statusClass;
                                                                    ?>">
                                                                        <?php echo ucfirst($order['status']); ?>
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <a href="index.php?page=orders&action=view&id=<?php echo htmlspecialchars($order['_id'] ?? ''); ?>" 
                                                                       class="text-success" title="View Order">
                                                                        <i class="mdi mdi-eye font-size-18"></i>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        <?php endforeach; ?>
                                                    <?php else: ?>
                                                        <tr>
                                                            <td colspan="6" class="text-center py-4">
                                                                <div class="text-muted">
                                                                    <i class="mdi mdi-package-variant-closed" style="font-size: 3rem;"></i>
                                                                    <h5 class="mt-2">No Orders Found</h5>
                                                                    <p class="mb-0">This user hasn't placed any orders yet.</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    <?php endif; ?>
                                                <?php else: ?>
                                                    <tr>
                                                        <td colspan="6" class="text-center py-4">
                                                            <div class="text-muted">
                                                                <i class="mdi mdi-package-variant-closed" style="font-size: 3rem;"></i>
                                                                <h5 class="mt-2">No Orders Found</h5>
                                                                <p class="mb-0">This user hasn't placed any orders yet.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                <?php endif; ?>
                                            </tbody>
                                        </table>
                                    </div>

                                    <!-- Pagination for user orders -->
                                    <?php if (!empty($userOrders['pagination']) && $userOrders['pagination']['pages'] > 1): ?>
                                        <div class="row mt-3">
                                            <div class="col-lg-12">
                                                <ul class="pagination pagination-rounded justify-content-end mb-2">
                                                    <?php 
                                                    $pagination = $userOrders['pagination'];
                                                    $currentPage = $pagination['page'];
                                                    $totalPages = $pagination['pages'];
                                                    ?>
                                                    
                                                    <?php if ($currentPage > 1): ?>
                                                        <li class="page-item">
                                                            <a class="page-link" href="?page=users&action=view&id=<?php echo $userId; ?>&op=<?php echo $currentPage - 1; ?>">Previous</a>
                                                        </li>
                                                    <?php endif; ?>
                                                    
                                                    <?php for ($i = max(1, $currentPage - 2); $i <= min($totalPages, $currentPage + 2); $i++): ?>
                                                        <li class="page-item <?php echo $i === $currentPage ? 'active' : ''; ?>">
                                                            <a class="page-link" href="?page=users&action=view&id=<?php echo $userId; ?>&op=<?php echo $i; ?>"><?php echo $i; ?></a>
                                                        </li>
                                                    <?php endfor; ?>
                                                    
                                                    <?php if ($currentPage < $totalPages): ?>
                                                        <li class="page-item">
                                                            <a class="page-link" href="?page=users&action=view&id=<?php echo $userId; ?>&op=<?php echo $currentPage + 1; ?>">Next</a>
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
                <?php else: ?>
                    <!-- User Not Found -->
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body text-center py-5">
                                    <div class="text-muted">
                                        <i class="mdi mdi-account-alert" style="font-size: 4rem;"></i>
                                        <h4 class="mt-3">User Not Found</h4>
                                        <p class="mb-3">The requested user could not be found or you don't have permission to view it.</p>
                                        <button type="button" class="btn btn-primary" onclick="window.location.href='index.php?page=users'">
                                            <i class="mdi mdi-arrow-left me-1"></i>Back to Users
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
// Users management JavaScript
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

    // Filter functionality
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (roleFilter) {
        roleFilter.addEventListener('change', applyFilters);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    // Check all functionality
    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('input[name="userIds[]"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
});

function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const role = document.getElementById('roleFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    const params = new URLSearchParams();
    params.append('page', 'users');
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    
    window.location.href = '?' + params.toString();
}

function updateUserStatus(userId, isActive) {
    const action = isActive ? 'activate' : 'deactivate';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `index.php?page=users&action=view&id=${userId}`;
        
        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'action';
        actionInput.value = 'update_status';
        
        if (isActive) {
            const statusInput = document.createElement('input');
            statusInput.type = 'hidden';
            statusInput.name = 'isActive';
            statusInput.value = '1';
            form.appendChild(statusInput);
        }
        
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
    }
}
</script>