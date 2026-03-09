import express from 'express';
import { body, param } from 'express-validator';

import { getEnrollments } from '../controllers/enrollmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validate.js';

import {
  adminListCourses,
  adminCreateCourse,
  adminUpdateCourse,
  adminDeleteCourse,
} from '../controllers/adminCourseController.js';

import {
  adminCreateModule,
  adminUpdateModule,
  adminDeleteModule,
  adminReorderModules,
} from '../controllers/adminModuleController.js';

import {
  adminCreateLesson,
  adminUpdateLesson,
  adminDeleteLesson,
  adminReorderLessons,
} from '../controllers/adminLessonController.js';

const router = express.Router();

// Apply auth + admin role to ALL routes in this file
router.use(protect, requireRole('Admin'));

// ─── Enrollments ─────────────────────────────────────────────────────────────
router.get('/enrollments', getEnrollments);

// ─── Courses ─────────────────────────────────────────────────────────────────
router.get('/courses', adminListCourses);

router.post(
  '/courses',
  [
    body('title').isString().trim().notEmpty().isLength({ max: 200 }),
    body('description').isString().trim().notEmpty().isLength({ max: 5000 }),
    body('category').isString().trim().notEmpty().isLength({ max: 120 }),
    body('instructor').isString().trim().notEmpty().isLength({ max: 200 }),
    body('image').optional().isURL(),
    body('difficulty').optional().isString().trim().isLength({ max: 40 }),
    body('duration').optional().isString().trim().isLength({ max: 40 }),
    validateRequest,
  ],
  adminCreateCourse
);

router.put(
  '/courses/:id',
  [
    param('id').isMongoId(),
    body('title').optional().isString().trim().isLength({ max: 200 }),
    body('description').optional().isString().trim().isLength({ max: 5000 }),
    body('category').optional().isString().trim().isLength({ max: 120 }),
    body('instructor').optional().isString().trim().isLength({ max: 200 }),
    body('image').optional().isURL(),
    body('difficulty').optional().isString().trim().isLength({ max: 40 }),
    body('duration').optional().isString().trim().isLength({ max: 40 }),
    validateRequest,
  ],
  adminUpdateCourse
);

router.delete(
  '/courses/:id',
  [param('id').isMongoId(), validateRequest],
  adminDeleteCourse
);

// ─── Modules ─────────────────────────────────────────────────────────────────
router.post(
  '/modules',
  [
    body('courseId').isMongoId(),
    body('title').isString().trim().notEmpty().isLength({ max: 200 }),
    validateRequest,
  ],
  adminCreateModule
);

// Must come before /:id so Express doesn't match "reorder" as an id
router.put(
  '/modules/reorder',
  [
    body('modules').isArray({ min: 1 }),
    body('modules.*.id').isMongoId(),
    body('modules.*.order').isInt({ min: 1 }),
    validateRequest,
  ],
  adminReorderModules
);

router.put(
  '/modules/:id',
  [
    param('id').isMongoId(),
    body('title').optional().isString().trim().isLength({ max: 200 }),
    body('order').optional().isInt({ min: 1 }),
    validateRequest,
  ],
  adminUpdateModule
);

router.delete(
  '/modules/:id',
  [param('id').isMongoId(), validateRequest],
  adminDeleteModule
);

// ─── Lessons ─────────────────────────────────────────────────────────────────
router.post(
  '/lessons',
  [
    body('moduleId').isMongoId(),
    body('title').isString().trim().notEmpty().isLength({ max: 200 }),
    body('videoUrl').isURL().withMessage('videoUrl must be a valid URL'),
    body('description').optional().isString().trim().isLength({ max: 5000 }),
    body('duration').isInt({ min: 1 }).toInt(),
    validateRequest,
  ],
  adminCreateLesson
);

router.put(
  '/lessons/reorder',
  [
    body('lessons').isArray({ min: 1 }),
    body('lessons.*.id').isMongoId(),
    body('lessons.*.order').isInt({ min: 1 }),
    validateRequest,
  ],
  adminReorderLessons
);

router.put(
  '/lessons/:id',
  [
    param('id').isMongoId(),
    body('title').optional().isString().trim().isLength({ max: 200 }),
    body('videoUrl').optional().isURL(),
    body('description').optional().isString().trim().isLength({ max: 5000 }),
    body('duration').optional().isInt({ min: 1 }).toInt(),
    body('order').optional().isInt({ min: 1 }),
    validateRequest,
  ],
  adminUpdateLesson
);

router.delete(
  '/lessons/:id',
  [param('id').isMongoId(), validateRequest],
  adminDeleteLesson
);

export default router;
