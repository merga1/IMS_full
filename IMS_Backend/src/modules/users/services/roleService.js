// src/modules/users/services/roleService.js

import { AppError } from '../../../shared/utils/errors.js';
import permissionRepository from '../repositories/permissionRepository.js';
import roleRepository from '../repositories/roleRepository.js';
import userRepository from '../repositories/userRepository.js';

const {
  findByName,
  create,
  findById,
  findAll,
  update,
  remove,
  assignPermissions,
  removePermissions,
} = roleRepository;
const { findByIds } = permissionRepository;
const { countByRole } = userRepository;


class RoleService {
  async createRole(roleData) {
    // Check if role name already exists
    const existingRole = await findByName(roleData.name);
    if (existingRole) {
      throw new AppError('Role name already exists', 409);
    }

    // Verify all permissions exist
    if (roleData.permissionIds && roleData.permissionIds.length > 0) {
      const permissions = await findByIds(roleData.permissionIds);
      if (permissions.length !== roleData.permissionIds.length) {
        throw new AppError('One or more permissions not found', 404);
      }
    }

    return await create(roleData);
  }

  async getRoleById(id) {
    const role = await findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    return role;
  }

  async getAllRoles(filters) {
    return await findAll(filters);
  }

  async updateRole(id, roleData) {
    const role = await findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Prevent updating system roles
    if (role.isSystem) {
      throw new AppError('System roles cannot be modified', 403);
    }

    // If name is being updated, check if it's already in use
    if (roleData.name && roleData.name !== role.name) {
      const existingRole = await findByName(roleData.name);
      if (existingRole) {
        throw new AppError('Role name already exists', 409);
      }
    }

    return await update(id, roleData);
  }

  async deleteRole(id) {
    const role = await findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      throw new AppError('System roles cannot be deleted', 403);
    }

    // Check if role is assigned to any users
    const userCount = await countByRole(id);
    if (userCount > 0) {
      throw new AppError(`Cannot delete role assigned to ${userCount} user(s)`, 409);
    }

    await remove(id);
    return { message: 'Role deleted successfully' };
  }

  async assignPermissions(roleId, permissionIds) {
    const role = await findById(roleId);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Verify all permissions exist
    const permissions = await findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new AppError('One or more permissions not found', 404);
    }

    return await assignPermissions(roleId, permissionIds);
  }

  async removePermissions(roleId, permissionIds) {
    const role = await findById(roleId);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    return await removePermissions(roleId, permissionIds);
  }
}

export default new RoleService();
