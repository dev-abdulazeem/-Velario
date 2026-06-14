import cloudinary from '../config/cloudinary.js';

/**
 * Upload a buffer to Cloudinary using base64 data URI
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder
 * @param {string} mimetype - File mimetype
 */
export const uploadToCloudinary = async (buffer, folder = 'velario/products', mimetype) => {
  try {
    const format = mimetype?.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    
    // Convert buffer to base64 data URI
    const base64String = buffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      format,
      unique_filename: true,
      overwrite: false,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      resource_type: 'auto',
    });

    console.log('Cloudinary upload success:', result.secure_url);
    
    return {
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete success:', publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};