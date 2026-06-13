import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/database.js';
import {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
//  MULTER CONFIG
// ═══════════════════════════════════════════════════════════════

const uploadDir = path.join(process.cwd(), 'uploads', 'temp');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ═══════════════════════════════════════════════════════════════
//  ROUTES — STATIC BEFORE DYNAMIC
// ═══════════════════════════════════════════════════════════════

router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);

// SEARCH — before /:id
router.get('/search', async (req, res) => {
  const { q } = req.query;
  
  console.log('🔍 Search hit! Query:', q);
  
  if (!q || q.trim() === '') {
    return res.json([]);
  }

  try {
    const searchTerm = `%${q.trim()}%`;
    
    const result = await pool.query(`
      SELECT * FROM products 
      WHERE name ILIKE $1 
         OR description ILIKE $1 
         OR category ILIKE $1
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 20
    `, [searchTerm]);
    
    console.log('✅ Search results:', result.rows.length, 'products found');
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DYNAMIC — must be last
router.get('/:id', getProductById);

router.post('/', upload.array('images', 5), createProduct);
router.put('/:id', upload.array('images', 5), updateProduct);
router.delete('/:id', deleteProduct);

export default router;