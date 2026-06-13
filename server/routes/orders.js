import express from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);

export default router;