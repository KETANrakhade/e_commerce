<?php
session_start();
require_once '../config/admin_config.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: ../login.php');
    exit();
}

// Get product ID from URL
$productId = isset($_GET['productId']) ? $_GET['productId'] : '';
if (empty($productId)) {
    header('Location: products.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Color Variants - Pyramid Admin</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../assets/css/admin.css">
    
    <style>
        .color-variant-card {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }
        
        .color-variant-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .color-variant-header {
            background: #f8f9fa;
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: between;
            align-items: center;
        }
        
        .color-variant-body {
            padding: 20px;
        }
        
        .image-upload-area {
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            background: #f8f9fa;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .image-upload-area:hover {
            border-color: #007bff;
            background: #e3f2fd;
        }
        
        .image-upload-area.dragover {
            border-color: #28a745;
            background: #d4edda;
        }
        
        .image-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 20px;
        }
        
        .image-preview-item {
            position: relative;
            width: 120px;
            height: 120px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid #dee2e6;
        }
        
        .image-preview-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .image-preview-item.primary {
            border-color: #28a745;
            box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.3);
        }
        
        .image-actions {
            position: absolute;
            top: 5px;
            right: 5px;
            display: flex;
            gap: 5px;
        }
        
        .image-action-btn {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            cursor: pointer;
        }
        
        .btn-set-primary {
            background: #28a745;
            color: white;
        }
        
        .btn-delete-image {
            background: #dc3545;
            color: white;
        }
        
        .color-swatch {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid #dee2e6;
            display: inline-block;
            margin-right: 10px;
        }
        
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .loading-spinner {
            background: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
        }
        
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
        }
        
        .empty-state i {
            font-size: 64px;
            margin-bottom: 20px;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <?php include '../layout/navbar.php'; ?>
    
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <?php include '../layout/sidebar.php'; ?>
            
            <!-- Main Content -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">
                        <i class="fas fa-palette me-2"></i>
                        Manage Color Variants
                    </h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <button type="button" class="btn btn-primary" onclick="addNewColorVariant()">
                            <i class="fas fa-plus me-1"></i>
                            Add Color Variant
                        </button>
                        <a href="products.php" class="btn btn-outline-secondary ms-2">
                            <i class="fas fa-arrow-left me-1"></i>
                            Back to Products
                        </a>
                    </div>
                </div>
                
                <!-- Product Info -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h5 class="card-title mb-1" id="productName">Loading...</h5>
                                <p class="text-muted mb-0" id="productInfo">Product ID: <?php echo htmlspecialchars($productId); ?></p>
                            </div>
                            <div class="col-md-4 text-end">
                                <span class="badge bg-info" id="variantCount">0 Variants</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Color Variants Container -->
                <div id="colorVariantsContainer">
                    <!-- Color variants will be loaded here -->
                </div>
                
                <!-- Empty State -->
                <div id="emptyState" class="empty-state" style="display: none;">
                    <i class="fas fa-palette"></i>
                    <h4>No Color Variants</h4>
                    <p>This product doesn't have any color variants yet. Add your first color variant to get started.</p>
                    <button type="button" class="btn btn-primary" onclick="addNewColorVariant()">
                        <i class="fas fa-plus me-1"></i>
                        Add First Color Variant
                    </button>
                </div>
            </main>
        </div>
    </div>
    
    <!-- Add/Edit Color Variant Modal -->
    <div class="modal fade" id="colorVariantModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">Add Color Variant</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="colorVariantForm">
                        <input type="hidden" id="variantId" name="variantId">
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="colorName" class="form-label">Color Name *</label>
                                    <input type="text" class="form-control" id="colorName" name="colorName" required>
                                    <div class="form-text">e.g., Jet Black, Navy Blue, Crimson Red</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="colorCode" class="form-label">Color Code</label>
                                    <div class="input-group">
                                        <input type="color" class="form-control form-control-color" id="colorCode" name="colorCode" value="#000000">
                                        <input type="text" class="form-control" id="colorCodeText" name="colorCodeText" placeholder="#000000">
                                    </div>
                                    <div class="form-text">Optional: Choose or enter hex color code</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="sku" class="form-label">SKU *</label>
                                    <input type="text" class="form-control" id="sku" name="sku" required>
                                    <div class="form-text">Unique identifier for this color variant</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="stock" class="form-label">Stock Quantity</label>
                                    <input type="number" class="form-control" id="stock" name="stock" min="0" value="0">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="priceModifier" class="form-label">Price Modifier</label>
                                    <div class="input-group">
                                        <span class="input-group-text">₹</span>
                                        <input type="number" class="form-control" id="priceModifier" name="priceModifier" step="0.01" value="0">
                                    </div>
                                    <div class="form-text">Additional cost for this color (can be negative)</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="sortOrder" class="form-label">Sort Order</label>
                                    <input type="number" class="form-control" id="sortOrder" name="sortOrder" min="0" value="0">
                                    <div class="form-text">Display order (lower numbers appear first)</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="isActive" name="isActive" checked>
                                <label class="form-check-label" for="isActive">
                                    Active (visible to customers)
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveColorVariant()">
                        <i class="fas fa-save me-1"></i>
                        Save Color Variant
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-2">Processing...</div>
        </div>
    </div>
    
    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/js/admin.js"></script>
    
    <script>
        // Global variables
        const productId = '<?php echo $productId; ?>';
        const API_BASE_URL = 'http://localhost:5001/api';
        let currentColorVariants = [];
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadProductInfo();
            loadColorVariants();
            
            // Color code synchronization
            document.getElementById('colorCode').addEventListener('change', function() {
                document.getElementById('colorCodeText').value = this.value;
            });
            
            document.getElementById('colorCodeText').addEventListener('input', function() {
                if (this.value.match(/^#[0-9A-F]{6}$/i)) {
                    document.getElementById('colorCode').value = this.value;
                }
            });
        });
        
        // Load product information
        async function loadProductInfo() {
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('productName').textContent = data.data.name;
                    document.getElementById('productInfo').innerHTML = `
                        Product ID: ${productId} | 
                        Price: ₹${data.data.price} | 
                        Stock: ${data.data.stock}
                    `;
                }
            } catch (error) {
                console.error('Error loading product info:', error);
                showToast('Error loading product information', 'error');
            }
        }
        
        // Load color variants
        async function loadColorVariants() {
            showLoading(true);
            
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}/color-variants`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    currentColorVariants = data.data.colorVariants || [];
                    renderColorVariants();
                    updateVariantCount();
                } else {
                    throw new Error(data.message || 'Failed to load color variants');
                }
            } catch (error) {
                console.error('Error loading color variants:', error);
                showToast('Error loading color variants', 'error');
            } finally {
                showLoading(false);
            }
        }
        
        // Render color variants
        function renderColorVariants() {
            const container = document.getElementById('colorVariantsContainer');
            const emptyState = document.getElementById('emptyState');
            
            if (currentColorVariants.length === 0) {
                container.innerHTML = '';
                emptyState.style.display = 'block';
                return;
            }
            
            emptyState.style.display = 'none';
            
            container.innerHTML = currentColorVariants.map(variant => `
                <div class="color-variant-card" data-variant-id="${variant._id}">
                    <div class="color-variant-header">
                        <div class="d-flex align-items-center">
                            <div class="color-swatch" style="background-color: ${variant.colorCode || '#ccc'}"></div>
                            <div>
                                <h6 class="mb-0">${variant.colorName}</h6>
                                <small class="text-muted">SKU: ${variant.sku}</small>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge ${variant.isActive ? 'bg-success' : 'bg-secondary'}">
                                ${variant.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span class="badge bg-info">${variant.stock} in stock</span>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    Actions
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="editColorVariant('${variant._id}')">
                                        <i class="fas fa-edit me-1"></i> Edit Details
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="setDefaultVariant('${variant._id}')">
                                        <i class="fas fa-star me-1"></i> Set as Default
                                    </a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="deleteColorVariant('${variant._id}')">
                                        <i class="fas fa-trash me-1"></i> Delete
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="color-variant-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h6>Images (${variant.images ? variant.images.length : 0})</h6>
                                <div class="image-upload-area" onclick="triggerImageUpload('${variant._id}')" 
                                     ondrop="handleImageDrop(event, '${variant._id}')" 
                                     ondragover="handleDragOver(event)"
                                     ondragleave="handleDragLeave(event)">
                                    <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                                    <p class="mb-0">Click to upload or drag & drop images</p>
                                    <small class="text-muted">Maximum 5 images, 5MB each</small>
                                </div>
                                <input type="file" id="imageUpload-${variant._id}" multiple accept="image/*" 
                                       style="display: none;" onchange="uploadImages('${variant._id}', this.files)">
                                
                                <div class="image-preview" id="imagePreview-${variant._id}">
                                    ${renderVariantImages(variant)}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6 class="card-title">Variant Details</h6>
                                        <p class="mb-1"><strong>Color:</strong> ${variant.colorName}</p>
                                        <p class="mb-1"><strong>SKU:</strong> ${variant.sku}</p>
                                        <p class="mb-1"><strong>Stock:</strong> ${variant.stock}</p>
                                        <p class="mb-1"><strong>Price Modifier:</strong> ₹${variant.priceModifier || 0}</p>
                                        <p class="mb-0"><strong>Sort Order:</strong> ${variant.sortOrder || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Render variant images
        function renderVariantImages(variant) {
            if (!variant.images || variant.images.length === 0) {
                return '<p class="text-muted mt-3">No images uploaded yet</p>';
            }
            
            return variant.images.map((image, index) => `
                <div class="image-preview-item ${image.isPrimary ? 'primary' : ''}">
                    <img src="${image.url}" alt="${variant.colorName}">
                    <div class="image-actions">
                        ${!image.isPrimary ? `
                            <button class="image-action-btn btn-set-primary" 
                                    onclick="setPrimaryImage('${variant._id}', ${index})"
                                    title="Set as primary">
                                <i class="fas fa-star"></i>
                            </button>
                        ` : ''}
                        <button class="image-action-btn btn-delete-image" 
                                onclick="deleteImage('${variant._id}', ${index})"
                                title="Delete image">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Update variant count
        function updateVariantCount() {
            const count = currentColorVariants.length;
            document.getElementById('variantCount').textContent = `${count} Variant${count !== 1 ? 's' : ''}`;
        }
        
        // Add new color variant
        function addNewColorVariant() {
            document.getElementById('modalTitle').textContent = 'Add Color Variant';
            document.getElementById('colorVariantForm').reset();
            document.getElementById('variantId').value = '';
            document.getElementById('isActive').checked = true;
            
            // Generate SKU suggestion
            const baseSku = `${productId}-COLOR-${Date.now()}`.toUpperCase();
            document.getElementById('sku').value = baseSku;
            
            new bootstrap.Modal(document.getElementById('colorVariantModal')).show();
        }
        
        // Edit color variant
        function editColorVariant(variantId) {
            const variant = currentColorVariants.find(v => v._id === variantId);
            if (!variant) return;
            
            document.getElementById('modalTitle').textContent = 'Edit Color Variant';
            document.getElementById('variantId').value = variant._id;
            document.getElementById('colorName').value = variant.colorName;
            document.getElementById('colorCode').value = variant.colorCode || '#000000';
            document.getElementById('colorCodeText').value = variant.colorCode || '#000000';
            document.getElementById('sku').value = variant.sku;
            document.getElementById('stock').value = variant.stock || 0;
            document.getElementById('priceModifier').value = variant.priceModifier || 0;
            document.getElementById('sortOrder').value = variant.sortOrder || 0;
            document.getElementById('isActive').checked = variant.isActive;
            
            new bootstrap.Modal(document.getElementById('colorVariantModal')).show();
        }
        
        // Save color variant
        async function saveColorVariant() {
            const form = document.getElementById('colorVariantForm');
            const formData = new FormData(form);
            const variantId = formData.get('variantId');
            
            const variantData = {
                colorName: formData.get('colorName'),
                colorCode: formData.get('colorCode'),
                sku: formData.get('sku'),
                stock: parseInt(formData.get('stock')) || 0,
                priceModifier: parseFloat(formData.get('priceModifier')) || 0,
                sortOrder: parseInt(formData.get('sortOrder')) || 0,
                isActive: formData.get('isActive') === 'on'
            };
            
            showLoading(true);
            
            try {
                const url = variantId 
                    ? `${API_BASE_URL}/products/${productId}/color-variants/${variantId}`
                    : `${API_BASE_URL}/products/${productId}/color-variants`;
                
                const method = variantId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    },
                    body: JSON.stringify(variantData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast(data.message, 'success');
                    bootstrap.Modal.getInstance(document.getElementById('colorVariantModal')).hide();
                    loadColorVariants();
                } else {
                    throw new Error(data.message || 'Failed to save color variant');
                }
            } catch (error) {
                console.error('Error saving color variant:', error);
                showToast(error.message, 'error');
            } finally {
                showLoading(false);
            }
        }
        
        // Delete color variant
        async function deleteColorVariant(variantId) {
            if (!confirm('Are you sure you want to delete this color variant? This will also delete all associated images.')) {
                return;
            }
            
            showLoading(true);
            
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}/color-variants/${variantId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast(data.message, 'success');
                    loadColorVariants();
                } else {
                    throw new Error(data.message || 'Failed to delete color variant');
                }
            } catch (error) {
                console.error('Error deleting color variant:', error);
                showToast(error.message, 'error');
            } finally {
                showLoading(false);
            }
        }
        
        // Set default variant
        async function setDefaultVariant(variantId) {
            showLoading(true);
            
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}/color-variants/${variantId}/set-default`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast(data.message, 'success');
                    loadColorVariants();
                } else {
                    throw new Error(data.message || 'Failed to set default variant');
                }
            } catch (error) {
                console.error('Error setting default variant:', error);
                showToast(error.message, 'error');
            } finally {
                showLoading(false);
            }
        }
        
        // Image upload functions
        function triggerImageUpload(variantId) {
            document.getElementById(`imageUpload-${variantId}`).click();
        }
        
        function handleDragOver(event) {
            event.preventDefault();
            event.currentTarget.classList.add('dragover');
        }
        
        function handleDragLeave(event) {
            event.currentTarget.classList.remove('dragover');
        }
        
        function handleImageDrop(event, variantId) {
            event.preventDefault();
            event.currentTarget.classList.remove('dragover');
            
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                uploadImages(variantId, files);
            }
        }
        
        async function uploadImages(variantId, files) {
            if (files.length === 0) return;
            
            if (files.length > 5) {
                showToast('Maximum 5 images allowed per upload', 'error');
                return;
            }
            
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                if (files[i].size > 5 * 1024 * 1024) {
                    showToast(`File ${files[i].name} is too large. Maximum 5MB allowed.`, 'error');
                    return;
                }
                formData.append('images', files[i]);
            }
            
            showLoading(true);
            
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}/color-variants/${variantId}/images`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast(data.message, 'success');
                    loadColorVariants();
                } else {
                    throw new Error(data.message || 'Failed to upload images');
                }
            } catch (error) {
                console.error('Error uploading images:', error);
                showToast(error.message, 'error');
            } finally {
                showLoading(false);
            }
        }
        
        async function setPrimaryImage(variantId, imageIndex) {
            showLoading(true);
            
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}/color-variants/${variantId}/images/${imageIndex}/primary`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast(data.message, 'success');
                    loadColorVariants();
                } else {
                    throw new Error(data.message || 'Failed to set primary image');
                }
            } catch (error) {
                console.error('Error setting primary image:', error);
                showToast(error.message, 'error');
            } finally {
                showLoading(false);
            }
        }
        
        async function deleteImage(variantId, imageIndex) {
            if (!confirm('Are you sure you want to delete this image?')) {
                return;
            }
            
            showLoading(true);
            
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}/color-variants/${variantId}/images/${imageIndex}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast(data.message, 'success');
                    loadColorVariants();
                } else {
                    throw new Error(data.message || 'Failed to delete image');
                }
            } catch (error) {
                console.error('Error deleting image:', error);
                showToast(error.message, 'error');
            } finally {
                showLoading(false);
            }
        }
        
        // Utility functions
        function showLoading(show) {
            document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
        }
        
        function showToast(message, type = 'info') {
            const toastContainer = document.getElementById('toastContainer');
            const toastId = 'toast-' + Date.now();
            
            const bgClass = type === 'success' ? 'bg-success' : 
                           type === 'error' ? 'bg-danger' : 
                           type === 'warning' ? 'bg-warning' : 'bg-info';
            
            const toastHtml = `
                <div class="toast ${bgClass} text-white" id="${toastId}" role="alert">
                    <div class="toast-body">
                        ${message}
                        <button type="button" class="btn-close btn-close-white float-end" data-bs-dismiss="toast"></button>
                    </div>
                </div>
            `;
            
            toastContainer.insertAdjacentHTML('beforeend', toastHtml);
            
            const toastElement = document.getElementById(toastId);
            const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
            toast.show();
            
            toastElement.addEventListener('hidden.bs.toast', function() {
                toastElement.remove();
            });
        }
    </script>
</body>
</html>