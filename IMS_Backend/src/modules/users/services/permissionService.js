// src/modules/users/services/permissionService.js

import { AppError } from '../../../shared/utils/errors.js';
import permissionRepository from '../repositories/permissionRepository.js';

const { remove, findByCode, create, findById, findAll, findByModule } = permissionRepository;

class PermissionService {
  async createPermission(permissionData) {
    // Check if permission code already exists
    const existingPermission = await findByCode(permissionData.code);
    if (existingPermission) {
      throw new AppError('Permission code already exists', 409);
    }

    return await create(permissionData);
  }

  async getPermissionById(id) {
    const permission = await findById(id);
    if (!permission) {
      throw new AppError('Permission not found', 404);
    }
    return permission;
  }

  async getAllPermissions(filters) {
    return await findAll(filters);
  }

  async getPermissionsByModule(module) {
    return await findByModule(module);
  }

  async deletePermission(id) {
    const permission = await findById(id);
    if (!permission) {
      throw new AppError('Permission not found', 404);
    }

    await remove(id);
    return { message: 'Permission deleted successfully' };
  }

  async bulkCreatePermissions(permissions) {
    const results = [];
    const errors = [];

    for (const permData of permissions) {
      try {
        const permission = await this.createPermission(permData);
        results.push(permission);
      } catch (error) {
        errors.push({
          permission: permData,
          error: error.message,
        });
      }
    }

    return { created: results, errors };
  }
}

export default new PermissionService();
