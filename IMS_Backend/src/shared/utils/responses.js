// src/shared/utils/responses.js

export const successResponse = (
  res,
  data = null,
  message = 'Success',
  statusCode = 200,
  context = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

export const errorResponse = (res, error, context = {}) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong';

  const payload = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...context,
  };

  // Don't leak stack traces in production
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    payload.stack = error.stack;
  }

  if (error.errors && (Array.isArray(error.errors) || Object.keys(error.errors).length > 0)) {
    payload.errors = error.errors;
  }

  return res.status(statusCode).json(payload);
};

export const paginatedResponse = (res, data, pagination, message = 'Success', context = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
    ...context,
  });
};
