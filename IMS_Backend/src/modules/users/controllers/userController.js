// src/modules/users/controllers/userController.js

import { successResponse } from '../../../shared/utils/responses.js';
import createUserDto from '../dto/createUser.dto.js';
import updateUserDto from '../dto/updateUser.dto.js';
import userService from '../services/userService.js';
import { cookieConfig } from '../../../shared/utils/tokens.js';

class UserController {
  async createUser(req, res, next) {
    try {
      const userData = createUserDto.from(req.body);
      const user = await userService.createUser(userData);

      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      return successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const query = req.validated?.query || req.query;
      const filters = {
        page: query.page || 1,
        limit: query.limit || 10,
        search: query.search,
        roleId: query.roleId,
        branchId: query.branchId,
        userType: query.userType,
        suspended: query.suspended,
      };

      const result = await userService.getAllUsers(filters);

      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = updateUserDto.from(req.body);
      const user = await userService.updateUser(id, userData);

      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);

      return successResponse(res, result, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.userId; // From auth middleware
      const { currentPassword, newPassword } = req.body;

      const result = await userService.changePassword(userId, currentPassword, newPassword);
      res.clearCookie('accessToken', { path: cookieConfig.path });
      res.clearCookie('refreshToken', { path: cookieConfig.path });

      return successResponse(res, result, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserProfile(req, res, next) {
    try {
      const userId = req.user.userId; // From auth middleware
      const user = await userService.getUserById(userId);

      return successResponse(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const stats = await userService.getUserStats();

      return successResponse(res, stats, 'User statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHierarchy(req, res, next) {
    try {
      const tree = await userService.getHierarchy();
      return successResponse(res, tree, 'Organizational hierarchy retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSupervisor(req, res, next) {
    try {
      const userId = req.user.userId;
      const supervisor = await userService.getSupervisor(userId);
      return successResponse(res, supervisor, 'Supervisor retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
