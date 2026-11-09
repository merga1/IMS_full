// src/modules/users/repositories/permissionRepository.js

import prisma from '../../../database/index.js'; 

class PermissionRepository {
  async create(permissionData) {
    return await prisma.permission.create({
      data: permissionData
    });
  }

  async findById(id) {
    return await prisma.permission.findUnique({
      where: { permission_id: Number(id) }
    });
  }

  async findByCode(code) {
    return await prisma.permission.findUnique({
      where: { code }
    });
  }

  async findAll(filters = {}) {
    const { module, search } = filters;

    const where = {};

    if (module) where.module = module;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    return await prisma.permission.findMany({
      where,
      orderBy: [
        { module: 'asc' },
        { code: 'asc' }
      ]
    });
  }

  async findByIds(ids) {
    return await prisma.permission.findMany({
      where: {
        permission_id: { in: ids.map(Number) }
      }
    });
  }

  async findRoleIdsByPermission(id) {
    const permission = await prisma.permission.findUnique({
      where: { permission_id: Number(id) },
      select: { roles: { select: { role_id: true } } },
    });
    return permission?.roles.map((role) => role.role_id) || [];
  }

  async remove(id) {
    return await prisma.permission.delete({
      where: { permission_id: Number(id) }
    });
  }

  async findByModule(module) {
    return await prisma.permission.findMany({
      where: { module },
      orderBy: { code: 'asc' }
    });
  }
}

export default new PermissionRepository();
