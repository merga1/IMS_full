// src/modules/users/validators/roleValidators.js

import Joi from 'joi';



const createRoleSchema = Joi.object({
  role_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Role name must be at least 2 characters long',
    'string.max': 'Role name cannot exceed 50 characters',
    'any.required': 'Role name is required'
  }),
  role_rank: Joi.number().integer().min(0).required(),
  permissionIds: Joi.array().items(Joi.number().integer().positive()).default([])
});

const updateRoleSchema = Joi.object({
  role_name: Joi.string().min(2).max(50).optional(),
  role_rank: Joi.number().integer().min(0).optional()
}).min(1);

const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.min': 'At least one permission ID is required',
    'any.required': 'Permission IDs are required'
  })
});

const roleIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Invalid role ID format',
    'any.required': 'Role ID is required'
  })
});

const roleListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).optional(),
});

export default {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema,
  roleIdSchema,
  roleListQuerySchema
};
