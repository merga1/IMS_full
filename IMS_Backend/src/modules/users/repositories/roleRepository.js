// src/modules/users/repositories/roleRepository.js

import prisma from '../../../database/index.js'; 

class RoleRepository {
  async create(roleData) {
    const { permissionIds, ...data } = roleData;

    return await prisma.role.create({
      data: {
        ...data,
        permissions: {
          connect: permissionIds.map(id => ({ id }))
        }
      },
      include: {
        permissions: true,
        _count: {
          select: { users: true }
        }
      }
    });
  }

  async findById(id) {
    return await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: {
          select: { users: true }
        }
      }
    });
  }

  async findByName(name) {
    return await prisma.role.findUnique({
      where: { name },
      include: {
        permissions: true
      }
    });
  }

  async findAll(filters = {}) {
    const { page = 1, limit = 10, search, isSystem } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isSystem !== undefined) where.isSystem = isSystem === 'true';

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          permissions: true,
          _count: {
            select: { users: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.role.count({ where })
    ]);

    return {
      roles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async update(id, roleData) {
    return await prisma.role.update({
      where: { id },
      data: roleData,
      include: {
        permissions: true,
        _count: {
          select: { users: true }
        }
      }
    });
  }

  async remove(id) {
    return await prisma.role.delete({
      where: { id }
    });
  }

  async assignPermissions(roleId, permissionIds) {
    return await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map(id => ({ id }))
        }
      },
      include: {
        permissions: true
      }
    });
  }

  async removePermissions(roleId, permissionIds) {
    return await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          disconnect: permissionIds.map(id => ({ id }))
        }
      },
      include: {
        permissions: true
      }
    });
  }
}

export default new RoleRepository();