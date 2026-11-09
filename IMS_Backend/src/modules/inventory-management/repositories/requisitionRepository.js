import prisma from '../../../database/index.js';
import { userSummarySelect } from '../../../shared/constants/prismaSelects.js';

class RequisitionRepository {
    async create(data) {
        const { requester_id, sku_id, quantity, steps, otp_hash } = data;

        return prisma.$transaction(async (tx) => {
            const requisition = await tx.requisition.create({
                data: {
                    requester_id,
                    sku_id,
                    quantity,
                    status: 'PENDING_APPROVAL',
                    otp_hash,
                },
            });

            const approvalSteps = await Promise.all(
                steps.map((step, index) =>
                    tx.approvalStep.create({
                        data: {
                            req_id: requisition.req_id,
                            approver_id: step.approver_id,
                            step_order: index + 1,
                            status: 'PENDING',
                        },
                    })
                )
            );

            return { ...requisition, approvalSteps };
        });
    }

    async findById(req_id) {
        return prisma.requisition.findUnique({
            where: { req_id },
            include: {
                requester: { select: userSummarySelect },
                sku: { include: { category: true } },
                approvalSteps: {
                    orderBy: { step_order: 'asc' },
                    include: {
                        // Include approver details if needed
                    }
                },
                signature: true,
            },
        });
    }

    async findNextPendingStep(req_id) {
        return prisma.approvalStep.findFirst({
            where: {
                req_id,
                status: 'PENDING',
            },
            orderBy: { step_order: 'asc' },
        });
    }

    // Helper to find potential approvers by rank and branch
    async findApproversByRank(rank, branchId = null) {
        return prisma.user.findMany({
            where: {
                role: {
                    role_rank: rank,
                },
                ...(branchId && { branch_id: branchId }),
            },
            select: {
                user_id: true,
                full_name: true,
                role: true,
            },
            orderBy: { full_name: 'asc' },
        });
    }

    async findUserWithMeta(user_id) {
        return prisma.user.findUnique({
            where: { user_id },
            include: {
                role: true,
                thirdPartyMeta: {
                    include: { sponsor: { select: userSummarySelect } }
                }
            }
        });
    }

    async findByRequester(requester_id) {
        return prisma.requisition.findMany({
            where: { requester_id },
            include: { sku: true, approvalSteps: true },
            orderBy: { created_at: 'desc' }
        });
    }

    async findPendingByApprover(approver_id) {
        const pendingSteps = await prisma.approvalStep.findMany({
            where: { approver_id, status: 'PENDING' },
            include: { requisition: { include: { requester: { select: userSummarySelect }, sku: true } } }
        });

        const actualPending = [];
        for (const step of pendingSteps) {
            const nextStepAtRepo = await this.findNextPendingStep(step.req_id);
            if (nextStepAtRepo && nextStepAtRepo.step_id === step.step_id) {
                actualPending.push(step.requisition);
            }
        }
        return actualPending;
    }

    async findApprovedByBranch(branch_id) {
        return prisma.requisition.findMany({
            where: {
                status: 'APPROVED',
                requester: { branch_id }
            },
            include: { requester: { select: userSummarySelect }, sku: true }
        });
    }
}

export default new RequisitionRepository();
