import inventoryService from '../services/inventoryService.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { successResponse } from '../../../shared/utils/responses.js';

class InventoryController {
  getSummary = asyncHandler(async (req, res) => {
    const summary = await inventoryService.getInventorySummary();
    successResponse(res, summary, 'Inventory summary retrieved successfully');
  });

  getByBranch = asyncHandler(async (req, res) => {
    const inventory = await inventoryService.getBranchInventory(req.params.id);
    successResponse(res, inventory, 'Branch inventory retrieved successfully');
  });

  register = asyncHandler(async (req, res) => {
    const sku = await inventoryService.registerSku(req.body, req.user);
    successResponse(res, sku, 'SKU registered successfully', 201);
  });

  transfer = asyncHandler(async (req, res) => {
    const gatePass = await inventoryService.initiateAssetTransfer(req.body, req.user);
    successResponse(res, gatePass, 'Asset transfer initiated and Gate Pass generated', 201);
  });

  receive = asyncHandler(async (req, res) => {
    const receipt = await inventoryService.receiveAsset(req.body, req.user);
    successResponse(res, receipt, 'Asset receipt confirmed and stock updated');
  });
}

export default new InventoryController();
