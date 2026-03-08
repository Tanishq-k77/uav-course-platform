import express from 'express';
import { body } from 'express-validator';

import { createLesson, getLessonsByModule } from '../controllers/lessonController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/',
  protect,
  requireRole('Admin'),
  [
    body('moduleId').isMongoId(),
    body('title').isString().trim().notEmpty().isLength({ max: 200 }),
    body('videoUrl').isURL().withMessage('videoUrl must be a valid URL'),
    body('description').optional().isString().trim().isLength({ max: 5000 }),
    body('duration').isInt({ min: 1 }).toInt(),
    body('order').optional().isInt({ min: 1 }).toInt(),
    validateRequest,
  ],
  createLesson
);

// Public: list lessons for a module
router.get('/:moduleId', getLessonsByModule);

export default router;

