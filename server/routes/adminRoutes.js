import express from 'express';

import { getEnrollments } from '../controllers/enrollmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/admin/enrollments - list all enrollments (Admin only)
router.get('/enrollments', protect, requireRole('Admin'), getEnrollments);

export default router;

