import jwt from 'jsonwebtoken';

// import prisma from '../../database/index.js';

import sessionRepository from '../../modules/users/repositories/sessionRepository.js';
import { UnauthorizedError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Verify JWT token and attach user to request
 */

const authenticate = async (req, res, next) => {
  try {
    // 1. Get Token from Cookie/Header
    let token = req.cookies?.accessToken;
    // ... fallback to header if needed ...
     if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) throw new UnauthorizedError('No token provided');

    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch Session from Redis (Super fast)
    const session = await sessionRepository.findById(decoded.sessionId);

    if (!session) {
      throw new UnauthorizedError('Session expired');
    }

    if (!session.active) {
      throw new UnauthorizedError('User account is inactive');
    }

    // 4. Attach User & Permissions from Redis Data
    // We construct a minimal user object required for the app to function
    req.user = {
      id: session.userId || session.user_id,
      userId: session.userId || session.user_id,
      user_id: session.userId || session.user_id,
      role_name: session.role,
      role_rank: session.role_rank,
      branch_id: session.branch_id,
      user_type: session.user_type,
      full_name: session.full_name,
      email: session.email,
      role: { name: session.role }, // Adapted structure
      // Add other cached fields if needed
    };

    req.session = session;
    req.sessionId = decoded.sessionId;

    // 5. Attach Permissions (Cached in Redis)
    // This allows requirePermission middleware to work without DB calls
    req.permissions = session.permissions || [];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    await authenticate(req, res, () => {});
  } catch (err) {
    // Log the error but continue without user
    logger.error('Authentication failed in optionalAuthenticate', {
      error: err.message,
      stack: err.stack,
      path: req.originalUrl,
    });
  }
  next();
};

export default {
  authenticate,
  optionalAuthenticate,
};
