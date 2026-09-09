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
        if (requisition.otp_hash) {
            const isValid = await bcrypt.compare(otp, requisition.otp_hash);
            if (!isValid) throw new BadRequestError('Invalid OTP');
        }

        const asset = asset_id ? await assetRepository.findById(asset_id) : null;
        const categoryType = asset?.sku?.category?.type;

        // 2. High-Value Check: If Serialized, check if signature exists
        if (categoryType === 'SERIALIZED') {
            const sig = await dispatchRepository.findSignatureByReqId(req_id);
            if (!sig) throw new BadRequestError('Digital signature is required before OTP verification for Serialized assets.');
        }

        // 3. Atomic Swap
        return prisma.$transaction(async (tx) => {
            // Update Requisition
            await tx.requisition.update({
                where: { req_id },
                data: { status: 'DISPATCHED' }
            });

            // Update Asset/Consumable
            if (asset_id) {
                await tx.asset.update({
                    where: { asset_id },
                    data: {
                        holder_id: requisition.requester_id,
                        status: 'ISSUED',
                        issued_at: new Date(),
                    }
                });
            } else if (categoryType === 'CONSUMABLE') {
                await tx.consumableLog.create({
                    data: {
                        sku_id: requisition.sku_id,
                        user_id: requisition.requester_id,
                        quantity_issued: requisition.quantity,
                    }
                });
                await tx.skuVariant.update({
                    where: { sku_id: requisition.sku_id },
                    data: { current_stock: { decrement: requisition.quantity } }
                });
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
