import express from 'express';

import { overview } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/overview', protect, requireRole('Admin'), overview);

export default router;

