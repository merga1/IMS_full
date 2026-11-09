// Reusable safe projection for user relations returned by API queries.
export const userSummarySelect = {
  user_id: true,
  fayda_id: true,
  full_name: true,
  email: true,
  role_id: true,
  supervisor_id: true,
  user_type: true,
  branch_id: true,
  is_suspended_from_clearance: true,
  role: { select: { role_id: true, role_name: true, role_rank: true } },
  branch: { select: { branch_id: true, branch_name: true, type: true, location: true } },
};

// Asset API projections deliberately omit software license keys.
export const assetSummarySelect = {
  asset_id: true,
  sku_id: true,
  serial_no: true,
  batch_id: true,
  version: true,
  holder_id: true,
  location_id: true,
  status: true,
  issued_at: true,
  health_card_notes: true,
  sku: { include: { category: true } },
  holder: { select: userSummarySelect },
  location: true,
};

