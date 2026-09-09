import assetRepository from '../repositories/assetRepository.js';

class AssetService {
    /**
     * Dynamic Lifespan Engine
     * Formula: Asset Age = Current Date - Issuance/Deployment Date
     */
    calculateAssetAge(asset) {
        if (!asset.issued_at) return 0;
        const now = new Date();
        const issuedAt = new Date(asset.issued_at);

        const diffTime = Math.abs(now - issuedAt);
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average month length
        return diffMonths;
    }

    /**
     * Logic:
     * If Asset Age < Category Lifespan: Marked as "Active Property"
     * If Asset Age >= Category Lifespan: Marked as "Depreciated"
     */
    async getAssetLifespanStatus(asset_id) {
        const asset = await assetRepository.findById(asset_id);
        if (!asset) throw new Error('Asset not found');
        if (!asset.sku || !asset.sku.lifespan_months) return 'N/A';

        const age = this.calculateAssetAge(asset);
        return age < asset.sku.lifespan_months ? 'Active Property' : 'Depreciated';
    }
}

export default new AssetService();
