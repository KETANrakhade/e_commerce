<?php
// Include sample data
require_once __DIR__ . '/../config/sample_data.php';

// Handle user actions
$action = $_GET['action'] ?? 'list';
$userId = $_GET['id'] ?? '';

// Get users data from sample data
$page = $_GET['p'] ?? 1;
$search = $_GET['search'] ?? '';
$role = $_GET['role'] ?? '';
$status = $_GET['status'] ?? '';

$usersData = makeApiCall("/admin/users");
$allUsers = $usersData['success'] ? $usersData['data'] : [];

// Create users structure with pagination
$users = [
    'users' => $allUsers,
    'pagination' => [
        'page' => 1,
        'pages' => 1,
        'total' => count($allUsers)
    ]
];

// Handle status update
if ($_POST && isset($_POST['action']) && $_POST['action'] === 'update_status' && $userId) {
    $isActive = isset($_POST['isActive']);
    $result = makeApiCall("/admin/users/$userId/status", 'PUT', ['isActive' => $isActive]);
    
    if ($result['success']) {
        header('Location: index.php?page=users&success=User status updated successfully');
        exit();
    } else {
        $error = $result['error'] ?? 'Failed to update user status';
    }
}

// Get single user for details
$user = null;
$userOrders = [];
if ($action === 'view' && $userId) {
    $userResult = makeApiCall("/admin/users/$userId");
    $user = $userResult['success'] ? $userResult['data'] : null;
    
    if ($user) {
        $ordersResult = makeApiCall("/admin/users/$userId/orders");
        $userOrders = $ordersResult['success'] ? $ordersResult['data'] : [];
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
                    <?php echo htmlspecialchars($error); ?>
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
                                                                        <?php echo strtoupper(substr($usr['name'], 0, 1)); ?>
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h5 class="text-truncate font-size-14 mb-1">
                                                                        <a href="index.php?page=users&action=view&id=<?php echo $usr['_id']; ?>" class="text-dark">
                                                                            <?php echo htmlspecialchars($usr['name']); ?>
                                                                        </a>
                                                                    </h5>
                                                                    <?php if (!empty($usr['lastLogin'])): ?>
                                                                        <p class="text-muted mb-0">Last login: <?php echo date('M d, Y', strtotime($usr['lastLogin'])); ?></p>
                                                                    <?php endif; ?>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><?php echo htmlspecialchars($usr['email']); ?></td>
                                                        <td>
                                                            <span class="badge badge-pill badge-soft-<?php echo $usr['role'] === 'admin' ? 'danger' : 'primary'; ?> font-size-11">
                                                                <?php echo ucfirst($usr['role']); ?>
                                                            </span>
                                                        </td>
                                                        <td><?php echo date('M d, Y', strtotime($usr['createdAt'])); ?></td>
                                                        <td>
                                                            <span class="badge badge-pill badge-soft-<?php echo $usr['isActive'] ? 'success' : 'danger'; ?> font-size-11">
                                                                <?php echo $usr['isActive'] ? 'Active' : 'Inactive'; ?>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div class="d-flex gap-3">
                                                                <a href="index.php?page=users&action=view&id=<?php echo $usr['_id']; ?>" 
                                                                   class="text-success">
                                                                    <i class="mdi mdi-eye font-size-18"></i>
                                                                </a>
                                                                <div class="dropdown">
                                                                    <a class="text-muted font-size-16" role="button" 
                                                                       data-bs-toggle="dropdown" aria-haspopup="true">
                                                                        <i class="bx bx-dots-horizontal-rounded"></i>
                                                                    </a>
                                                                    <div class="dropdown-menu dropdown-menu-end">
                                                                        <?php if ($usr['isActive']): ?>
                                                                            <a class="dropdown-item text-warning" href="#" onclick="updateUserStatus('<?php echo $usr['_id']; ?>', false)">Deactivate User</a>
                                                                        <?php else: ?>
                                                                            <a class="dropdown-item text-success" href="#" onclick="updateUserStatus('<?php echo $usr['_id']; ?>', true)">Activate User</a>
                                                                        <?php endif; ?>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            <?php else: ?>
                                                <tr>
                                                    <td colspan="7" class="text-center">No users found</td>
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

            <?php elseif ($action === 'view' && $user): ?>
                <!-- User Details -->
                <div class="row">
                    <div class="col-lg-4">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex">
                                    <div class="flex-shrink-0 me-3">
                                        <div class="avatar-md">
                                            <span class="avatar-title rounded-circle bg-light text-primary font-size-24">
                                                <?php echo strtoupper(substr($user['name'], 0, 1)); ?>
                                            </span>
                                        </div>
                                    </div>
                                    <div class="flex-grow-1 align-self-center">
                                        <div class="text-muted">
                                            <h5><?php echo htmlspecialchars($user['name']); ?></h5>
                                            <p class="mb-1"><?php echo htmlspecialchars($user['email']); ?></p>
                                            <p class="mb-0"><?php echo ucfirst($user['role']); ?></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">User Information</h5>
                                <div class="table-responsive">
                                    <table class="table table-nowrap mb-0">
                                        <tbody>
                                            <tr>
                                                <th scope="row">Full Name :</th>
                                                <td><?php echo htmlspecialchars($user['name']); ?></td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Email :</th>
                                                <td><?php echo htmlspecialchars($user['email']); ?></td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Role :</th>
                                                <td><?php echo ucfirst($user['role']); ?></td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Status :</th>
                                                <td>
                                                    <span class="badge badge-pill badge-soft-<?php echo $user['isActive'] ? 'success' : 'danger'; ?> font-size-11">
                                                        <?php echo $user['isActive'] ? 'Active' : 'Inactive'; ?>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Joined Date :</th>
                                                <td><?php echo date('M d, Y', strtotime($user['createdAt'])); ?></td>
                                            </tr>
                                            <?php if (!empty($user['lastLogin'])): ?>
                                                <tr>
                                                    <th scope="row">Last Login :</th>
                                                    <td><?php echo date('M d, Y H:i', strtotime($user['lastLogin'])); ?></td>
                                                </tr>
                                            <?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Order Statistics</h5>
                                <?php if (!empty($user['orderStats'])): ?>
                                    <div class="text-muted">
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="mt-4">
                                                    <p class="mb-2 text-truncate">Total Orders</p>
                                                    <h5><?php echo $user['orderStats']['totalOrders']; ?></h5>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="mt-4">
                                                    <p class="mb-2 text-truncate">Total Spent</p>
                                                    <h5>₹ <?php echo number_format($user['orderStats']['totalSpent'], 2); ?></h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                <?php else: ?>
                                    <p class="text-muted">No order statistics available</p>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Actions</h5>
                                <form method="POST" action="index.php?page=users&action=view&id=<?php echo $user['_id']; ?>">
                                    <input type="hidden" name="action" value="update_status">
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="isActive" name="isActive" 
                                               <?php echo $user['isActive'] ? 'checked' : ''; ?>>
                                        <label class="form-check-label" for="isActive">Active User</label>
                                    </div>
                                    <button type="submit" class="btn btn-primary btn-sm">Update Status</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-sm-flex flex-wrap">
                                    <h4 class="card-title mb-4">Order History</h4>
                                    <div class="ms-auto">
                                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.location.href='index.php?page=users'">
                                            <i class="bx bx-arrow-back me-1"></i> Back to Users
                                        </button>
                                    </div>
                                </div>

                                <div class="table-responsive">
                                    <table class="table align-middle table-nowrap mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php if (!empty($userOrders['orders'])): ?>
                                                <?php foreach ($userOrders['orders'] as $order): ?>
                                                    <tr>
                                                        <td>
                                                            <a href="index.php?page=orders&action=view&id=<?php echo $order['_id']; ?>" 
                                                               class="text-body fw-bold"><?php echo htmlspecialchars($order['orderNumber']); ?></a>
                                                        </td>
                                                        <td><?php echo date('M d, Y', strtotime($order['createdAt'])); ?></td>
                                                        <td>₹ <?php echo number_format($order['totalPrice'], 2); ?></td>
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
                                                        <td>
                                                            <a href="index.php?page=orders&action=view&id=<?php echo $order['_id']; ?>" 
                                                               class="text-success">
                                                                <i class="mdi mdi-eye font-size-18"></i>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            <?php else: ?>
                                                <tr>
                                                    <td colspan="5" class="text-center">No orders found</td>
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