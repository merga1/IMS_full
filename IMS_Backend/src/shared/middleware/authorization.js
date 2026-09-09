import { ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Check if user has required permission(s)
 */

const requirePermission = (...requiredPermissions) => {
  // Validate inputs
  if (!requiredPermissions.length) {
    throw new Error('At least one permission must be specified');
  }
  if (!requiredPermissions.every((p) => typeof p === 'string' && p.trim())) {
    throw new Error('Permissions must be non-empty strings');
  }
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }
    const hasPermission = requiredPermissions.some((permission) =>
      req.permissions.includes(permission)
    );
    if (!hasPermission) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        required: requiredPermissions,
        has: req.permissions,
      });
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user has ALL required permissions
 */
const requireAllPermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!requiredPermissions.length) {
      throw new Error('At least one role must be specified');
    }
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      req.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      logger.warn('Authorization failed - missing required permissions', {
        userId: req.user.id,
        required: requiredPermissions,
        has: req.permissions,
      });
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user has required role
 */
const requireRole = (...requiredRoles) => {
  return (req, res, next) => {
    if (requiredRoles.length === 0) {
      throw new Error('At least one role must be specified');
    }
    if (!req.user || !req.user.role) {
      return next(new ForbiddenError('Authentication required'));
    }
    const userRole = req.user.role?.name || req.user.role;

    if (!requiredRoles.includes(userRole)) {
      logger.warn('Authorization failed - invalid role', {
        userId: req.user.id,
        required: requiredRoles,
        has: userRole,
      });
      return next(new ForbiddenError('Insufficient role'));
    }

    next();
  };
};

/**
 * Check if user has minimum clearance level
 */
const requireClearance = (minLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (req.user.clearanceLevel < minLevel) {
      logger.warn('Authorization failed - insufficient clearance', {
        userId: req.user.id,
        required: minLevel,
        has: req.user.clearanceLevel,
      });
      return next(new ForbiddenError('Insufficient security clearance'));
    }

    next();
  };
};

/**
 * Check if user owns the resource
 */
const requireOwnership =  (getUserIdFromRequest) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const resourceUserId = await getUserIdFromRequest(req);
    
    if (!resourceUserId) {
      logger.error('Ownership check failed — resourceUserId is null/undefined');
      return next(new ForbiddenError('Invalid resource reference'));
    }
    logger.debug('Ownership check', {
      userId: req.user.id,
      resourceUserId,
      resourceId: req.params.id || req.body.id || 'unknown',
    });
    if (req.user.id !== resourceUserId) {
      logger.warn('Authorization failed - not resource owner', {
        userId: req.user.id,
        resourceUserId,
      });
      return next(new ForbiddenError('You can only access your own resources'));
    }

    next();
  };
};

/**
 * Check ownership OR permission
 */
const requireOwnershipOrPermission = (getUserIdFromRequest, permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const resourceUserId = getUserIdFromRequest(req);
    const isOwner = req.user.id === resourceUserId;
    const hasPermission = req.permissions.includes(permission);

    if (!isOwner && !hasPermission) {
      logger.warn('Authorization failed - not owner and no permission', {
        userId: req.user.id,
        resourceUserId,
        permission,
      });
      return next(new ForbiddenError('Access denied'));
    }

    next();
  };
};

const requireAdmin = () => requireRole('admin');

export {
  requireAdmin,
  requirePermission,
  requireAllPermissions,
  requireRole,
  requireClearance,
  requireOwnership,
  requireOwnershipOrPermission,
};
