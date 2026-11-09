import procurementRepository from '../repositories/procurementRepository.js';
import requisitionRepository from '../repositories/requisitionRepository.js';
import auditService from '../../../shared/services/audit/auditService.js';
import { NotFoundError, BadRequestError } from '../../../shared/utils/errors.js';

class ProcurementService {
    /**
     * Converts an unfulfilled request into an "Ask-to-Buy" for the GD.
     */
    async createBuyRequest(req_id, storekeeper) {
        const requisition = await requisitionRepository.findById(req_id);
        if (!requisition) throw new NotFoundError('Requisition not found');
        if (requisition.status !== 'APPROVED') {
            throw new BadRequestError('Requisition must be approved before procurement can be requested.');
        }

        // Check if item is really out of stock
        if (requisition.sku.current_stock >= requisition.quantity) {
            throw new BadRequestError('Enough stock is available. Process fulfillment instead.');
        }

        const procurement = await procurementRepository.create({ req_id });

        await auditService.log({
            userId: storekeeper.user_id,
            action: 'PROCUREMENT_REQUESTED',
            entityType: 'Procurement',
            entityId: procurement.proc_id,
            metadata: { req_id }
        });

        return procurement;
    }

    /**
     * Final financial approval for out-of-stock bulk purchases.
     */
    async gdApprove(proc_id, gd) {
        const procurement = await procurementRepository.findById(proc_id);
        if (!procurement) throw new NotFoundError('Procurement request not found');
        if (procurement.gd_approval_status !== 'PENDING') {
            throw new BadRequestError('Procurement request has already been actioned.');
        }

        const updated = await procurementRepository.update(proc_id, {
            gd_approval_status: 'APPROVED'
        });

        await auditService.log({
            userId: gd.user_id,
            action: 'PROCUREMENT_APPROVED_BY_GD',
            entityType: 'Procurement',
            entityId: proc_id
        });

        // In a real system, trigger purchase order to Procurement Dept here
        return updated;
    }

    async getPendingRequests() {
        return procurementRepository.findAllPending();
    }
}

export default new ProcurementService();
