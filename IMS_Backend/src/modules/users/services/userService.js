import { hash, compare } from 'bcrypt';

import { AppError } from '../../../shared/utils/errors.js';
import roleRepository from '../repositories/roleRepository.js';
import userRepository from '../repositories/userRepository.js';

class UserService {
  async validateUserCredentials(faydaId, password) {
    const user = await userRepository.findByFaydaId(faydaId);
    if (!user) return null;

    const isValid = await compare(password, user.password);
    if (!isValid) return null;

    return user;
  }

  async createUser(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const role = await roleRepository.findById(userData.roleId);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    const hashedPassword = await hash(userData.password, 12);

    const user = await userRepository.create({
      ...userData,
      password: hashedPassword
    });

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByEmail(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers(filters) {
    const result = await userRepository.findAll(filters);

    result.users = result.users.map(user => {
      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return result;
  }

  async updateUser(id, userData) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (userData.email && userData.email !== user.email) {
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new AppError('Email already in use', 409);
      }
    }

    if (userData.roleId) {
      const role = await roleRepository.findById(userData.roleId);
      if (!role) {
        throw new AppError('Role not found', 404);
      }
    }

    const updatedUser = await userRepository.update(id, userData);

    const { password: _password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await userRepository.remove(id);

    return { message: 'User deleted successfully' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update password
    await userRepository.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }

  async updateLastLogin(userId) {
    return await userRepository.updateLastLogin(userId);
  }

  async getUserStats() {
    const [total, active, inactive] = await Promise.all([
      userRepository.findAll({ limit: 1 }),
      userRepository.findAll({ active: 'true', limit: 1 }),
      userRepository.findAll({ active: 'false', limit: 1 })
    ]);

    return {
      total: total.pagination.total,
      active: active.pagination.total,
      inactive: inactive.pagination.total
    };
  }

  async getHierarchy() {
    return await userRepository.getHierarchy();
  }

  async getSupervisor(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.user_type === 'THIRD_PARTY') {
      return user.thirdPartyMeta?.[0]?.sponsor || null;
    }

    return user.supervisor;
  }
}

export default new UserService();