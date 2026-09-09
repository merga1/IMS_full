import { ValidationError } from '../utils/errors.js';

/**
 * Validate request using Joi schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const toValidate = {
      ...(schema.body && { body: req.body }),
      ...(schema.query && { query: req.query }),
      ...(schema.params && { params: req.params }),
      ...(schema.headers && { headers: req.headers }),
    };

    const { error, value } = schema.validate(toValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(new ValidationError('Validation failed', errors));
    }

    // Replace request with validated values
    if (schema.body) req.body = value.body;
    if (schema.query) req.query = value.query;
    if (schema.params) req.params = value.params;

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
