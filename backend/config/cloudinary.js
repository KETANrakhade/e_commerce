const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dqqkfjufa',
  api_key: '511252852812318',
  api_secret: '2lzJWZRWtNH8OaUOSqulYzSHPQg',
});

// Test connection function
const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Upload image with options
const uploadImage = async (fileBuffer, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'pyramid-ecommerce/products',
      resource_type: 'image',
      format: 'webp', // Convert to WebP for better compression
      quality: 'auto:good',
      fetch_format: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Limit max size
        { quality: 'auto:good' }
      ]
    };

    const uploadOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Upload function error:', error);
    throw error;
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Upload multiple images
const uploadMultipleImages = async (fileBuffers, options = {}) => {
  try {
    const uploadPromises = fileBuffers.map((buffer, index) => {
      const imageOptions = {
        ...options,
        public_id: options.public_id ? `${options.public_id}_${index + 1}` : undefined
      };
      return uploadImage(buffer, imageOptions);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  testConnection,
  uploadImage,
  deleteImage,
  uploadMultipleImages
};