import { Router } from 'express';

import authentication from '../../../shared/middleware/authentication.js';
import inventoryController from '../controllers/inventoryController.js';
import requisitionController from '../controllers/requisitionController.js';
import dispatchController from '../controllers/dispatchController.js';
import maintenanceController from '../controllers/maintenanceController.js';
import procurementController from '../controllers/procurementController.js';
import { requirePermission } from '../../../shared/middleware/authorization.js';
import { validate } from '../../../shared/middleware/validation.js';
import { inventoryValidators as v } from '../validators.js';

const { authenticate } = authentication;
const router = Router();

// Protect all inventory routes with authentication
router.use(authenticate);

// Inventory & Branch Management Routes
router.get('/inventory/summary', requirePermission('INVENTORY.READ'), inventoryController.getSummary);
router.get('/inventory/branch/:id', requirePermission('INVENTORY.READ'), validate(v.branchId, 'params'), inventoryController.getByBranch);
router.post('/inventory/register', requirePermission('INVENTORY.UPDATE'), validate(v.registerSku), inventoryController.register);
router.post('/inventory/transfer', requirePermission('INVENTORY.UPDATE'), validate(v.transfer), inventoryController.transfer);
router.put('/inventory/receive', requirePermission('INVENTORY.UPDATE'), validate(v.receive), inventoryController.receive);

// Requisition & Approval Engine Routes
router.post('/requests/ask', requirePermission('REQUISITIONS.CREATE'), validate(v.createRequisition), requisitionController.create);
router.get('/requests/my-requests', requirePermission('REQUISITIONS.READ'), requisitionController.myRequests);
router.get('/requests/approved-list', requirePermission('REQUISITIONS.READ'), requisitionController.approvedList);

router.get('/approvals/pending', requirePermission('REQUISITIONS.APPROVE'), requisitionController.pendingApprovals);
router.post('/approvals/:id/action', requirePermission('REQUISITIONS.APPROVE'), validate(v.gatePassId, 'params'), validate(v.approvalAction), requisitionController.action);

// Secure Handover & Verification Routes
router.post('/dispatch/verify-otp', requirePermission('REQUISITIONS.FULFILL'), validate(v.verifyOtp), dispatchController.verifyOtp);
router.post('/dispatch/notify', requirePermission('REQUISITIONS.FULFILL'), validate(v.requestId), dispatchController.notify);
router.get('/dispatch/gate-pass/:id', requirePermission('REQUISITIONS.FULFILL'), validate(v.gatePassId, 'params'), dispatchController.getGatePass);
router.post('/dispatch/sign', requirePermission('REQUISITIONS.FULFILL'), validate(v.signature), dispatchController.sign);

// Procurement ("Ask-to-Buy") Routes
router.post('/procurement/buy-request', requirePermission('REQUISITIONS.FULFILL'), validate(v.requestId), procurementController.buyRequest);
router.post('/procurement/gd-approve/:id', requirePermission('REQUISITIONS.APPROVE'), validate(v.procurementId, 'params'), procurementController.gdApprove);
router.get('/procurement/pending', requirePermission('REQUISITIONS.APPROVE'), procurementController.pending);

// Incident & Maintenance Routes
router.post('/incidents/report', requirePermission('INVENTORY.READ'), validate(v.incident), maintenanceController.report);
router.get('/maintenance/queue', requirePermission('INVENTORY.SCRAP'), maintenanceController.queue);
router.put('/maintenance/resolve/:id', requirePermission('INVENTORY.SCRAP'), validate(v.incidentId, 'params'), validate(v.resolveIncident), maintenanceController.resolve);
router.post('/maintenance/scrap/:id', requirePermission('INVENTORY.SCRAP'), validate(v.assetId, 'params'), maintenanceController.scrap);

export default router;
