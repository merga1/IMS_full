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
}

export default new AssetRepository();
