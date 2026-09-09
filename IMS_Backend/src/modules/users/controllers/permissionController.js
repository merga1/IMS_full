// src/modules/users/controllers/permissionController.js

import {successResponse} from '../../../shared/utils/responses.js';
import permissionService from '../services/permissionService.js';

const {
  createPermission,
  getPermissionById,
  getAllPermissions,
  getPermissionsByModule,
  deletePermission,
  bulkCreatePermissions,
} = permissionService;

// const { successResponse } = responses;

class PermissionController {
  async createPermission(req, res, next) {
    try {
      const permission = await createPermission(req.body);

      return successResponse(res, permission, 'Permission created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getPermissionById(req, res, next) {
    try {
      const { id } = req.params;
      const permission = await getPermissionById(id);

      return successResponse(res, permission, 'Permission retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllPermissions(req, res, next) {
    try {
      const filters = {
        module: req.query.module,
        search: req.query.search,
      };

      const permissions = await getAllPermissions(filters);

      return successResponse(res, permissions, 'Permissions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPermissionsByModule(req, res, next) {
    try {
      const { module } = req.params;
      const permissions = await getPermissionsByModule(module);

      return successResponse(res, permissions, 'Permissions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async deletePermission(req, res, next) {
    try {
      const { id } = req.params;
      const result = await deletePermission(id);

      return successResponse(res, result, 'Permission deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async bulkCreatePermissions(req, res, next) {
    try {
      const { permissions } = req.body;
      const result = await bulkCreatePermissions(permissions);

      // If there are partial failures, use 207 Multi-Status
      const statusCode = result.errors.length > 0 ? 207 : 201;
      const message =
        result.errors.length > 0
          ? `Bulk permissions processed with ${result.errors.length} errors`
          : 'Bulk permissions created successfully';

      return successResponse(res, result, message, statusCode);
    } catch (error) {
      next(error);
    }
  }
}

export default new PermissionController();
