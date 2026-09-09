import dispatchService from '../services/dispatchService.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { successResponse } from '../../../shared/utils/responses.js';

class DispatchController {
    verifyOtp = asyncHandler(async (req, res) => {
        const { req_id, otp, asset_id } = req.body;
        const result = await dispatchService.verifyOtpAndTransfer(req_id, otp, asset_id, req.user);
        successResponse(res, result, 'OTP verified and asset issued');
    });

    notify = asyncHandler(async (req, res) => {
        const { req_id } = req.body;
        const result = await dispatchService.notifyReadyForPickup(req_id, req.user);
        successResponse(res, result, 'Notification sent');
    });

    getGatePass = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const pass = await dispatchService.getGatePass(id);
        successResponse(res, pass, 'Gate Pass retrieved');
    });

    sign = asyncHandler(async (req, res) => {
        const { req_id, signature_blob } = req.body;
        const result = await dispatchService.captureSignature(req_id, signature_blob, req.user);
        successResponse(res, result, 'Signature captured successfully', 201);
    });
}

export default new DispatchController();
