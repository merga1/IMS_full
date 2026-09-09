import requisitionService from '../services/requisitionService.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { successResponse } from '../../../shared/utils/responses.js';

class RequisitionController {
    create = asyncHandler(async (req, res) => {
        const requisition = await requisitionService.createRequisition(req.body, req.user);
        successResponse(res, requisition, 'Requisition created successfully', 201);
    });

    myRequests = asyncHandler(async (req, res) => {
        const requests = await requisitionService.getMyRequests(req.user);
        successResponse(res, requests, 'Personal requests retrieved successfully');
    });

    pendingApprovals = asyncHandler(async (req, res) => {
        const approvals = await requisitionService.getPendingApprovals(req.user);
        successResponse(res, approvals, 'Pending approvals retrieved successfully');
    });

    action = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { action, reason } = req.body;
        const result = await requisitionService.processApprovalAction(id, req.user, action, reason);
        successResponse(res, result, `Requisition ${action.toLowerCase()}d successfully`);
    });

    approvedList = asyncHandler(async (req, res) => {
        const requests = await requisitionService.getApprovedRequestsByBranch(req.user);
        successResponse(res, requests, 'Approved requests for branch retrieved successfully');
    });

    getById = asyncHandler(async (req, res) => {
        // Potentially add a service method for getting a requisition by ID
        // For now, mirroring findById from repo in service if needed
        throw new Error('Not implemented');
    });
}

export default new RequisitionController();
