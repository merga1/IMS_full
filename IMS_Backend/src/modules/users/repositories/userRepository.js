import prisma from '../../../database/index.js';

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
      include: {
        role: true,
        branch: true,
        supervisor: true,
        assetsHeld: {
          where: { status: 'ISSUED' },
          include: { sku: true }
        },
        thirdPartyMeta: {
          include: { sponsor: true }
        }
      }
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
        role: true
      }
    });
  }

  async findAll(filters) {
    const { page = 1, limit = 10, search, department, active, roleId } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { fayda_id: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(active !== undefined && { active: active === 'true' }),
      ...(roleId && { role_id: parseInt(roleId) })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true, branch: true },
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
      include: { role: true }
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

  async updateLastLogin(user_id) {
    return await prisma.user.update({
      where: { user_id },
      data: { lastLoginAt: new Date() }
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
      where: { role_id: parseInt(roleId) }
    });
  }

  async getUsersWithPermission(permissionCode) {
    return await prisma.user.findMany({
      where: {
        role: {
          permissions: {
            some: {
              code: permissionCode
            }
          }
        }
      },
      include: {
        role: true
      }
    });
  }
}

export default new UserRepository();