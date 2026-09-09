// src/modules/users/validators/roleValidators.js

import Joi from 'joi';



const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Role name must be at least 2 characters long',
    'string.max': 'Role name cannot exceed 50 characters',
    'any.required': 'Role name is required'
  }),
  description: Joi.string().max(255).optional().allow(null),
  isSystem: Joi.boolean().default(false),
  permissionIds: Joi.array().items(Joi.string().uuid()).default([])
});

const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(255).optional().allow(null)
}).min(1);

const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    'array.min': 'At least one permission ID is required',
    'any.required': 'Permission IDs are required'
  })
});

const roleIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid role ID format',
    'any.required': 'Role ID is required'
  })
});

export default {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema,
  roleIdSchema
};