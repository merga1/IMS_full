import prisma from '../../../database/index.js';

class ThirdPartyRepository {
    async findExpiredContracts() {
        return prisma.thirdPartyMeta.findMany({
            where: {
                contract_expiry: {
                    lte: new Date(),
                },
            },
            include: {
                user: {
                    select: {
                        user_id: true,
                        assetsHeld: { select: { asset_id: true } },
                    },
                },
            },
        });
    }

    async updateAssetStatus(asset_id, status) {
        return prisma.asset.update({
            where: { asset_id },
            data: { status },
        });
    }
}

export default new ThirdPartyRepository();
