import express from 'express';
import { body } from 'express-validator';

import {
  createEnrollment,
  getEnrollments,
  getUserEnrollments,
} from '../controllers/enrollmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/',
  protect,
  requireRole('Student'),
  [
    body('courseId').isMongoId(),
    validateRequest,
  ],
  createEnrollment
);

// Admin-only endpoint to view all enrollments
router.get('/', protect, requireRole('Admin'), getEnrollments);

// Logged-in student: view own enrollments
router.get('/user', protect, requireRole('Student'), getUserEnrollments);

export default router;

