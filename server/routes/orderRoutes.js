import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getOrders, getOrderById } from '../controllers/orderController.js';

const router = express.Router();
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

export default router;
