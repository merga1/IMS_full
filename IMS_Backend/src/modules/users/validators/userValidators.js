// src/modules/users/validators/userValidators.js

import Joi from 'joi'; 


const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),
  department: Joi.string().max(100).optional().allow(null),
  clearanceLevel: Joi.number().integer().min(1).max(5).default(1),
  roleId: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid role ID format',
    'any.required': 'Role ID is required'
  }),
  active: Joi.boolean().default(true)
});

const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().min(2).max(100).optional(),
  department: Joi.string().max(100).optional().allow(null),
  clearanceLevel: Joi.number().integer().min(1).max(5).optional(),
  roleId: Joi.string().uuid().optional(),
  active: Joi.boolean().optional()
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(8).required().messages({
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

export default {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  userIdSchema
};