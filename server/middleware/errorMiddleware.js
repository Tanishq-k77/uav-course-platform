import { ApiError } from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Normalize common Mongoose errors into user-friendly API errors.
  if (err?.name === 'CastError') {
    statusCode = 400;
    err.message = 'Invalid resource id';
  }

  if (err?.name === 'ValidationError') {
    statusCode = 400;
  }

  if (err?.code === 11000) {
    statusCode = 409;
    err.message = 'Duplicate key error';
  }

  const payload = {
    message: err.message || 'Server error',
  };

  if (err instanceof ApiError && err.details) {
    payload.details = err.details;
  }

  if (!isProd) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

