# Product Image Upload Changes

## What Changed
The admin panel's "Add Product" form has been updated to use file uploads instead of image URLs.

## Key Changes Made

### 1. Form Input Changes
- **Before**: Text input for image URLs (`<input type="url">`)
- **After**: File input for image uploads (`<input type="file" accept="image/*">`)

### 2. Form Processing
- Added `enctype="multipart/form-data"` to the form
- Added PHP file upload handling with validation
- Support for multiple image formats: JPG, PNG, WebP, GIF
- Maximum file size: 5MB per image
- Automatic file naming and storage in `uploads/products/` directory

### 3. JavaScript Updates
- Updated `previewImageFile()` function to handle file previews using FileReader API
- Updated `removeImageField()` and `addImageField()` functions for file inputs
- Maintained backward compatibility with existing URL-based images

### 4. File Storage
- Created `pyramid-admin/uploads/products/` directory for storing uploaded images
- Added `.gitignore` to ignore uploaded files but keep directory structure
- Files are stored with unique names: `product_timestamp_index.extension`

### 5. Security Features
- File type validation (only image types allowed)
- File size validation (5MB maximum)
- Secure file naming to prevent conflicts
- Proper directory permissions (755)

## Usage
1. Navigate to Admin Panel → Products → Add Product
2. In the "Product Images" section, click "Choose File" instead of entering URLs
3. Select image files from your computer
4. Preview will show automatically
5. Add multiple images using the "Add Image" button
6. First image becomes the primary product image

## File Structure
```
pyramid-admin/
├── uploads/
│   ├── products/          # Uploaded product images
│   │   ├── .gitkeep      # Keeps directory in git
│   │   └── product_*.jpg  # Uploaded files
│   └── .gitignore        # Ignores uploaded files
└── pages/
    └── products.php      # Updated with file upload handling
```

## Backward Compatibility
The system still supports existing URL-based images for products that were created before this update. The form can handle both file uploads and existing image URLs during editing.