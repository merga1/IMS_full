import maintenanceService from '../services/maintenanceService.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { successResponse } from '../../../shared/utils/responses.js';

class MaintenanceController {
    report = asyncHandler(async (req, res) => {
        const incident = await maintenanceService.reportIncident(req.body, req.user, req.permissions);
        successResponse(res, incident, 'Incident reported successfully and clearance profile flagged', 201);
    });

    queue = asyncHandler(async (req, res) => {
        const queue = await maintenanceService.getQueue();
        successResponse(res, queue, 'Maintenance queue retrieved');
    });

    resolve = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await maintenanceService.resolveIncident(id, req.body, req.user);
        successResponse(res, result, 'Incident resolved and asset status updated');
    });

    scrap = asyncHandler(async (req, res) => {
        const { id } = req.params; // asset_id
        const result = await maintenanceService.scrapAsset(id, req.user);
        successResponse(res, result, 'Asset marked as SCRAPPED (By-passed lifespan)');
    });
}

export default new MaintenanceController();
