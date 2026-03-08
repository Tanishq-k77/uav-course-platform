import express from 'express';
import { body } from 'express-validator';

import { createModule, getModulesByCourse } from '../controllers/moduleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/',
  protect,
  requireRole('Admin'),
  [
    body('courseId').isMongoId(),
    body('title').isString().trim().notEmpty().isLength({ max: 200 }),
    body('order').isInt({ min: 1 }).toInt(),
    validateRequest,
  ],
  createModule
);

// Public: list modules for a course
router.get('/:courseId', getModulesByCourse);

export default router;

