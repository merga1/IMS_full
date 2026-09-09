import maintananceRepository from '../repositories/maintananceRepository.js';
import assetRepository from '../repositories/assetRepository.js';
import auditService from '../../../shared/services/audit/auditService.js';

class MaintenanceService {
    /**
     * Hardware Path: Link to Asset_ID for physical repair history.
     * Digital Path: Link to Sys_ID for software bugs, OS updates, etc.
     */
    async reportIncident(data, user) {
        const { asset_id, sys_id, incident_type, description } = data;

        const incident = await maintananceRepository.create({
            asset_id,
            sys_id,
            reported_by: user.user_id,
            incident_type,
            description,
            status: 'OPEN'
        });

        // 3. Loss/Damage: Reporting an incident flags the user's clearance profile immediately
        if (incident_type === 'LOST' || incident_type === 'DAMAGED') {
            await prisma.user.update({
                where: { user_id: user.user_id },
                data: { is_suspended_from_clearance: true }
            });

            // If LOST, also update asset status to LOST
            if (incident_type === 'LOST' && asset_id) {
                await assetRepository.updateStatus(asset_id, 'LOST');
            } else if (incident_type === 'DAMAGED' && asset_id) {
                await assetRepository.updateStatus(asset_id, 'UNDER_MAINTENANCE');
            }
        }

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
        return maintananceRepository.findAllOpen();
    }

    async resolveIncident(incident_id, data, technician) {
        const { resolution, notes } = data; // resolution: REPAIRED, SCRAPPED

        return prisma.$transaction(async (tx) => {
            const incident = await tx.incidentReport.update({
                where: { incident_id: parseInt(incident_id) },
                data: { resolution, is_frozen: false }, // Unfreeze the incident
                include: { asset: true, reporter: true }
            });

            if (incident.asset_id) {
                const newStatus = resolution === 'REPAIRED' ? 'IN_STORE' : 'SCRAPPED';
                await tx.asset.update({
                    where: { asset_id: incident.asset_id },
                    data: { status: newStatus, health_card_notes: notes }
                });

                // Check if user should be unfrozen
                // Rule: If resolution is reached, we might unfreeze the user, 
                // but usually clearance is only restored after a formal investigation or replacement.
                // For now, let's unfreeze them if it was REPAIRED or formally SCRAPPED.
                await tx.user.update({
                    where: { user_id: incident.reported_by },
                    data: { is_suspended_from_clearance: false }
                });
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
