// Cloudinary configuration for file uploads
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (file: File, folder: string = 'bursalimbah') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', folder);
  
  // Auto transformations
  formData.append('transformation', JSON.stringify({
    quality: 'auto',
    format: 'auto',
  }));

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      publicId: data.public_id,
      url: data.secure_url,
      thumbnailUrl: data.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill/'),
      format: data.format,
      size: data.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleToCloudinary = async (files: File[], folder: string = 'bursalimbah') => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
};

// Delete image from Cloudinary (requires backend API key)
export const deleteFromCloudinary = async (publicId: string) => {
  // This should be done via backend API for security
  // Frontend should call backend endpoint to delete
  console.warn('Delete should be done via backend API');
  return false;
};

// Get optimized image URL
export const getOptimizedUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: 'auto' | 'low' | 'medium' | 'high';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}) => {
  const transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  if (transformations.length === 0) return url;
  
  return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
};

export default cloudinaryConfig;
