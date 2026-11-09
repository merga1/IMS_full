import { ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Route guard: the caller must hold AT LEAST ONE of the listed permission codes
 * (e.g. requirePermission('INVENTORY.UPDATE')). Permissions come from the Redis session
 * that authenticate() attached to the request, so no database call is needed.
 */
export const requirePermission = (...requiredPermissions) => {
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
