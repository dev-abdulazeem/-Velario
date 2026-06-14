import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder
 * @param {string} mimetype - File mimetype
 */
export const uploadToCloudinary = async (buffer, folder = 'velario/products', mimetype) => {
  try {
    const format = mimetype?.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          format,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve({
              url: result.secure_url,
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      );

      // Convert buffer to stream and pipe to uploadStream
      const readableStream = Readable.from(buffer);
      readableStream.pipe(uploadStream);
    });
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
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;