import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';

import { register, login } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').isString().trim().notEmpty().isLength({ max: 120 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 8, max: 200 }),
    body('role')
      .optional()
      .isIn(['Student', 'Admin'])
      .withMessage('role must be Student or Admin'),
    validateRequest,
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().notEmpty(),
    validateRequest,
  ],
  login
);

export default router;

