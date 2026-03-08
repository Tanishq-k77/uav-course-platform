import express from 'express';
import { body, param } from 'express-validator';

import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.get('/', listCourses);
router.get('/:id', getCourse);

router.post(
  '/',
  protect,
  requireRole('Admin'),
  [
    body('title').isString().trim().notEmpty().isLength({ max: 200 }),
    body('description').isString().trim().notEmpty().isLength({ max: 5000 }),
    body('category').isString().trim().notEmpty().isLength({ max: 120 }),
    body('instructor').isString().trim().notEmpty().isLength({ max: 200 }),
    validateRequest,
  ],
  createCourse
);

router.put(
  '/:id',
  protect,
  requireRole('Admin'),
  [
    param('id').isMongoId(),
    body('title').optional().isString().trim().isLength({ max: 200 }),
    body('description').optional().isString().trim().isLength({ max: 5000 }),
    body('category').optional().isString().trim().isLength({ max: 120 }),
    body('instructor').optional().isString().trim().isLength({ max: 200 }),
    validateRequest,
  ],
  updateCourse
);

router.delete(
  '/:id',
  protect,
  requireRole('Admin'),
  [param('id').isMongoId(), validateRequest],
  deleteCourse
);

export default router;

