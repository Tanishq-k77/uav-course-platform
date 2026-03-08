import express from 'express';
import { body } from 'express-validator';

import {
  markLessonComplete,
  getCourseProgress,
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

// POST /api/progress/complete - mark a lesson completed for current student
router.post(
  '/complete',
  protect,
  requireRole('Student'),
  [body('lessonId').isMongoId(), validateRequest],
  markLessonComplete
);

// GET /api/progress/:courseId/:userId - course progress for a given user
router.get('/:courseId/:userId', protect, getCourseProgress);

export default router;

