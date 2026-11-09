import thirdPartyRepository from '../repositories/thirdPartyRepository.js';
import auditService from '../../../shared/services/audit/auditService.js';

class ThirdPartyService {
    /**
     * Third-Party Return Logic:
     * Upon contract end, the system flags all assets held by the Third-Party
     * for immediate return to the Storekeeper.
     */
    async checkContractExpirations() {
        const expiredMetas = await thirdPartyRepository.findExpiredContracts();
        const flaggedAssets = [];

        for (const meta of expiredMetas) {
            if (meta.user && meta.user.assetsHeld.length > 0) {
                for (const asset of meta.user.assetsHeld) {
                    // Flag asset for return
                    await thirdPartyRepository.updateAssetStatus(asset.asset_id, 'RETURN_REQUIRED');

                    await auditService.log({
                        userId: null,
                        action: 'ASSET_RETURN_FLAGGED',
                        entityType: 'Asset',
                        entityId: asset.asset_id,
                        metadata: {
                            user_id: meta.user_id,
                            reason: 'Contract Expired',
                            expiry_date: meta.contract_expiry
                        }
                    });

                    flaggedAssets.push(asset.asset_id);
                }
            }
        }

        return flaggedAssets;
    }
}

export default new ThirdPartyService();
