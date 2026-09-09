import prisma from '../../../database/index.js';

class MaintenanceRepository {
    async create(data) {
        return prisma.incidentReport.create({
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
            include: { asset: true, reporter: true }
        });
    }

    async findAllOpen() {
        return prisma.incidentReport.findMany({
            where: { resolution: null },
            include: { asset: { include: { sku: true } }, reporter: true },
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
