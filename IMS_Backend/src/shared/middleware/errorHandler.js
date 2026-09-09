import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  DatabaseError,
} from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/responses.js';

const errorHandler = (err, req, res, next) => {
  // 1. Prevent "Headers already sent" errors
  if (res.headersSent) {
    return next(err);
  }

  let error = err;
  // JS Error properties (message, stack) are not enumerable, so we must copy them manually
  error.message = err.message;
  error.stack = err.stack;
  error.statusCode = err.statusCode || 500;
  error.timestamp = new Date().toISOString();

  // Log error with audit trail
  if (error.statusCode >= 500) {
    logger.error('Server Error:', {
      error: err,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: { ...req.body, password: '[REDACTED]' }, // sanitize sensitive fields
      user: req.user?.id,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: error.timestamp,
    });
  } else {
    logger.warn('Client Error:', {
      message: err.message,
      statusCode: error.statusCode,
      url: req.originalUrl,
      user: req.user?.id,
      ip: req.ip,
      timestamp: error.timestamp,
    });
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    error = new ConflictError('Resource already exists', { cause: err });
  } else if (err.code === 'P2025') {
    error = new NotFoundError('Resource not found', { cause: err });
  } else if (err.code && err.code.startsWith('P20')) {
    error = new DatabaseError('Database operation failed', { cause: err });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Invalid token', { cause: err });
  } else if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token expired', { cause: err });
  }

  // Validation Errors (express-validator / Joi)
  if (err.name === 'ValidationError' && err.errors) {
    // Handle different validation library error structures
    const formattedErrors = Array.isArray(err.errors)
      ? err.errors.map((e) => ({
          field: e.param || e.path || e.field,
          message: e.msg || e.message,
        }))
      : Object.keys(err.errors).map((key) => ({
          field: key,
          message: err.errors[key].message,
        }));

    error = new ValidationError('Validation failed', formattedErrors);
  }

  // Handle multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT') {
    error = new ValidationError(err.message);
  }

  // Send error response
  errorResponse(res, error);
};

export default errorHandler;
