export type Role =
  | 'GD'
  | 'DGD_SERVICE'
  | 'DGD_DIGITALIZATION'
  | 'DIRECTOR'
  | 'TEAM_LEADER'
  | 'STOREKEEPER'
  | 'MAINTENANCE'
  | 'EMPLOYEE'
  | 'THIRD_PARTY'
  | 'SYSTEM_ADMIN';

export type Sector = 'SERVICE' | 'DIGITALIZATION';

export type Department =
  // Service Sector
  | 'LAND_MANAGEMENT'
  | 'TRANSPORT'
  | 'REVENUE'
  | 'SOCIAL_SERVICES'
  | 'BRANCH_OPERATIONS'
  | 'UNIVERSAL_SERVICES'
  | 'ECONOMY_SERVICES'
  | 'LAND_CONSTRUCTION'
  | 'TRANSPORT_HOUSING'
  // Digitalization Sector
  | 'IT'
  | 'SOFTWARE_DEVELOPMENT'
  | 'INFRASTRUCTURE'
  | 'SYSTEM_ADMINISTRATION'
  | 'ONE_CENTER_TECH'
  | 'DIGITAL_DATA'
  | 'ONE_CENTER_EXPANSION';

export type Branch = 'HQ' | 'ARADA' | 'BOLE' | 'LIDETA' | 'KIRKOS';
// Specific Teams under Directorates
export type Team =
  // Universal Services
  | 'UNIVERSAL_OPERATOR_SERVICE'
  | 'VOLUNTEER_SERVICE'
  // Economy Services
  | 'CIVIL_REGISTRATION'
  | 'REVENUE_SERVICES'
  | 'BUSINESS_SERVICES'
  | 'INVESTMENT_SERVICES'
  | 'EMPLOYMENT_SKILLS'
  | 'DOC_VERIFICATION'
  // Land & Construction
  | 'BUILDING_PERMIT'
  | 'LAND_DEVELOPMENT'
  | 'LAND_TENURE'
  | 'PLANNING_DEVELOPMENT'
  // Transport & Housing
  | 'TRAFFIC_MANAGEMENT'
  | 'DRIVER_VEHICLE'
  | 'HOUSING_DEVELOPMENT'
  | 'HOUSING_CORPORATION'
  // Digitalization
  | 'SOFTWARE_DEV'
  | 'NETWORK_INFRA'
  | 'CYBER_SECURITY'
  | 'TECH_TRAINING_MAINTENANCE';

export type UserType = 'EMPLOYEE' | 'THIRD_PARTY';

export interface User {
  id: string;
  faydaId: string;
  fullName: string;
  email: string;
  role: Role;
  rank: number; // 1=GD, 2=DGD, 3=Director, 4=TL, 5=Staff
  department?: Department; // The Directorate they belong to
  team?: Team; // The specific Team they belong to (for TLs and Staff)
  sector?: Sector;
  branch?: Branch;
  userType: UserType;
  supervisorId?: string; // For approval chain
  sponsorId?: string; // For Third Party
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
}

export type AssetStatus =
  | 'IN_STORE'
  | 'ISSUED'
  | 'MAINTENANCE'
  | 'DEPRECIATED'
  | 'SCRAPPED'
  | 'PENDING_APPROVAL';

export type AssetCategory =
  | 'SERIALIZED'
  | 'SKU'
  | 'STATIONARY'
  | 'CONSUMABLE'
  | 'DIGITAL';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory; // Technical Classification (Serialized vs SKU)
  productCategory?: string; // e.g. "Electronics", "Furniture"
  serialNumber?: string;
  sku?: string;
  status: AssetStatus;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  purchaseDate: string;
  value: number;
  holderId?: string;
  locationId?: string;
  branch: Branch;
  floor?: string; // [NEW] Floor location (e.g., "Floor 1")
  room?: string; // [NEW] Room location (e.g., "Room 101")
  batchId?: string; // [NEW] Vendor batch tracking
  invoiceNumber?: string; // [NEW]
  warrantyExpiration?: string; // [NEW]
  lifespanMonths?: number;
  model?: string;
}

export type RequestStatus =
  | 'DRAFT'
  | 'PENDING_TL'
  | 'PENDING_DIR'
  | 'PENDING_DGD'
  | 'PENDING_GD' // For Ask-to-Buy
  | 'APPROVED'
  | 'REJECTED'
  | 'FULFILLED'
  | 'DISPATCHED'
  | 'PENDING_INFO';

export interface Requisition {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterDepartment?: Department; // NEW: For simple filtering
  requesterTeam?: Team;
  type: 'STANDARD' | 'ASK_TO_BUY' | 'THIRD_PARTY';
  items: RequisitionItem[];
  justification: string;
  status: RequestStatus;
  otpHash: string;
  createdAt: string;
  approvalSteps: ApprovalStep[];
  signature?: string;
  serialNumbersIssued?: string[];
  dispatchedAt?: string;
  dispatchedBy?: string;
}

export interface RequisitionItem {
  skuId: string;
  name: string;
  quantity: number;
  specification?: string;
}

export interface ApprovalStep {
  rank: number;
  role: Role;
  sector?: Sector; // NEW: For DGD sector routing
  department?: Department; // NEW: For department-specific approvals
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  approverId?: string;
  timestamp?: string;
  comments?: string;
}

export interface SKUItem {
  id: string; // SKU ID (e.g., "UNI-MESOB-L")
  name: string;
  category: AssetCategory; // Technical Classification
  productCategory?: string; // e.g. "Electronics", "Furniture"
  currentStock: number;
  thresholdQty: number; // 10% rule
  unit: string; // e.g., "pcs", "box", "ream"
  description?: string;
  isStationary?: boolean; // [NEW] True if item requires room placement (fixed/semi-fixed)
  subCategory?: 'FIXED' | 'MOVEABLE'; // [NEW]
}

export interface GatePass {
  id: string;
  requisitionId: string;
  qrCode: string;              // QR code data
  issuedAt: string;
  issuedBy: string;            // Storekeeper ID
  employeeId: string;
  employeeName: string;
  items: {
    name: string;
    quantity: number;
    serialNumbers?: string[];
  }[];
  status: 'ACTIVE' | 'SCANNED' | 'EXPIRED';
}

export interface StockMovement {
  id: string;
  type: 'INTAKE' | 'DISPATCH' | 'TRANSFER' | 'ADJUSTMENT';
  skuId: string;
  quantity: number;
  fromLocation?: string;       // For transfers
  toLocation?: string;
  performedBy: string;         // Storekeeper ID
  timestamp: string;
  notes?: string;
  batchId?: string;
  vendor?: string;
  invoiceNumber?: string; // [NEW]
  status?: 'COMPLETED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED'; // New field for transfer workflow
}
