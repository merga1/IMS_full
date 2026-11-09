import prisma from '../../../database/index.js';
import { assetSummarySelect } from '../../../shared/constants/prismaSelects.js';

class UserRepository {
  async create(userData) {
    return await prisma.user.create({
      data: userData,
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  async findById(user_id) {
    return await prisma.user.findUnique({
      where: { user_id },
      select: {
        user_id: true,
        fayda_id: true,
        full_name: true,
        email: true,
        role_id: true,
        supervisor_id: true,
        user_type: true,
        branch_id: true,
        is_suspended_from_clearance: true,
        role: { select: { role_id: true, role_name: true, role_rank: true } },
        branch: true,
        supervisor: {
          select: {
            user_id: true,
            fayda_id: true,
            full_name: true,
            email: true,
            role_id: true,
            user_type: true,
            branch_id: true,
            supervisor_id: true,
          },
        },
        assetsHeld: {
          where: { status: 'ISSUED' },
          select: assetSummarySelect,
        },
        thirdPartyMeta: {
          include: {
            sponsor: {
              select: {
                user_id: true,
                fayda_id: true,
                full_name: true,
                email: true,
                role_id: true,
                user_type: true,
                branch_id: true,
                supervisor_id: true,
              },
            },
          }
        }
      }
    });
  }

  async findByIdWithPassword(user_id) {
    return prisma.user.findUnique({
      where: { user_id },
      select: { user_id: true, password: true },
    });
  }

  async findByFaydaId(fayda_id) {
    return await prisma.user.findUnique({
      where: { fayda_id },
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        role: { select: { role_id: true, role_name: true, role_rank: true } }
      }
    });
  }

  async findAll(filters) {
    const { page = 1, limit = 10, search, roleId, branchId, userType, suspended } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { fayda_id: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(roleId && { role_id: Number(roleId) }),
      ...(branchId && { branch_id: Number(branchId) }),
      ...(userType && { user_type: userType }),
      ...(suspended !== undefined && {
        is_suspended_from_clearance: suspended === true || suspended === 'true',
      })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          user_id: true,
          fayda_id: true,
          full_name: true,
          email: true,
          role_id: true,
          supervisor_id: true,
          user_type: true,
          branch_id: true,
          is_suspended_from_clearance: true,
          role: { select: { role_id: true, role_name: true, role_rank: true } },
          branch: true,
        },
        orderBy: { full_name: 'asc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async update(user_id, userData) {
    return await prisma.user.update({
      where: { user_id },
      data: userData,
      select: {
        user_id: true,
        fayda_id: true,
        full_name: true,
        email: true,
        role_id: true,
        supervisor_id: true,
        user_type: true,
        branch_id: true,
        is_suspended_from_clearance: true,
        role: { select: { role_id: true, role_name: true, role_rank: true } },
        branch: true,
      }
    });
  }

  async remove(user_id) {
    return await prisma.user.delete({
      where: { user_id }
    });
  }

  async updatePassword(user_id, hashedPassword) {
    return await prisma.user.update({
      where: { user_id },
      data: { password: hashedPassword }
    });
  }

  async getHierarchy() {
    // This is a simplified hierarchy view. For complex trees, consider recursive CTEs or specialized logic.
    return await prisma.user.findMany({
      where: {
        role: {
          role_rank: { lte: 3 } // Directors and above
        }
      },
      select: {
        user_id: true,
        fayda_id: true,
        full_name: true,
        supervisor_id: true,
        role: {
          select: { role_name: true, role_rank: true }
        }
      }
    });
  }

  async countByRole(roleId) {
    return await prisma.user.count({
      where: { role_id: Number(roleId) }
    });
  }

  async findUserIdsByRole(roleId) {
    const users = await prisma.user.findMany({
      where: { role_id: Number(roleId) },
      select: { user_id: true },
    });
    return users.map((user) => user.user_id);
  }

  async findUserIdsByRoles(roleIds) {
    if (!roleIds.length) return [];
    const users = await prisma.user.findMany({
      where: { role_id: { in: roleIds.map(Number) } },
      select: { user_id: true },
    });
    return users.map((user) => user.user_id);
  }

  async getStats() {
    const [total, suspended, byType] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { is_suspended_from_clearance: true } }),
      prisma.user.groupBy({ by: ['user_type'], _count: { _all: true } }),
    ]);

    return {
      total,
      suspended,
      byType: Object.fromEntries(
        byType.map((item) => [item.user_type || 'UNSPECIFIED', item._count._all])
      ),
    };
  }
}

export default new UserRepository();
