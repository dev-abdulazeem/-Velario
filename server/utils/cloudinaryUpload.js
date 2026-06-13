import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

export const uploadToCloudinary = async (filePath, folder = 'velario/products') => {
  try {
    // Resolve to absolute path if relative
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath);

    console.log('Uploading file from:', absolutePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const result = await cloudinary.uploader.upload(absolutePath, {
      folder,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      resource_type: 'auto',
    });

    // Delete local temp file after upload
    fs.unlinkSync(absolutePath);
    console.log('Uploaded to Cloudinary:', result.secure_url);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // Clean up local file on error if it exists
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath);
      
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
    
    console.error('Cloudinary upload error:', error.message);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};