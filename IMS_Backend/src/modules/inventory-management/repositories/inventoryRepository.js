import prisma from '../../../database/index.js';
import { BadRequestError, NotFoundError } from '../../../shared/utils/errors.js';

class InventoryRepository {
  async createSku(data) {
    return prisma.skuVariant.create({
      data: {
        sku_id: data.sku_id,
        item_name: data.item_name,
        cat_id: data.cat_id,
        current_stock: data.current_stock ?? 0,
        max_capacity: data.max_capacity ?? null,
        threshold_qty: data.threshold_qty,
        lifespan_months: data.lifespan_months,
      },
    });
  }

  async getSummary() {
    // Global view of stock levels and threshold status
    return prisma.skuVariant.findMany({
      include: {
        category: true,
        _count: {
          select: { assets: { where: { status: 'IN_STORE' } } }
        }
      }
    });
  }

  async findByBranch(branch_id) {
    // View local stock and specific branch low-stock triggers
    return prisma.skuVariant.findMany({
      where: {
        assets: {
          some: {
            location: { branch_id: Number(branch_id) }
          }
        }
      },
      include: {
          _count: {
          select: { assets: { where: { location: { branch_id: Number(branch_id) }, status: 'IN_STORE' } } }
        }
      }
    });
  }

  async initiateTransfer(data) {
      const { asset_id, from_loc_id, to_loc_id, issued_by, sender_sig } = data;

    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { asset_id } });
      if (!asset) throw new NotFoundError('Asset not found');
      if (asset.status !== 'IN_STORE' || asset.location_id !== from_loc_id) {
        throw new BadRequestError('Asset is not available at the specified source location');
      }

      const assetUpdate = await tx.asset.updateMany({
        where: { asset_id, status: 'IN_STORE', location_id: from_loc_id },
        data: { status: 'IN_TRANSIT' },
      });
      if (assetUpdate.count !== 1) throw new BadRequestError('Asset is no longer available for transfer');

      // 1. Create Gate Pass
      const gatePass = await tx.gatePass.create({
        data: {
          asset_id,
          from_loc_id,
          to_loc_id,
          issued_by,
          sender_sig,
          status: 'PENDING'
        }
      });

      return gatePass;
    });
  }

  async completeReceipt(data) {
    const { pass_id, receiver_id, receiver_sig } = data;

    return prisma.$transaction(async (tx) => {
      const existingPass = await tx.gatePass.findUnique({ where: { pass_id } });
      if (!existingPass) throw new NotFoundError('Gate pass not found');
      if (existingPass.status !== 'PENDING') throw new BadRequestError('Gate pass has already been received');

      const passUpdate = await tx.gatePass.updateMany({
        where: { pass_id, status: 'PENDING' },
        data: {
          receiver_id,
          receiver_sig,
          received_at: new Date(),
          status: 'RECEIVED',
        },
      });
      if (passUpdate.count !== 1) throw new BadRequestError('Gate pass has already been received');

      // 1. Update Gate Pass
      const gatePass = await tx.gatePass.findUnique({ where: { pass_id } });

      // 2. Update Asset Location and status
      const assetUpdate = await tx.asset.updateMany({
        where: { asset_id: gatePass.asset_id, status: 'IN_TRANSIT' },
        data: {
          location_id: gatePass.to_loc_id,
          status: 'IN_STORE'
        }
      });
      if (assetUpdate.count !== 1) throw new BadRequestError('Transferred asset is no longer in transit');

      return gatePass;
    });
  }
}

export default new InventoryRepository();
