import inventoryRepository from '../repositories/inventoryRepository.js';
import auditService from '../../../shared/services/audit/auditService.js';
import { BadRequestError } from '../../../shared/utils/errors.js';

class InventoryService {
  async registerSku(data, user) {
    const sku = await inventoryRepository.createSku(data);

    await auditService.log({
      userId: user.user_id,
      action: 'SKU_REGISTERED',
      entityType: 'SkuVariant',
      entityId: sku.sku_id,
      changes: data,
    });

    return sku;
  }

  async getInventorySummary() {
    const summary = await inventoryRepository.getSummary();
    // Enforce 10% threshold calculation for alerts
    return summary.map(sku => ({
      ...sku,
      is_low_stock: sku.max_capacity ? (sku.current_stock < (0.1 * sku.max_capacity)) : (sku.current_stock <= sku.threshold_qty)
    }));
  }

  async getBranchInventory(branch_id) {
    if (!Number.isInteger(Number(branch_id)) || Number(branch_id) < 1) {
      throw new BadRequestError('Branch ID must be a positive integer.');
    }
    return inventoryRepository.findByBranch(branch_id);
  }

  async initiateAssetTransfer(data, storekeeper) {
    const gatePass = await inventoryRepository.initiateTransfer({
      ...data,
      issued_by: storekeeper.user_id
    });

    await auditService.log({
      userId: storekeeper.user_id,
      action: 'ASSET_TRANSFER_INITIATED',
      entityType: 'Asset',
      entityId: data.asset_id,
      metadata: { pass_id: gatePass.pass_id, to_location_id: data.to_loc_id }
    });

    return gatePass;
  }

  async receiveAsset(data, storekeeper) {
    const gatePass = await inventoryRepository.completeReceipt({
      pass_id: data.pass_id,
      receiver_sig: data.receiver_sig,
      receiver_id: storekeeper.user_id
    });

    await auditService.log({
      userId: storekeeper.user_id,
      action: 'ASSET_TRANSFER_RECEIVED',
      entityType: 'Asset',
      entityId: gatePass.asset_id,
      metadata: { pass_id: data.pass_id }
    });

    return gatePass;
  }
}

export default new InventoryService();
