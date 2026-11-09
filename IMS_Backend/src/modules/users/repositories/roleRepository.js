// src/modules/users/repositories/roleRepository.js

import prisma from '../../../database/index.js'; 

class RoleRepository {
  async create(roleData) {
    const { permissionIds, ...data } = roleData;

    return await prisma.role.create({
      data: {
        ...data,
        permissions: {
          connect: permissionIds.map((permission_id) => ({ permission_id }))
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
      where: { role_id: Number(id) },
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
      where: { role_name: name },
      include: {
        permissions: true
      }
    });
  }

  async findAll(filters = {}) {
    const { page = 1, limit = 10, search } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [{ role_name: { contains: search, mode: 'insensitive' } }];
    }

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
        orderBy: { role_rank: 'asc' }
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
      where: { role_id: Number(id) },
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
      where: { role_id: Number(id) }
    });
  }

  async assignPermissions(roleId, permissionIds) {
    return await prisma.role.update({
      where: { role_id: Number(roleId) },
      data: {
        permissions: {
          set: permissionIds.map((permission_id) => ({ permission_id }))
        }
      },
      include: {
        permissions: true
      }
    });
  }

  async removePermissions(roleId, permissionIds) {
    return await prisma.role.update({
      where: { role_id: Number(roleId) },
      data: {
        permissions: {
          disconnect: permissionIds.map((permission_id) => ({ permission_id }))
        }
      },
      include: {
        permissions: true
      }
    });
  }
}

export default new RoleRepository();
