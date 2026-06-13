import pool from '../config/database.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { notifySubscribersNewProduct } from './emailController.js';

// ═══════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, sort, featured } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (featured === 'true') {
      query += ` AND is_featured = true`;
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'newest') {
      query += ' ORDER BY created_at DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE is_featured = true ORDER BY created_at DESC LIMIT 6'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error fetching featured products' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != \'\' ORDER BY category'
    );
    res.json(result.rows.map(row => row.category).filter(Boolean));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// ═══════════════════════════════════════════════════════════════
//  HELPER: Safely stringify for PostgreSQL JSON/JSONB columns
// ═══════════════════════════════════════════════════════════════

const toJsonParam = (value) => {
  if (value === null || value === undefined) return '[]';
  if (typeof value === 'string') {
    try { 
      JSON.parse(value); 
      return value; 
    } catch { 
      return JSON.stringify([value]); 
    }
  }
  if (Array.isArray(value)) return JSON.stringify(value);
  return JSON.stringify([value]);
};

// ═══════════════════════════════════════════════════════════════
//  HELPER: Parse sizes from various input formats
// ═══════════════════════════════════════════════════════════════

const parseSizes = (sizes) => {
  if (!sizes) return [];
  if (Array.isArray(sizes)) return sizes;
  if (typeof sizes === 'string') {
    try {
      const parsed = JSON.parse(sizes);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

// ═══════════════════════════════════════════════════════════════
//  HELPER: Parse images from various input formats
// ═══════════════════════════════════════════════════════════════

const parseImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [images];
    }
  }
  return [];
};

// ═══════════════════════════════════════════════════════════════
//  ADMIN: CREATE PRODUCT
// ═══════════════════════════════════════════════════════════════

export const createProduct = async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file =>
        uploadToCloudinary(file.path, 'velario/products')
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map(r => r.secure_url || r.url);
    }

    const {
      name,
      description,
      price,
      category,
      sizes,
      stockQuantity,
      isFeatured,
      images: existingImages
    } = req.body;

    const allImages = [...imageUrls, ...parseImages(existingImages)];
    const parsedSizes = parseSizes(sizes);
    const imagesJson = toJsonParam(allImages);
    const sizesJson = toJsonParam(parsedSizes);

    const product = await pool.query(
      `INSERT INTO products (
        name, 
        description, 
        price, 
        category, 
        images, 
        sizes, 
        stock_quantity,
        is_featured,
        created_at
      ) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, NOW()) 
      RETURNING *`,
      [
        name,
        description || '',
        parseFloat(price) || 0,
        category,
        imagesJson,
        sizesJson,
        parseInt(stockQuantity) || 0,
        isFeatured === 'true' || isFeatured === true || isFeatured === 'on'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product.rows[0]
    });

    notifySubscribersNewProduct(product.rows[0]).catch(err => {
      console.error('Background email notification error:', err);
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════
//  ADMIN: UPDATE PRODUCT — FIXED: removed updated_at
// ═══════════════════════════════════════════════════════════════

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    const existingProduct = existingResult.rows[0];
    let imageUrls = parseImages(existingProduct.images);

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file =>
        uploadToCloudinary(file.path, 'velario/products')
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.secure_url || r.url);

      const replaceImages = req.body.replace_images === 'true' || req.body.replace_images === true;
      imageUrls = replaceImages ? newUrls : [...imageUrls, ...newUrls];
    }

    const bodyImages = parseImages(req.body.images);
    if (bodyImages.length > 0 && (!req.files || req.files.length === 0)) {
      imageUrls = bodyImages;
    }

    const {
      name,
      description,
      price,
      category,
      sizes,
      stockQuantity,
      isFeatured
    } = req.body;

    const parsedSizes = parseSizes(sizes);
    const imagesJson = toJsonParam(imageUrls);
    const sizesJson = toJsonParam(parsedSizes);

    // ─── FIXED: removed updated_at = NOW() ─────────────────────
    const product = await pool.query(
      `UPDATE products
       SET 
         name = COALESCE($1, name), 
         description = COALESCE($2, description), 
         price = COALESCE($3, price), 
         category = COALESCE($4, category),
         images = $5::jsonb, 
         sizes = $6::jsonb, 
         stock_quantity = COALESCE($7, stock_quantity),
         is_featured = COALESCE($8, is_featured)
       WHERE id = $9 
       RETURNING *`,
      [
        name || null,
        description !== undefined ? description : null,
        price !== undefined ? parseFloat(price) : null,
        category || null,
        imagesJson,
        sizesJson,
        stockQuantity !== undefined ? parseInt(stockQuantity) : null,
        isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true || isFeatured === 'on') : null,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: product.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════
//  ADMIN: DELETE PRODUCT
// ═══════════════════════════════════════════════════════════════

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting product',
      error: error.message 
    });
  }
};