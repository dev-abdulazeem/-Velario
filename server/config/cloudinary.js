import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file (relative or absolute)
 * @param {string} folder - Cloudinary folder
 */
export const uploadToCloudinary = async (filePath, folder = 'velario/products') => {
  try {
    // Resolve to absolute path if relative
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);

    console.log('Uploading to Cloudinary:', absolutePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const result = await cloudinary.uploader.upload(absolutePath, {
      folder,
      use_filename: false,
      unique_filename: true,
      overwrite: true,
    });

    // Clean up local file
    fs.unlinkSync(absolutePath);
    console.log('Cloudinary upload success:', result.secure_url);

    return {
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    // Cleanup on error
    try {
      const absolutePath = path.isAbsolute(filePath) 
        ? filePath 
        : path.resolve(process.cwd(), filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (e) { /* ignore cleanup errors */ }
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;