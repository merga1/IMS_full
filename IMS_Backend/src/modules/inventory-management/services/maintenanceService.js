import prisma from '../../../database/index.js';
import maintenanceRepository from '../repositories/maintenanceRepository.js';
import assetRepository from '../repositories/assetRepository.js';
import auditService from '../../../shared/services/audit/auditService.js';
import { assetSummarySelect, userSummarySelect } from '../../../shared/constants/prismaSelects.js';
import { ForbiddenError, NotFoundError, BadRequestError } from '../../../shared/utils/errors.js';

class MaintenanceService {
    /**
     * Hardware Path: Link to Asset_ID for physical repair history.
     * Digital Path: Link to Sys_ID for software bugs, OS updates, etc.
     */
    async reportIncident(data, user, permissions = []) {
        const { asset_id, sys_id, incident_type } = data;

        const incident = await prisma.$transaction(async (tx) => {
            if (asset_id) {
                const asset = await tx.asset.findUnique({
                    where: { asset_id },
                    select: { asset_id: true, holder_id: true },
                });
                if (!asset) throw new NotFoundError('Asset not found');
                const canManageInventory = permissions.includes('INVENTORY.UPDATE') || permissions.includes('INVENTORY.SCRAP');
                if (asset.holder_id !== user.user_id && !canManageInventory) {
                    throw new ForbiddenError('You can only report incidents for assets assigned to you.');
                }
            }

            const createdIncident = await maintenanceRepository.create({
                asset_id,
                sys_id,
                reported_by: user.user_id,
                incident_type,
            }, tx);

            // Loss or damage reports freeze the reporter until the incident is resolved.
            if (incident_type === 'LOST' || incident_type === 'DAMAGED') {
                await tx.user.update({
                    where: { user_id: user.user_id },
                    data: { is_suspended_from_clearance: true }
                });

                if (incident_type === 'LOST' && asset_id) {
                    await tx.asset.update({ where: { asset_id }, data: { status: 'LOST' } });
                } else if (incident_type === 'DAMAGED' && asset_id) {
                    await tx.asset.update({ where: { asset_id }, data: { status: 'UNDER_MAINTENANCE' } });
                }
            }
            return createdIncident;
        });

        await auditService.log({
            userId: user.user_id,
            action: `INCIDENT_${incident_type}_REPORTED`,
            entityType: 'IncidentReport',
            entityId: incident.incident_id,
            metadata: { asset_id, sys_id, type: incident_type }
        });

        return incident;
    }

    async getQueue() {
        return maintenanceRepository.findAllOpen();
    }

    async resolveIncident(incident_id, data, technician) {
        const { resolution, notes } = data; // resolution: REPAIRED, SCRAPPED

        return prisma.$transaction(async (tx) => {
            const numericId = Number(incident_id);
            const existingIncident = await tx.incidentReport.findUnique({
                where: { incident_id: numericId },
                select: { incident_id: true, resolution: true },
            });
            if (!existingIncident) throw new NotFoundError('Incident not found');
            if (existingIncident.resolution) throw new BadRequestError('Incident has already been resolved.');

            const incidentUpdate = await tx.incidentReport.updateMany({
                where: { incident_id: numericId, resolution: null },
                data: { resolution, is_frozen: false },
            });
            if (incidentUpdate.count !== 1) throw new BadRequestError('Incident has already been resolved.');

            const incident = await tx.incidentReport.findUnique({
                where: { incident_id: numericId },
                include: { asset: { select: assetSummarySelect }, reporter: { select: userSummarySelect } },
            });

            if (incident.asset_id) {
                const newStatus = resolution === 'REPAIRED' ? 'IN_STORE' : 'SCRAPPED';
                await tx.asset.update({
                    where: { asset_id: incident.asset_id },
                    data: { status: newStatus, health_card_notes: notes }
                });

            }

            if (incident.reported_by) {
                const otherOpenIncidents = await tx.incidentReport.count({
                    where: {
                        reported_by: incident.reported_by,
                        resolution: null,
                        incident_id: { not: numericId },
                    },
                });
                if (otherOpenIncidents === 0) {
                    await tx.user.update({
                        where: { user_id: incident.reported_by },
                        data: { is_suspended_from_clearance: false },
                    });
                }
            }

            await auditService.log({
                userId: technician.user_id,
                action: 'INCIDENT_RESOLVED',
                entityType: 'IncidentReport',
                entityId: incident_id,
                metadata: { resolution }
            }, tx);

            return incident;
        });
    }

    /**
     * Override Power: Technicians can manually mark an asset as "Scrapped,"
     * which bypasses the lifespan engine for clearance purposes.
     */
    async scrapAsset(asset_id, technician) {
        // Verify technician role/permissions in controller or here if needed

        await assetRepository.updateStatus(asset_id, 'SCRAPPED');

        await auditService.log({
            userId: technician.user_id,
            action: 'ASSET_SCRAPPED_OVERRIDE',
            entityType: 'Asset',
            entityId: asset_id,
        });

        return { message: 'Asset marked as SCRAPPED' };
    }
}

export default new MaintenanceService();
