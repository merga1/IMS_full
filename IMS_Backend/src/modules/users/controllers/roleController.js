// src/modules/users/controllers/roleController.js

import { successResponse } from '../../../shared/utils/responses.js';
import assignPermissionDto from '../dto/assignPermission.dto.js';
import CreateRoleDto from '../dto/createRole.dto.js';
import roleService from '../services/roleService.js';

const {
  createRole,
  getRoleById,
  getAllRoles,
  updateRole,
  deleteRole,
  assignPermissions,
  removePermissions,
} = roleService;

class RoleController {
  async createRole(req, res, next) {
    try {
      const roleData = CreateRoleDto.from(req.body);
      const role = await createRole(roleData);

      return successResponse(res, role, 'Role created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req, res, next) {
    try {
      const { id } = req.params;
      const role = await getRoleById(id);

      return successResponse(res, role, 'Role retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllRoles(req, res, next) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        isSystem: req.query.isSystem,
      };

      const result = await getAllRoles(filters);

      return successResponse(res, result, 'Roles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const role = await updateRole(id, req.body);

      return successResponse(res, role, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    try {
      const { id } = req.params;
      const result = await deleteRole(id);

      return successResponse(res, result, 'Role deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignPermissions(req, res, next) {
    try {
      const { id } = req.params;
      const { permissionIds } = assignPermissionDto.from(req.body);
      const role = await assignPermissions(id, permissionIds);

      return successResponse(res, role, 'Permissions assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async removePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const { permissionIds } = assignPermissionDto.from(req.body);
      const role = await removePermissions(id, permissionIds);

      return successResponse(res, role, 'Permissions removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new RoleController();
