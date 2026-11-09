// src/modules/users/validators/userValidators.js

import Joi from 'joi'; 


const createUserSchema = Joi.object({
  fayda_id: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).max(72).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  full_name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 255 characters',
    'any.required': 'Name is required'
  }),
  roleId: Joi.number().integer().positive().required().messages({
    'number.base': 'Role ID must be a positive integer',
    'any.required': 'Role ID is required'
  }),
  branch_id: Joi.number().integer().positive().optional().allow(null),
  user_type: Joi.string().valid('EMPLOYEE', 'THIRD_PARTY').default('EMPLOYEE'),
  supervisor_id: Joi.string().uuid().optional().allow(null)
});

const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  full_name: Joi.string().min(2).max(255).optional(),
  roleId: Joi.number().integer().positive().optional(),
  branch_id: Joi.number().integer().positive().optional().allow(null),
  user_type: Joi.string().valid('EMPLOYEE', 'THIRD_PARTY').optional(),
  supervisor_id: Joi.string().uuid().optional().allow(null),
  is_suspended_from_clearance: Joi.boolean().optional()
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().max(72).required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(8).max(72).required().messages({
    'string.min': 'New password must be at least 8 characters long',
    'any.required': 'New password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required'
  })
});

const userIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid user ID format',
    'any.required': 'User ID is required'
  })
});

const loginSchema = Joi.object({
  fayda_id: Joi.string().trim().required(),
  password: Joi.string().max(72).required()
});

const userListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).optional(),
  roleId: Joi.number().integer().positive().optional(),
  branchId: Joi.number().integer().positive().optional(),
  userType: Joi.string().valid('EMPLOYEE', 'THIRD_PARTY').optional(),
  suspended: Joi.boolean().optional(),
});

export default {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  userIdSchema,
  loginSchema,
  userListQuerySchema
};
