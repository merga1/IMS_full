// src/modules/users/routes/index.js

import { Router } from 'express';
const router = Router();

// import Constants from '../../../shared/constants/permissions';
import authentication from '../../../shared/middleware/authentication.js';
import { requirePermission } from '../../../shared/middleware/authorization.js';
import { validate } from '../../../shared/middleware/validation.js';
import permissionController from '../controllers/permissionController.js';
import roleController from '../controllers/roleController.js';
import userController from '../controllers/userController.js';
import permissionValidators from '../validators/permissionValidators.js';
import roleValidators from '../validators/roleValidators.js';
import userValidators from '../validators/userValidators.js';

import authRoutes from './authRoutes.js';


const { authenticate } = authentication;
const {
  createUser,
  getAllUsers,
  getUserStats,
  getUserProfile,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getHierarchy,
  getSupervisor,
} = userController;
// const { PERMISSIONS } = Constants;
const { createPermissionSchema, permissionIdSchema, bulkCreatePermissionsSchema, moduleParamSchema, permissionListQuerySchema } = permissionValidators;
const { createRoleSchema, updateRoleSchema, assignPermissionsSchema, roleIdSchema } =
  roleValidators;
const { createUserSchema, updateUserSchema, changePasswordSchema, userIdSchema, userListQuerySchema } = userValidators;
const { roleListQuerySchema } = roleValidators;

const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignPermissions,
  removePermissions,
} = roleController;

const {
  createPermission,
  bulkCreatePermissions,
  getAllPermissions,
  getPermissionsByModule,
  getPermissionById,
  deletePermission,
} = permissionController;

// ============= USER ROUTES =============

// Public routes (none for users, would be in auth module)

// Protected routes
router.use('/auth', authRoutes);
router.use(authenticate); // All routes below require authentication
// User management routes
router.post('/users', requirePermission('USERS.CREATE'), validate(createUserSchema), createUser);

router.get('/users', requirePermission('USERS.READ'), validate(userListQuerySchema, 'query'), getAllUsers);

router.get('/users/stats', requirePermission('USERS.READ'), getUserStats);

router.get('/users/hierarchy', requirePermission('USERS.READ'), getHierarchy);

router.get('/users/supervisor', getSupervisor);

router.get('/users/profile', getUserProfile);

router.get(
  '/users/:id',
  requirePermission('USERS.READ'),
  validate(userIdSchema, 'params'),
  getUserById
);

router.patch(
  '/users/:id',
  requirePermission('USERS.UPDATE'),
  validate(userIdSchema, 'params'),
  validate(updateUserSchema),
  updateUser
);

router.delete(
  '/users/:id',
  requirePermission('USERS.DELETE'),
  validate(userIdSchema, 'params'),
  deleteUser
);

router.post('/users/change-password', validate(changePasswordSchema), changePassword);

// ============= ROLE ROUTES =============

router.post('/roles', requirePermission('USERS.CREATE'), validate(createRoleSchema), createRole);

router.get('/roles', requirePermission('USERS.READ'), validate(roleListQuerySchema, 'query'), getAllRoles);

router.get(
  '/roles/:id',
  requirePermission('USERS.READ'),
  validate(roleIdSchema, 'params'),
  getRoleById
);

router.patch(
  '/roles/:id',
  requirePermission('USERS.UPDATE'),
  validate(roleIdSchema, 'params'),
  validate(updateRoleSchema),
  updateRole
);

router.delete(
  '/roles/:id',
  requirePermission('USERS.DELETE'),
  validate(roleIdSchema, 'params'),
  deleteRole
);

router.post(
  '/roles/:id/permissions',
  requirePermission('USERS.UPDATE'),
  validate(roleIdSchema, 'params'),
  validate(assignPermissionsSchema),
  assignPermissions
);

router.delete(
  '/roles/:id/permissions',
  requirePermission('USERS.UPDATE'),
  validate(roleIdSchema, 'params'),
  validate(assignPermissionsSchema),
  removePermissions
);

// ============= PERMISSION ROUTES =============

router.post(
  '/permissions',
  requirePermission('USERS.CREATE'),
  validate(createPermissionSchema),
  createPermission
);

router.post('/permissions/bulk', requirePermission('USERS.CREATE'), validate(bulkCreatePermissionsSchema), bulkCreatePermissions);

router.get('/permissions', requirePermission('USERS.READ'), validate(permissionListQuerySchema, 'query'), getAllPermissions);

router.get('/permissions/module/:module', requirePermission('USERS.READ'), validate(moduleParamSchema, 'params'), getPermissionsByModule);

router.get(
  '/permissions/:id',
  requirePermission('USERS.READ'),
  validate(permissionIdSchema, 'params'),
  getPermissionById
);

router.delete(
  '/permissions/:id',
  requirePermission('USERS.DELETE'),
  validate(permissionIdSchema, 'params'),
  deletePermission
);

export default router;
