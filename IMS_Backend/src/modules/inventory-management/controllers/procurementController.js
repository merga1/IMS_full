import procurementService from '../services/procurementService.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { successResponse } from '../../../shared/utils/responses.js';

class ProcurementController {
    buyRequest = asyncHandler(async (req, res) => {
        const { req_id } = req.body;
        const procurement = await procurementService.createBuyRequest(req_id, req.user);
        successResponse(res, procurement, 'Ask-to-Buy request initiated for GD approval', 201);
    });

    gdApprove = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await procurementService.gdApprove(id, req.user);
        successResponse(res, result, 'Procurement approved by General Director');
    });

    pending = asyncHandler(async (req, res) => {
        const requests = await procurementService.getPendingRequests();
        successResponse(res, requests, 'Pending procurement requests retrieved');
    });
}

export default new ProcurementController();
