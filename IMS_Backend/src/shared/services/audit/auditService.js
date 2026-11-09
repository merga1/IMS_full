import prisma from '../../../database/index.js';
import { logger } from '../../utils/logger.js';

class AuditService {
  async log(auditData, client = prisma) {
    try {
      const {
        userId,
        action,
        entityType,
        entityId,
        oldValue,
        newValue,
        changes,
        metadata,
        ipAddress,
        userAgent,
      } = auditData;

      const auditLog = await client.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId: entityId === undefined || entityId === null ? null : String(entityId),
          oldValue: oldValue ? JSON.stringify(oldValue) : null,
          newValue: newValue ? JSON.stringify(newValue) : null,
          changes: changes ? JSON.stringify(changes) : null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ipAddress,
          userAgent,
          timestamp: new Date(),
        },
      });

      return auditLog;
    } catch (error) {
      // Never let audit failure break the main flow
      logger.error('Audit logging failed:', error);
      return null;
    }
  }
}

export default new AuditService();
