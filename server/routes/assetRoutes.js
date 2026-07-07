import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAssets } from '../controllers/assetController.js';

const router = express.Router();
router.get('/', protect, getAssets);

export default router;
