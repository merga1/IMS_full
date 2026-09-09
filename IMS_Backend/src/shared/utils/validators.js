import Joi from 'joi';
/**
 * Common validation schemas
 */
const commonSchemas = {
  email: Joi.string().email().lowercase().trim(),
  password: Joi.string().min(8).max(128),
  phone: Joi.string().pattern(/^\+?[\d\s-()]+$/),
  date: Joi.date().iso(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  },
};

/**
 * Validate UUID
 */
const isValidUUID = (value) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Sanitize string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  // Will add a library like validator.escape() or DOMPurify for proper sanitization
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate file upload
 */
const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return true;
};

/**
 * Pagination helper
 */
const getPaginationParams = (query) => {
  if (!query || typeof query !== 'object') {
    return { page: 1, limit: 10, skip: 0 };
  }
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Sorting helper
 */
const getSortingParams = (query, defaultSort = { createdAt: 'desc' }) => {
  const sortBy = query.sortBy || Object.keys(defaultSort)[0];
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { [sortBy]: sortOrder };
};

export {
  commonSchemas,
  isValidUUID,
  sanitizeString,
  validateFile,
  getPaginationParams,
  getSortingParams,
};
