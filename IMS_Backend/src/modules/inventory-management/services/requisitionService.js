import requisitionRepository from '../repositories/requisitionRepository.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../shared/utils/errors.js';
import auditService from '../../../shared/services/audit/auditService.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

class RequisitionService {
    async createRequisition(data, user) {
        const { sku_id, quantity } = data;

        // 1. Identify Approvers based on refined logic
        const approvers = await this.identifyApprovers(user);

        if (approvers.length === 0) {
            throw new BadRequestError('Could not identify any approvers for this requisition.');
        }

        // 2. Generate unique 6-digit OTP tied to request
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_hash = await bcrypt.hash(otp, 10);

        // 3. Create Requisition and Steps
        const requisition = await requisitionRepository.create({
            requester_id: user.user_id,
            sku_id,
            quantity,
            steps: approvers,
            otp_hash,
        });

        // 4. Log Audit
        await auditService.log({
            userId: user.user_id,
            action: 'REQUISITION_CREATED',
            entityType: 'Requisition',
            entityId: requisition.req_id,
            changes: { sku_id, quantity },
            metadata: { otp_display: otp } // In real system, this would be sent via SMS/Email
        });

        return { ...requisition, otp }; // Return OTP once for user to see
    }

    async triggerAskToBuy(req_id, storekeeper) {
        const requisition = await requisitionRepository.findById(req_id);
        if (!requisition) throw new NotFoundError('Requisition not found');

        // Verify stock is actually 0
        const sku = await requisitionRepository.findSku(requisition.sku_id);
        if (sku.current_stock > 0) {
            throw new BadRequestError('Stock is available. Process fulfillment instead.');
        }

        // Create Procurement record (Ask-to-Buy)
        const procurement = await requisitionRepository.createProcurement(req_id);

        await auditService.log({
            userId: storekeeper.user_id,
            action: 'ASK_TO_BUY_TRIGGERED',
            entityType: 'Requisition',
            entityId: req_id,
            metadata: { proc_id: procurement.proc_id }
        });

        return procurement;
    }

    async approveRequisition(req_id, user) {
        const requisition = await requisitionRepository.findById(req_id);
        if (!requisition) throw new NotFoundError('Requisition not found');

        const nextStep = await requisitionRepository.findNextPendingStep(req_id);
        if (!nextStep) {
            throw new BadRequestError('No pending approval steps for this requisition.');
        }

        // Security Verification: Is this the correct approver ID or Rank?
        if (nextStep.approver_id !== user.user_id) {
            throw new ForbiddenError('You are not the designated approver for the current step.');
        }

        // Update Step
        await requisitionRepository.updateStep(nextStep.step_id, 'APPROVED');

        // Check if it was the last step
        const remainingStep = await requisitionRepository.findNextPendingStep(req_id);
        if (!remainingStep) {
            await requisitionRepository.updateStatus(req_id, 'APPROVED');

            await auditService.log({
                userId: user.user_id,
                action: 'REQUISITION_FULLY_APPROVED',
                entityType: 'Requisition',
                entityId: req_id,
            });
        } else {
            await auditService.log({
                userId: user.user_id,
                action: 'REQUISITION_STEP_APPROVED',
                entityType: 'Requisition',
                entityId: req_id,
                metadata: { step_order: nextStep.step_order },
            });
        }

        return requisitionRepository.findById(req_id);
    }

    async rejectRequisition(req_id, user, reason) {
        const requisition = await requisitionRepository.findById(req_id);
        if (!requisition) throw new NotFoundError('Requisition not found');

        const nextStep = await requisitionRepository.findNextPendingStep(req_id);
        if (!nextStep || nextStep.approver_id !== user.user_id) {
            throw new ForbiddenError('You are not authorized to reject this step.');
        }

        await requisitionRepository.updateStep(nextStep.step_id, 'REJECTED');
        await requisitionRepository.updateStatus(req_id, 'REJECTED');

        await auditService.log({
            userId: user.user_id,
            action: 'REQUISITION_REJECTED',
            entityType: 'Requisition',
            entityId: req_id,
            metadata: { reason },
        });

        return requisitionRepository.findById(req_id);
    }

    /**
     * Helper to identify the dynamic approval chain:
     * 1. If THIRD_PARTY, start with sponsor_id.
     * 2. Recursive Search: Fetch supervisor_id until role_rank == 2 (DGD) is reached.
     * 3. Conflict Check: If approver is requester, skip to next level.
     */
    /**
     * Helper to identify the refined approval chain:
     * - Employee: TL (Rank 4) > Director (Rank 3) > DGD (Rank 2).
     * - Third-Party: Sponsor > Deputy General Director (Rank 2).
     * - Self-Request: If Director (Rank 3) requests, skip to DGD (Rank 2).
     */
    async identifyApprovers(requester) {
        const steps = [];
        const user = await requisitionRepository.findUserWithMeta(requester.user_id);
        if (!user) throw new BadRequestError('Requester not found.');

        const rank = user.role?.role_rank || 5;

        // 1. Third-Party Chain
        if (user.user_type === 'THIRD_PARTY') {
            const sponsor = user.thirdPartyMeta?.[0]?.sponsor;
            if (sponsor) {
                steps.push({ approver_id: sponsor.user_id, level: sponsor.role?.role_rank || 4 });
            }
            // Route to DGD
            const dgd = await requisitionRepository.findApproversByRank(2);
            if (dgd.length > 0) steps.push({ approver_id: dgd[0].user_id, level: 2 });
            return steps;
        }

        // 2. Employee Chain (including Self-Request Logic)

        // If Director (Rank 3), start at DGD
        if (rank === 3) {
            const dgd = await requisitionRepository.findApproversByRank(2);
            if (dgd.length > 0) steps.push({ approver_id: dgd[0].user_id, level: 2 });
            return steps;
        }

        // TL (Rank 4) or lower
        if (rank >= 4) {
            // Add TL if exists and not same as requester
            const tls = await requisitionRepository.findApproversByRank(4, user.branch_id);
            if (tls.length > 0 && tls[0].user_id !== requester.user_id) {
                steps.push({ approver_id: tls[0].user_id, level: 4 });
            }

            // Add Director
            const directors = await requisitionRepository.findApproversByRank(3, user.branch_id);
            if (directors.length > 0 && directors[0].user_id !== requester.user_id) {
                steps.push({ approver_id: directors[0].user_id, level: 3 });
            }

            // Add DGD
            const dgd = await requisitionRepository.findApproversByRank(2);
            if (dgd.length > 0) steps.push({ approver_id: dgd[0].user_id, level: 2 });
        }

        return steps;
    }
    async getMyRequests(user) {
        return requisitionRepository.findByRequester(user.user_id);
    }

    async getPendingApprovals(user) {
        return requisitionRepository.findPendingByApprover(user.user_id);
    }

    async processApprovalAction(req_id, user, action, reason) {
        const requisition = await requisitionRepository.findById(req_id);
        if (!requisition) throw new NotFoundError('Requisition not found');

        // Conflict Check: Approver cannot be requester
        if (requisition.requester_id === user.user_id) {
            throw new ForbiddenError('You cannot approve/reject your own requisition.');
        }

        if (action === 'APPROVE') {
            return this.approveRequisition(req_id, user);
        } else if (action === 'REJECT') {
            return this.rejectRequisition(req_id, user, reason);
        }
        throw new BadRequestError('Invalid approval action.');
    }

    async getApprovedRequestsByBranch(user) {
        if (!user.branch_id) throw new BadRequestError('User must be assigned to a branch.');
        return requisitionRepository.findApprovedByBranch(user.branch_id);
    }
}

export default new RequisitionService();
