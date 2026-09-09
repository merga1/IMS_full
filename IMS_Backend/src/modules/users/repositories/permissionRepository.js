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
      where: { id }
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
        id: { in: ids }
      }
    });
  }

  async remove(id) {
    return await prisma.permission.delete({
      where: { id }
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