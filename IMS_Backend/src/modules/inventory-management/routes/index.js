import { Router } from 'express';

import inventoryController from '../controllers/inventoryController.js';
import requisitionController from '../controllers/requisitionController.js';
import dispatchController from '../controllers/dispatchController.js';
import maintenanceController from '../controllers/maintananceController.js';
import procurementController from '../controllers/procementController.js';

const router = Router();

// Inventory Routes
// Inventory & Branch Management Routes
router.get('/inventory/summary', inventoryController.getSummary);
router.get('/inventory/branch/:id', inventoryController.getByBranch);
router.post('/inventory/register', inventoryController.register);
router.post('/inventory/transfer', inventoryController.transfer);
router.put('/inventory/receive', inventoryController.receive);

// Requisition & Approval Engine Routes
router.post('/requests/ask', requisitionController.create);
router.get('/requests/my-requests', requisitionController.myRequests);
router.get('/requests/approved-list', requisitionController.approvedList);

router.get('/approvals/pending', requisitionController.pendingApprovals);
router.post('/approvals/:id/action', requisitionController.action);

// Secure Handover & Verification Routes
router.post('/dispatch/verify-otp', dispatchController.verifyOtp);
router.post('/dispatch/notify', dispatchController.notify);
router.get('/dispatch/gate-pass/:id', dispatchController.getGatePass);
router.post('/dispatch/sign', dispatchController.sign);

// Procurement ("Ask-to-Buy") Routes
router.post('/procurement/buy-request', procurementController.buyRequest);
router.post('/procurement/gd-approve/:id', procurementController.gdApprove);
router.get('/procurement/pending', procurementController.pending);

// Incident & Maintenance Routes
router.post('/incidents/report', maintenanceController.report);
router.get('/maintenance/queue', maintenanceController.queue);
router.put('/maintenance/resolve/:id', maintenanceController.resolve);
router.post('/maintenance/scrap/:id', maintenanceController.scrap);

export default router;
