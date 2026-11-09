import prisma from '../../../database/index.js';
import assetRepository from '../repositories/assetRepository.js';
import requisitionRepository from '../repositories/requisitionRepository.js';
import dispatchRepository from '../repositories/dispatchRepository.js';
import { BadRequestError, NotFoundError } from '../../../shared/utils/errors.js';
import auditService from '../../../shared/services/audit/auditService.js';
import bcrypt from 'bcrypt';

class DispatchService {
    /**
     * Validates OTP hash; triggers atomic transfer of asset to custody.
     */
    async verifyOtpAndTransfer(req_id, otp, asset_id, storekeeper) {
        const requisition = await requisitionRepository.findById(req_id);
        if (!requisition) throw new NotFoundError('Requisition not found');
        if (requisition.status !== 'APPROVED') throw new BadRequestError('Requisition is not in APPROVED status');

        // 1. OTP Verification
        if (!requisition.otp_hash) throw new BadRequestError('This requisition has no active pickup OTP.');
        const isValid = await bcrypt.compare(otp, requisition.otp_hash);
        if (!isValid) throw new BadRequestError('Invalid OTP');

        const asset = asset_id ? await assetRepository.findById(asset_id) : null;
        const categoryType = requisition.sku?.category?.type;
        if (!categoryType) throw new BadRequestError('The requested SKU has no valid category.');

        if (categoryType === 'CONSUMABLE') {
            if (asset_id) throw new BadRequestError('Consumables are issued by quantity and do not use asset IDs.');
            if (requisition.sku.current_stock < requisition.quantity) {
                throw new BadRequestError('Not enough stock is available to fulfill this requisition.');
            }
        } else {
            if (requisition.quantity !== 1) {
                throw new BadRequestError('Serialized and digital items must be requested one at a time.');
            }
            if (!asset) throw new BadRequestError('An asset ID is required for this item.');
            if (asset.sku_id !== requisition.sku_id) throw new BadRequestError('The selected asset does not match the requested SKU.');
            if (asset.status !== 'IN_STORE') throw new BadRequestError('The selected asset is not available in store.');
        }

        // 2. High-Value Check: If Serialized, check if signature exists
        if (categoryType === 'SERIALIZED') {
            const sig = await dispatchRepository.findSignatureByReqId(req_id);
            if (!sig) throw new BadRequestError('Digital signature is required before OTP verification for Serialized assets.');
        }

        // 3. Atomic Swap
        return prisma.$transaction(async (tx) => {
            const requestUpdate = await tx.requisition.updateMany({
                where: { req_id, status: 'APPROVED' },
                data: { status: 'DISPATCHED' },
            });
            if (requestUpdate.count !== 1) throw new BadRequestError('Requisition has already been dispatched or changed.');

            // Update Asset/Consumable
            if (asset_id) {
                const assetUpdate = await tx.asset.updateMany({
                    where: { asset_id, sku_id: requisition.sku_id, status: 'IN_STORE' },
                    data: {
                        holder_id: requisition.requester_id,
                        status: 'ISSUED',
                        issued_at: new Date(),
                    }
                });
                if (assetUpdate.count !== 1) throw new BadRequestError('The selected asset is no longer available.');
            } else if (categoryType === 'CONSUMABLE') {
                await tx.consumableLog.create({
                    data: {
                        sku_id: requisition.sku_id,
                        user_id: requisition.requester_id,
                        quantity_issued: requisition.quantity,
                    }
                });
                const stockUpdate = await tx.skuVariant.updateMany({
                    where: { sku_id: requisition.sku_id, current_stock: { gte: requisition.quantity } },
                    data: { current_stock: { decrement: requisition.quantity } }
                });
                if (stockUpdate.count !== 1) throw new BadRequestError('Not enough stock is available to fulfill this requisition.');
            }

            await auditService.log({
                userId: storekeeper.user_id,
                action: 'OTP_VERIFIED_AND_DISPATCHED',
                entityType: 'Requisition',
                entityId: req_id,
                metadata: { asset_id, holder_id: requisition.requester_id }
            }, tx);

            return { message: 'OTP verified and asset issued successfully' };
        });
    }

    /**
     * Triggers App/SMS notification that an item is ready for pick-up.
     */
    async notifyReadyForPickup(req_id, storekeeper) {
        const requisition = await requisitionRepository.findById(req_id);
        if (!requisition) throw new NotFoundError('Requisition not found');
        if (requisition.status !== 'APPROVED') throw new BadRequestError('Only approved requisitions can be marked ready for pickup.');

        // In a real system, send SMS/Email/Push notification here
        await auditService.log({
            userId: storekeeper.user_id,
            action: 'PICKUP_NOTIFICATION_SENT',
            entityType: 'Requisition',
            entityId: req_id,
            metadata: { requester_id: requisition.requester_id }
        });

        return { message: 'Notification sent to requester' };
    }

    /**
     * Retrieves digital gate pass for scanning at branch exits.
     */
    async getGatePass(pass_id) {
        const pass = await dispatchRepository.findGatePassById(pass_id);
        if (!pass) throw new NotFoundError('Gate Pass not found');
        return pass;
    }

    /**
     * Captures/stores the Base64 signature for high-value asset issuance.
     */
    async captureSignature(req_id, signature_blob, user) {
        const requisition = await requisitionRepository.findById(req_id);
        if (!requisition) throw new NotFoundError('Requisition not found');
        if (requisition.status !== 'APPROVED') throw new BadRequestError('A signature can only be captured for an approved requisition.');

        const sig = await dispatchRepository.createSignature({
            req_id,
            signature_blob
        });

        await auditService.log({
            userId: user.user_id,
            action: 'SIGNATURE_CAPTURED',
            entityType: 'Requisition',
            entityId: req_id
        });

        return sig;
    }
}

export default new DispatchService();
