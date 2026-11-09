import prisma from '../../../database/index.js';
import { assetSummarySelect } from '../../../shared/constants/prismaSelects.js';

class AssetRepository {
    async findById(asset_id) {
        return prisma.asset.findUnique({
            where: { asset_id },
            select: assetSummarySelect,
        });
    }

    async updateStatus(asset_id, status) {
        return prisma.asset.update({
            where: { asset_id },
            data: { status },
        });
    }

    async updateHolder(asset_id, holder_id) {
        return prisma.asset.update({
            where: { asset_id },
            data: {
                holder_id,
                status: 'ISSUED',
                issued_at: new Date(),
            },
        });
    }

    async updateLocation(asset_id, location_id) {
        return prisma.asset.update({
            where: { asset_id },
            data: {
                location_id,
                status: 'ISSUED', // Or DEPLOYED if we want to distinguish
                issued_at: new Date(),
            },
        });
    }
}

export default new AssetRepository();
