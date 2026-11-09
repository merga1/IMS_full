import { ValidationError } from '../utils/errors.js';

/**
 * Validate request using Joi schema
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(new ValidationError('Validation failed', errors));
    }

    // Replace request with validated values
    if (source === 'body' || source === 'params') {
      req[source] = value;
      req.validated = { ...req.validated, [source]: value };
    } else {
      req.validated = { ...req.validated, [source]: value };
    }

    next();
  };
};

/**
 * Sanitize request body
 */
const sanitize = (fields = []) => {
  return (req, res, next) => {
    if (req.body) {
      for (const field of fields) {
        if (req.body[field]) {
          req.body[field] = String(req.body[field])
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
      }
    }
    next();
  };
};

export { validate, sanitize };
