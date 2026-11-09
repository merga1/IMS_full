import { hash, compare } from 'bcrypt';

import { AppError } from '../../../shared/utils/errors.js';
import roleRepository from '../repositories/roleRepository.js';
import sessionRepository from '../repositories/sessionRepository.js';
import userRepository from '../repositories/userRepository.js';

const omitPassword = (user) =>
  Object.fromEntries(Object.entries(user).filter(([key]) => key !== 'password'));

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

    const role = await roleRepository.findById(userData.role_id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (await userRepository.findByFaydaId(userData.fayda_id)) {
      throw new AppError('Fayda ID already in use', 409);
    }

    const hashedPassword = await hash(userData.password, 12);

    const user = await userRepository.create({
      ...userData,
      password: hashedPassword
    });

    return omitPassword(user);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return omitPassword(user);
  }

  async getUserByEmail(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return omitPassword(user);
  }

  async getAllUsers(filters) {
    const result = await userRepository.findAll(filters);

    result.users = result.users.map(omitPassword);

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

    if (userData.role_id) {
      const role = await roleRepository.findById(userData.role_id);
      if (!role) {
        throw new AppError('Role not found', 404);
      }
    }

    const updatedUser = await userRepository.update(id, userData);
    await sessionRepository.deleteUserSessions(id);

    return omitPassword(updatedUser);
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await userRepository.remove(id);
    await sessionRepository.deleteUserSessions(id);

    return { message: 'User deleted successfully' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
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
    await sessionRepository.deleteUserSessions(userId);

    return { message: 'Password changed successfully' };
  }

  async getUserStats() {
    return userRepository.getStats();
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
