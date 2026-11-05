// src/modules/auth/authController.js
import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import { jwtRefreshSecret } from '../../../config/env.js';
import { UnauthorizedError, BadRequestError } from '../../../shared/utils/errors.js';
import { successResponse } from '../../../shared/utils/responses.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  cookieConfig
} from '../../../shared/utils/tokens.js';
import sessionRepository from '../../users/repositories/sessionRepository.js';
import userService from '../services/userService.js';
// ... other imports (tokens, errors, responses)

class AuthController {

  async login(req, res, next) {
    try {
      const { fayda_id, password } = req.body;

      if (!fayda_id || !password) {
        throw new BadRequestError('Fayda ID and password are required');
      }

      const user = await userService.validateUserCredentials(fayda_id, password);

      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const permissions = user.role.permissions.map(p => p.code);

      const sessionPayload = {
        userId: user.user_id,
        user_id: user.user_id,
        role: user.role.role_name,
        role_rank: user.role.role_rank,
        branch_id: user.branch_id,
        user_type: user.user_type,
        full_name: user.full_name,
        email: user.email,
        permissions: permissions,
        active: true, // Required by authentication middleware
      };

      const sessionId = crypto.randomUUID();

      const refreshToken = generateRefreshToken({ userId: user.user_id, sessionId });
      const refreshTokenHash = hashToken(refreshToken);

      await sessionRepository.create(sessionId, {
        ...sessionPayload,
        refreshTokenHash,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        createdAt: new Date().toISOString()
      });

      const accessToken = generateAccessToken({ userId: user.user_id, sessionId });

      res.cookie('accessToken', accessToken, {
        ...cookieConfig,
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', refreshToken, {
        ...cookieConfig,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      const { password: _password, ...userSafe } = user;

      return successResponse(res, {
        user: userSafe,
        role_rank: user.role.role_rank,
        branch_id: user.branch_id,
        user_type: user.user_type,
        full_name: user.full_name,
        email: user.email,
        token: accessToken // Returning token in body too for convenience
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!incomingRefreshToken) throw new UnauthorizedError('Refresh token missing');

      // 1. Verify JWT
      let decoded;
      try {
        decoded = jwt.verify(incomingRefreshToken, jwtRefreshSecret);
      } catch (e) { throw new UnauthorizedError('Invalid refresh token'); }

      // 2. Get Session from Redis
      const session = await sessionRepository.findById(decoded.sessionId);
      if (!session) {
        // If JWT is valid but session is gone, user probably logged out or expired
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new UnauthorizedError('Session expired');
      }

      // 3. Reuse Detection
      const incomingHash = hashToken(incomingRefreshToken);
      if (session.refreshTokenHash !== incomingHash) {
        // Theft detected! Delete session immediately.
        await sessionRepository.delete(decoded.sessionId);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new UnauthorizedError('Token reuse detected');
      }

      // 4. Rotate
      const newRefreshToken = generateRefreshToken({ userId: session.userId, sessionId: decoded.sessionId });
      const newAccessToken = generateAccessToken({ userId: session.userId, sessionId: decoded.sessionId });

      // 5. Update Redis
      await sessionRepository.update(decoded.sessionId, {
        refreshTokenHash: hashToken(newRefreshToken)
      });

      // 6. Send Cookies
      res.cookie('accessToken', newAccessToken, {
        ...cookieConfig,
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', newRefreshToken, {
        ...cookieConfig,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });


      return successResponse(res, null, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
      if (token) {
        const decoded = jwt.decode(token);
        if (decoded?.sessionId) {
          // Simply delete key from Redis
          await sessionRepository.delete(decoded.sessionId);
        }
      }
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return successResponse(res, null, 'Logged out');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();