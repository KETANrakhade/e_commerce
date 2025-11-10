# Cloudinary Setup Guide for PYRAMID E-Commerce

## Current Status: ⚠️ **Cloudinary Configured but Credentials Missing**

Your application has **complete Cloudinary integration** but needs real credentials to work.

## ✅ What's Already Implemented:

### 1. **Complete Upload System**
- Single image upload: `POST /api/upload/single`
- Multiple images upload: `POST /api/upload/multiple`
- Product images upload: `POST /api/upload/product` (Admin only)
- Image deletion: `DELETE /api/upload/:publicId`

### 2. **Advanced Features**
- **Automatic WebP conversion** for better performance
- **Image optimization** (auto quality, 800x800 max size)
- **File validation** (JPEG, JPG, PNG, GIF, WebP only)
- **Size limits** (5MB per file, max 10 files)
- **Organized storage** (images stored in `pyramid-ecommerce/products/` folder)
- **Error handling** for all upload scenarios

### 3. **Security Features**
- Authentication required for uploads
- Admin-only product image uploads
- File type validation
- Size restrictions

## 🔧 **Setup Instructions:**

### Step 1: Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to your Dashboard

### Step 2: Get Your Credentials
From your Cloudinary Dashboard, copy:
- **Cloud Name**
- **API Key** 
- **API Secret**

### Step 3: Update Environment Variables
Replace these values in `backend/.env`:

```env
# Replace with your actual Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### Step 4: Test the Setup
After updating credentials, restart your server and test:

```bash
cd backend
npm start
```

## 📋 **API Endpoints Ready to Use:**

### For Regular Users:
```javascript
// Upload single image
POST /api/upload/single
Headers: { Authorization: "Bearer <token>" }
Body: FormData with 'image' field

// Upload multiple images  
POST /api/upload/multiple
Headers: { Authorization: "Bearer <token>" }
Body: FormData with 'images' field (max 10)
```

### For Admins:
```javascript
// Upload product images
POST /api/upload/product
Headers: { Authorization: "Bearer <admin_token>" }
Body: FormData with 'productImages' field + 'productName'

// Delete image
DELETE /api/upload/:publicId
Headers: { Authorization: "Bearer <token>" }
```

## 🎯 **Example Usage:**

### Frontend JavaScript Example:
```javascript
// Upload product image
const uploadProductImage = async (imageFile, productName) => {
  const formData = new FormData();
  formData.append('productImages', imageFile);
  formData.append('productName', productName);
  
  const response = await fetch('/api/upload/product', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });
  
  const result = await response.json();
  return result.data.images; // Array of uploaded image URLs
};
```

## 🔄 **Image Processing Features:**

Your setup automatically:
- ✅ Converts images to WebP format
- ✅ Optimizes quality for web
- ✅ Limits size to 800x800 pixels
- ✅ Organizes in folders by type
- ✅ Generates unique filenames
- ✅ Provides multiple image formats

## 💡 **Free Tier Limits:**
- **Storage**: 25GB
- **Bandwidth**: 25GB/month  
- **Transformations**: 25,000/month
- **API calls**: 1,000,000/month

This is more than enough for most e-commerce sites!

## ✅ **Next Steps:**
1. Get Cloudinary credentials
2. Update `.env` file
3. Restart server
4. Test image uploads
5. Your images will be stored in Cloudinary cloud storage!

## 🎉 **Benefits:**
- **Fast CDN delivery** worldwide
- **Automatic optimization** 
- **Scalable storage**
- **Image transformations**
- **No server storage needed**