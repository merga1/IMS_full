import prisma from '../../../database/index.js';

class InventoryRepository {
  async createSku(data) {
    return prisma.skuVariant.create({
      data: {
        sku_id: data.sku_id,
        item_name: data.item_name,
        cat_id: data.cat_id,
        current_stock: data.current_stock || 0,
        threshold_qty: data.threshold_qty,
        lifespan_months: data.lifespan_months,
      },
    });
  }

  async findSkuById(sku_id) {
    return prisma.skuVariant.findUnique({
      where: { sku_id },
      include: { category: true }
    });
  }

  async updateStock(sku_id, quantityChange) {
    return prisma.skuVariant.update({
      where: { sku_id },
      data: {
        current_stock: { increment: quantityChange }
      }
    });
  }

  async findLowStockSkus() {
    // Finds SKUs where current_stock <= threshold_qty (the 10% rule)
    return prisma.skuVariant.findMany({
      where: {
        current_stock: {
          lte: prisma.skuVariant.fields.threshold_qty
        }
      },
      include: { category: true }
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
            location: { branch_id }
          }
        }
      },
      include: {
        _count: {
          select: { assets: { where: { location: { branch_id }, status: 'IN_STORE' } } }
        }
      }
    });
  }

  async initiateTransfer(data) {
    const { asset_id, from_loc_id, to_loc_id, issued_by, sender_sig } = data;

    return prisma.$transaction(async (tx) => {
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

      // 2. Update Asset status
      await tx.asset.update({
        where: { asset_id },
        data: { status: 'IN_TRANSIT' }
      });

      return gatePass;
    });
  }

  async completeReceipt(data) {
    const { pass_id, receiver_id, receiver_sig, to_loc_id } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Update Gate Pass
      const gatePass = await tx.gatePass.update({
        where: { pass_id },
        data: {
          receiver_id,
          receiver_sig,
          received_at: new Date(),
          status: 'RECEIVED'
        }
      });

      // 2. Update Asset Location and status
      await tx.asset.update({
        where: { asset_id: gatePass.asset_id },
        data: {
          location_id: to_loc_id,
          status: 'IN_STORE'
        }
      });

      return gatePass;
    });
  }

  async findAllAssets(filters, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.sku_id && { sku_id: filters.sku_id }),
      ...(filters.status && { status: filters.status }),
      ...(filters.holder_id && { holder_id: filters.holder_id }),
    };

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        include: { sku: true, holder: true, location: true },
      }),
      prisma.asset.count({ where }),
    ]);

    return {
      data: assets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new InventoryRepository();