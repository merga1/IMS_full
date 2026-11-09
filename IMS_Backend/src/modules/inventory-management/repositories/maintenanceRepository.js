import prisma from '../../../database/index.js';
import { assetSummarySelect, userSummarySelect } from '../../../shared/constants/prismaSelects.js';

class MaintenanceRepository {
    async create(data, client = prisma) {
        return client.incidentReport.create({
            data: {
                asset_id: data.asset_id,
                sys_id: data.sys_id,
                reported_by: data.reported_by,
                incident_type: data.incident_type,
                resolution: data.resolution || null,
                is_frozen: data.is_frozen || false,
            }
        });
    }

    async findById(incident_id) {
        return prisma.incidentReport.findUnique({
            where: { incident_id },
            include: { asset: { select: assetSummarySelect }, reporter: { select: userSummarySelect } }
        });
    }

    async findAllOpen() {
        return prisma.incidentReport.findMany({
            where: { resolution: null },
            include: { asset: { select: assetSummarySelect }, reporter: { select: userSummarySelect } },
            orderBy: { incident_id: 'desc' }
        });
    }

    async update(incident_id, data) {
        return prisma.incidentReport.update({
            where: { incident_id },
            data,
            include: { asset: true }
        });
    }
}

export default new MaintenanceRepository();
