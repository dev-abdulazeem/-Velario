import express from 'express';
import multer from 'multer';
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
//  MULTER CONFIG — MEMORY STORAGE (no disk files, no ENOENT errors)
// ═══════════════════════════════════════════════════════════════

const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DYNAMIC — must be last
router.get('/:id', getProductById);

// ADMIN ROUTES
router.post('/', upload.array('images', 5), createProduct);
router.put('/:id', upload.array('images', 5), updateProduct);
router.delete('/:id', deleteProduct);

export default router;