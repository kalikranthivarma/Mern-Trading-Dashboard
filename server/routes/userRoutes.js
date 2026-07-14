import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { getUsers, getProfile, uploadKyc } from '../controllers/userController.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('Super Admin', 'Admin'), getUsers);
router.get('/me', protect, getProfile);
router.post('/kyc', protect, uploadKyc);

export default router;
