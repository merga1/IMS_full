import Joi from 'joi';

const uuid = Joi.string().uuid();

export const inventoryValidators = {
  branchId: Joi.object({ id: Joi.number().integer().positive().required() }),
  registerSku: Joi.object({
    sku_id: Joi.string().trim().min(1).max(50).required(),
    item_name: Joi.string().trim().min(1).max(255).required(),
    cat_id: Joi.number().integer().positive().required(),
    current_stock: Joi.number().integer().min(0).default(0),
    max_capacity: Joi.number().integer().min(0).optional().allow(null),
    threshold_qty: Joi.number().integer().min(0).required(),
    lifespan_months: Joi.number().integer().positive().optional().allow(null),
  }),
  transfer: Joi.object({
    asset_id: uuid.required(),
    from_loc_id: Joi.number().integer().positive().required(),
    to_loc_id: Joi.number().integer().positive().invalid(Joi.ref('from_loc_id')).required(),
    sender_sig: Joi.string().max(100000).optional().allow('', null),
  }),
  receive: Joi.object({
    pass_id: uuid.required(),
    receiver_sig: Joi.string().max(100000).optional().allow('', null),
  }),
  createRequisition: Joi.object({
    sku_id: Joi.string().trim().min(1).max(50).required(),
    quantity: Joi.number().integer().min(1).max(100000).default(1),
  }),
  approvalAction: Joi.object({
    action: Joi.string().valid('APPROVE', 'REJECT').required(),
    reason: Joi.string().trim().max(2000).when('action', {
      is: 'REJECT',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
  requestId: Joi.object({ req_id: uuid.required() }),
  verifyOtp: Joi.object({
    req_id: uuid.required(),
    otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
    asset_id: uuid.optional(),
  }),
  signature: Joi.object({
    req_id: uuid.required(),
    signature_blob: Joi.string().min(1).max(100000).required(),
  }),
  gatePassId: Joi.object({ id: uuid.required() }),
  incident: Joi.object({
    asset_id: uuid.optional(),
    sys_id: Joi.string().trim().max(100).optional(),
    incident_type: Joi.string().valid('DAMAGED', 'LOST').required(),
  }).xor('asset_id', 'sys_id'),
  incidentId: Joi.object({ id: Joi.number().integer().positive().required() }),
  resolveIncident: Joi.object({
    resolution: Joi.string().valid('REPAIRED', 'SCRAPPED').required(),
    notes: Joi.string().max(5000).optional().allow('', null),
  }),
  assetId: Joi.object({ id: uuid.required() }),
  procurementId: Joi.object({ id: uuid.required() }),
};

