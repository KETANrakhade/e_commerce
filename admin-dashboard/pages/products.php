<?php
// Handle product actions
$action = $_GET['action'] ?? 'list';
$productId = $_GET['id'] ?? '';

// Get products data from Node.js backend API only
$page = $_GET['page'] ?? 1;
$search = $_GET['search'] ?? '';
$category = $_GET['category'] ?? '';
$status = $_GET['status'] ?? '';

$queryParams = http_build_query([
    'page' => $page,
    'limit' => 10,
    'search' => $search,
    'category' => $category,
    'status' => $status
]);

$productsData = makeApiCall("/admin/products?$queryParams");
$products = $productsData['success'] ? $productsData['data'] : [
    'products' => [],
    'pagination' => ['page' => 1, 'pages' => 1, 'total' => 0],
    'categories' => []
];

// Handle API errors
$apiError = '';
if (!$productsData['success']) {
    $apiError = 'Failed to load products. Please ensure your backend server is running.';
}
$allProducts = $productsData['success'] ? $productsData['data'] : [];

// Create products structure with pagination
$products = [
    'products' => $allProducts,
    'categories' => ['Men', 'Women', 'Footwear', 'Accessories'],
    'pagination' => [
        'page' => 1,
        'pages' => 1,
        'total' => count($allProducts)
    ]
];

// Add isActive field to products for display
foreach ($products['products'] as &$prod) {
    $prod['isActive'] = $prod['status'] === 'active';
    $prod['brand'] = $prod['brand'] ?? 'Pyramid';
}

// Handle form submissions
if ($_POST && isset($_POST['action'])) {
    $postAction = $_POST['action'];
    
    if ($postAction === 'create') {
        $productData = [
            'name' => $_POST['name'],
            'description' => $_POST['description'],
            'price' => floatval($_POST['price']),
            'category' => $_POST['category'],
            'stock' => intval($_POST['stock']),
            'images' => explode(',', $_POST['images']),
            'brand' => $_POST['brand'],
            'featured' => isset($_POST['featured'])
        ];
        
        $result = makeApiCall('/admin/products', 'POST', $productData);
        if ($result['success']) {
            header('Location: index.php?page=products&success=Product created successfully');
            exit();
        } else {
            $error = $result['error'] ?? 'Failed to create product';
        }
    } elseif ($postAction === 'update' && $productId) {
        $productData = [
            'name' => $_POST['name'],
            'description' => $_POST['description'],
            'price' => floatval($_POST['price']),
            'category' => $_POST['category'],
            'stock' => intval($_POST['stock']),
            'images' => explode(',', $_POST['images']),
            'brand' => $_POST['brand'],
            'featured' => isset($_POST['featured']),
            'isActive' => isset($_POST['isActive'])
        ];
        
        $result = makeApiCall("/admin/products/$productId", 'PUT', $productData);
        if ($result['success']) {
            header('Location: index.php?page=products&success=Product updated successfully');
            exit();
        } else {
            $error = $result['error'] ?? 'Failed to update product';
        }
    } elseif ($postAction === 'delete' && $productId) {
        $result = makeApiCall("/admin/products/$productId", 'DELETE');
        if ($result['success']) {
            header('Location: index.php?page=products&success=Product deleted successfully');
            exit();
        } else {
            $error = $result['error'] ?? 'Failed to delete product';
        }
    }
}

// Get single product for edit
$product = null;
if ($action === 'edit' && $productId) {
    $productResult = makeApiCall("/admin/products/$productId");
    $product = $productResult['success'] ? $productResult['data'] : null;
}
?>

