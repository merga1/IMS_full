// src/modules/users/services/roleService.js

import { AppError } from '../../../shared/utils/errors.js';
import permissionRepository from '../repositories/permissionRepository.js';
import roleRepository from '../repositories/roleRepository.js';
import sessionRepository from '../repositories/sessionRepository.js';
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
const PROTECTED_ROLE_NAMES = new Set([
  'SYSTEM_ADMIN', 'System Administrator', 'GD', 'General Director',
  'DGD', 'Deputy General Director', 'DIRECTOR', 'Director',
  'TEAM_LEADER', 'Team Leader', 'STOREKEEPER', 'Storekeeper',
  'MAINTENANCE', 'Maintenance Team', 'EMPLOYEE', 'Employee',
  'THIRD_PARTY', 'Third-Party',
]);


class RoleService {
  async invalidateRoleSessions(roleId) {
    const userIds = await userRepository.findUserIdsByRole(roleId);
    await Promise.all(userIds.map((userId) => sessionRepository.deleteUserSessions(userId)));
  }

  async createRole(roleData) {
    // Check if role name already exists
    const existingRole = await findByName(roleData.role_name);
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

    if (PROTECTED_ROLE_NAMES.has(role.role_name)) {
      throw new AppError('System roles cannot be modified', 403);
    }

    // If name is being updated, check if it's already in use
    if (roleData.role_name && roleData.role_name !== role.role_name) {
      const existingRole = await findByName(roleData.role_name);
      if (existingRole) {
        throw new AppError('Role name already exists', 409);
      }
    }

    const updatedRole = await update(id, roleData);
    await this.invalidateRoleSessions(id);
    return updatedRole;
  }

  async deleteRole(id) {
    const role = await findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (PROTECTED_ROLE_NAMES.has(role.role_name)) {
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

    if (PROTECTED_ROLE_NAMES.has(role.role_name)) {
      throw new AppError('System role permissions are managed by the seeder', 403);
    }

    // Verify all permissions exist
    const permissions = await findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new AppError('One or more permissions not found', 404);
    }

    const updatedRole = await assignPermissions(roleId, permissionIds);
    await this.invalidateRoleSessions(roleId);
    return updatedRole;
  }

  async removePermissions(roleId, permissionIds) {
    const role = await findById(roleId);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (PROTECTED_ROLE_NAMES.has(role.role_name)) {
      throw new AppError('System role permissions are managed by the seeder', 403);
    }

    const updatedRole = await removePermissions(roleId, permissionIds);
    await this.invalidateRoleSessions(roleId);
    return updatedRole;
  }
}

export default new RoleService();