<div class="main-content">
    <div class="page-content">
        <div class="container-fluid">
            <!-- Page Title -->
            <div class="row">
                <div class="col-12">
                    <div class="page-title-box d-sm-flex align-items-center justify-content-between">
                        <h4 class="mb-sm-0 font-size-18">Products</h4>
                        <div class="page-title-right">
                            <ol class="breadcrumb m-0">
                                <li class="breadcrumb-item"><a href="index.php">Admin</a></li>
                                <li class="breadcrumb-item active">Products</li>
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
                <!-- Product List -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row mb-2">
                                    <div class="col-sm-4">
                                        <div class="search-box me-2 mb-2 d-inline-block">
                                            <div class="position-relative">
                                                <input type="text" class="form-control" id="searchInput" 
                                                       placeholder="Search products..." value="<?php echo htmlspecialchars($search); ?>">
                                                <i class="bx bx-search-alt search-icon"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-8">
                                        <div class="text-sm-end">
                                            <button type="button" class="btn btn-success btn-rounded waves-effect waves-light mb-2 me-2" onclick="window.location.href='index.php?page=products&action=create'">
                                                <i class="mdi mdi-plus me-1"></i> Add Product
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Filters -->
                                <div class="row mb-3">
                                    <div class="col-md-3">
                                        <select class="form-select" id="categoryFilter">
                                            <option value="">All Categories</option>
                                            <?php if (!empty($products['categories'])): ?>
                                                <?php foreach ($products['categories'] as $cat): ?>
                                                    <option value="<?php echo htmlspecialchars($cat); ?>" 
                                                            <?php echo $category === $cat ? 'selected' : ''; ?>>
                                                        <?php echo htmlspecialchars($cat); ?>
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
                                                <th scope="col">Product</th>
                                                <th scope="col">Category</th>
                                                <th scope="col">Stock</th>
                                                <th scope="col">Price</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php if (!empty($products['products'])): ?>
                                                <?php foreach ($products['products'] as $prod): ?>
                                                    <tr>
                                                        <th scope="row">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" 
                                                                       name="productIds[]" value="<?php echo $prod['_id']; ?>">
                                                            </div>
                                                        </th>
                                                        <td>
                                                            <div class="d-flex align-items-center">
                                                                <div class="avatar-sm bg-light rounded p-1 me-2">
                                                                    <?php if (!empty($prod['images'][0])): ?>
                                                                        <img src="<?php echo htmlspecialchars($prod['images'][0]); ?>" 
                                                                             alt="" class="img-fluid d-block">
                                                                    <?php else: ?>
                                                                        <div class="avatar-sm bg-light d-flex align-items-center justify-content-center">
                                                                            <i class="bx bx-package font-size-16"></i>
                                                                        </div>
                                                                    <?php endif; ?>
                                                                </div>
                                                                <div>
                                                                    <h5 class="text-truncate font-size-14 mb-1">
                                                                        <a href="javascript: void(0);" class="text-dark">
                                                                            <?php echo htmlspecialchars($prod['name']); ?>
                                                                        </a>
                                                                    </h5>
                                                                    <p class="text-muted mb-0"><?php echo htmlspecialchars($prod['brand'] ?? 'No Brand'); ?></p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><?php echo htmlspecialchars($prod['category']); ?></td>
                                                        <td>
                                                            <div class="text-center">
                                                                <span class="badge badge-pill badge-soft-<?php echo $prod['stock'] > 0 ? 'success' : 'danger'; ?> font-size-12">
                                                                    <?php echo $prod['stock']; ?>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>₹ <?php echo number_format($prod['price'], 2); ?></td>
                                                        <td>
                                                            <span class="badge badge-pill badge-soft-<?php echo $prod['isActive'] ? 'success' : 'danger'; ?> font-size-11">
                                                                <?php echo $prod['isActive'] ? 'Active' : 'Inactive'; ?>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div class="d-flex gap-3">
                                                                <a href="index.php?page=products&action=edit&id=<?php echo $prod['_id']; ?>" 
                                                                   class="text-success">
                                                                    <i class="mdi mdi-pencil font-size-18"></i>
                                                                </a>
                                                                <a href="javascript:void(0);" class="text-danger" 
                                                                   onclick="deleteProduct('<?php echo $prod['_id']; ?>')">
                                                                    <i class="mdi mdi-delete font-size-18"></i>
                                                                </a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            <?php else: ?>
                                                <tr>
                                                    <td colspan="7" class="text-center">No products found</td>
                                                </tr>
                                            <?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Pagination -->
                                <?php if (!empty($products['pagination']) && $products['pagination']['pages'] > 1): ?>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <ul class="pagination pagination-rounded justify-content-end mb-2">
                                                <?php 
                                                $pagination = $products['pagination'];
                                                $currentPage = $pagination['page'];
                                                $totalPages = $pagination['pages'];
                                                ?>
                                                
                                                <?php if ($currentPage > 1): ?>
                                                    <li class="page-item">
                                                        <a class="page-link" href="?page=products&p=<?php echo $currentPage - 1; ?>&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&status=<?php echo urlencode($status); ?>">Previous</a>
                                                    </li>
                                                <?php endif; ?>
                                                
                                                <?php for ($i = max(1, $currentPage - 2); $i <= min($totalPages, $currentPage + 2); $i++): ?>
                                                    <li class="page-item <?php echo $i === $currentPage ? 'active' : ''; ?>">
                                                        <a class="page-link" href="?page=products&p=<?php echo $i; ?>&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&status=<?php echo urlencode($status); ?>"><?php echo $i; ?></a>
                                                    </li>
                                                <?php endfor; ?>
                                                
                                                <?php if ($currentPage < $totalPages): ?>
                                                    <li class="page-item">
                                                        <a class="page-link" href="?page=products&p=<?php echo $currentPage + 1; ?>&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&status=<?php echo urlencode($status); ?>">Next</a>
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

            <?php elseif ($action === 'create' || $action === 'edit'): ?>
                <!-- Product Form -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h4 class="card-title"><?php echo $action === 'create' ? 'Add New Product' : 'Edit Product'; ?></h4>
                                <p class="card-title-desc">Fill all information below</p>

                                <form method="POST" action="">
                                    <input type="hidden" name="action" value="<?php echo $action === 'create' ? 'create' : 'update'; ?>">
                                    
                                    <div class="row">
                                        <div class="col-sm-6">
                                            <div class="mb-3">
                                                <label for="name">Product Name</label>
                                                <input id="name" name="name" type="text" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['name'] ?? ''); ?>" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="price">Price</label>
                                                <input id="price" name="price" type="number" step="0.01" class="form-control" 
                                                       value="<?php echo $product['price'] ?? ''; ?>" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="category">Category</label>
                                                <input id="category" name="category" type="text" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['category'] ?? ''); ?>" required>
                                            </div>
                                        </div>

                                        <div class="col-sm-6">
                                            <div class="mb-3">
                                                <label for="brand">Brand</label>
                                                <input id="brand" name="brand" type="text" class="form-control" 
                                                       value="<?php echo htmlspecialchars($product['brand'] ?? ''); ?>">
                                            </div>
                                            <div class="mb-3">
                                                <label for="stock">Stock Quantity</label>
                                                <input id="stock" name="stock" type="number" class="form-control" 
                                                       value="<?php echo $product['stock'] ?? '0'; ?>" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="images">Images (comma separated URLs)</label>
                                                <input id="images" name="images" type="text" class="form-control" 
                                                       value="<?php echo htmlspecialchars(implode(',', $product['images'] ?? [])); ?>">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="description">Description</label>
                                        <textarea class="form-control" id="description" name="description" rows="5"><?php echo htmlspecialchars($product['description'] ?? ''); ?></textarea>
                                    </div>

                                    <div class="row">
                                        <div class="col-sm-6">
                                            <div class="form-check mb-3">
                                                <input class="form-check-input" type="checkbox" id="featured" name="featured" 
                                                       <?php echo (!empty($product['featured'])) ? 'checked' : ''; ?>>
                                                <label class="form-check-label" for="featured">Featured Product</label>
                                            </div>
                                        </div>
                                        <?php if ($action === 'edit'): ?>
                                            <div class="col-sm-6">
                                                <div class="form-check mb-3">
                                                    <input class="form-check-input" type="checkbox" id="isActive" name="isActive" 
                                                           <?php echo (!empty($product['isActive'])) ? 'checked' : ''; ?>>
                                                    <label class="form-check-label" for="isActive">Active</label>
                                                </div>
                                            </div>
                                        <?php endif; ?>
                                    </div>

                                    <div class="d-flex flex-wrap gap-2">
                                        <button type="submit" class="btn btn-primary waves-effect waves-light">
                                            <?php echo $action === 'create' ? 'Create Product' : 'Update Product'; ?>
                                        </button>
                                        <button type="button" class="btn btn-secondary waves-effect waves-light" 
                                                onclick="window.location.href='index.php?page=products'">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
// Product management JavaScript
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
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    // Check all functionality
    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('input[name="productIds[]"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
});

function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    const params = new URLSearchParams();
    params.append('page', 'products');
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    
    window.location.href = '?' + params.toString();
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `index.php?page=products&action=delete&id=${productId}`;
        
        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'action';
        actionInput.value = 'delete';
        
        form.appendChild(actionInput);
        document.body.appendChild(form);
        form.submit();
    }
}
</script>