import { create } from 'zustand';

export type SystemStatus = 'COMPLIANT' | 'VULNERABLE' | 'OFFLINE' | 'DEPRECATED';

export interface DigitalSystem {
    id: string;
    name: string;
    version: string;
    targetVersion: string;
    complianceRate: number; // percentage
    lastAuditDate: string;
    lastAuditor: string;
    status: SystemStatus;
    type: 'CORE' | 'SAAS' | 'SECURITY';
}

export interface License {
    id: string;
    name: string;
    totalSeats: number;
    usedSeats: number;
    expiryDate: string; // ISO date
    cost: number;
    riskScore: number; // 0-100
    vendor: string;
}

export interface BranchHealth {
    branchId: string;
    branchName: string;
    versionStatus: 'GREEN' | 'RED' | 'YELLOW';
    securityScore: number;
    lastPulse: string;
    activeIncidents: number;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    target: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

interface DigitalState {
    systems: DigitalSystem[];
    licenses: License[];
    branchHealth: BranchHealth[];
    auditLogs: AuditLog[];
    digitalAssets: DigitalAsset[];

    // Actions
    runDigitalPulse: () => void; // Simulates a scan
    resolveVulnerability: (systemId: string) => void;
    registerDigitalAsset: (asset: DigitalAsset) => void;
}

export type DigitalAssetType = 'HARDWARE' | 'DISPLAY' | 'SOFTWARE';

export interface DigitalAsset {
    id: string;
    type: DigitalAssetType;
    name: string;
    registeredAt: string;

    // For HARDWARE (Laptops, Computers)
    assetId?: string; // Link to physical inventory
    os?: string;
    ram?: string;
    storage?: string;
    processor?: string;
    installedApps?: Array<{ name: string; version: string }>;

    // For DISPLAY (Queue Management Screens, Digital Signage)
    displayType?: string; // e.g., "Queue Management", "Digital Signage"
    resolution?: string;
    location?: string;
    connectedTo?: string; // What system it's connected to

    // For SOFTWARE (HRMS, IMS, QMS - Server Applications)
    systemType?: string; // e.g., "HRMS", "Queue Management System"
    version?: string;
    ipAddress?: string;
    serverName?: string;
    port?: string;
    database?: string;
    deploymentType?: string; // e.g., "On-Premise", "Cloud"
}

// MOCK DATA
const MOCK_SYSTEMS: DigitalSystem[] = [
    { id: 'SYS-001', name: 'One-CIS Core', version: 'v4.5.0', targetVersion: 'v4.5.1', complianceRate: 98, lastAuditDate: '2024-03-10', lastAuditor: 'FIN-1001B', status: 'COMPLIANT', type: 'CORE' },
    { id: 'SYS-002', name: 'Fayda Identity API', version: 'v2.1.0', targetVersion: 'v2.1.0', complianceRate: 100, lastAuditDate: '2024-03-12', lastAuditor: 'FIN-TL-DIGI-3', status: 'COMPLIANT', type: 'CORE' },
    { id: 'SYS-003', name: 'Adobe Creative Cloud', version: 'v2024.1', targetVersion: 'v2024.2', complianceRate: 85, lastAuditDate: '2024-02-28', lastAuditor: 'FIN-1001B', status: 'VULNERABLE', type: 'SAAS' },
    { id: 'SYS-004', name: 'McAfee Enterprise', version: 'v8.8', targetVersion: 'v9.0', complianceRate: 92, lastAuditDate: '2024-03-01', lastAuditor: 'AUTO-BOT', status: 'COMPLIANT', type: 'SECURITY' },
    { id: 'SYS-005', name: 'Legacy HRMS', version: 'v1.0.4', targetVersion: 'v2.0', complianceRate: 10, lastAuditDate: '2023-12-15', lastAuditor: 'FIN-1001B', status: 'DEPRECATED', type: 'CORE' },
];

const MOCK_LICENSES: License[] = [
    { id: 'LIC-MS-001', name: 'Microsoft 365 E5', totalSeats: 500, usedSeats: 480, expiryDate: '2024-06-30', cost: 150000, riskScore: 20, vendor: 'Microsoft' },
    { id: 'LIC-AD-002', name: 'Adobe Enterprise', totalSeats: 50, usedSeats: 12, expiryDate: '2024-12-31', cost: 45000, riskScore: 85, vendor: 'Adobe' }, // Risk: Over-licensing
    { id: 'LIC-ORA-003', name: 'Oracle DB Standard', totalSeats: 10, usedSeats: 12, expiryDate: '2024-05-15', cost: 80000, riskScore: 95, vendor: 'Oracle' }, // Risk: Under-licensing + Expiry
];

const BRANCHES = ['HQ', 'Arada', 'Bole', 'Lideta', 'Kirkos', 'Yeka', 'Nifas Silk', 'Akaki'];

const generateBranchHealth = (): BranchHealth[] => {
    return BRANCHES.map(name => ({
        branchId: name.toUpperCase().slice(0, 3),
        branchName: name,
        versionStatus: Math.random() > 0.8 ? 'RED' : 'GREEN',
        securityScore: Math.floor(70 + Math.random() * 30),
        lastPulse: 'Just now',
        activeIncidents: Math.floor(Math.random() * 3)
    }));
};

export const useDigitalStore = create<DigitalState>((set) => ({
    systems: MOCK_SYSTEMS,
    licenses: MOCK_LICENSES,
    branchHealth: generateBranchHealth(),
    digitalAssets: [],
    auditLogs: [
        { id: 'AUD-001', timestamp: '10:15 AM', action: 'Patch kb500 applied', target: 'Revenue Dept Laptops', severity: 'INFO' },
        { id: 'AUD-002', timestamp: 'Yesterday', action: 'License Expiry Warning', target: 'Oracle DB', severity: 'CRITICAL' },
        { id: 'AUD-003', timestamp: 'Yesterday', action: 'Legacy Protocol Detected', target: 'Transport Server 04', severity: 'WARNING' },
    ],

    runDigitalPulse: () => set((state) => ({
        branchHealth: state.branchHealth.map(b => ({
            ...b,
            versionStatus: Math.random() > 0.9 ? 'RED' : 'GREEN',
            lastPulse: 'Just now'
        })),
        auditLogs: [
            { id: `AUD-${Date.now()}`, timestamp: 'Just now', action: 'Digital Pulse Scan Completed', target: 'Global Network', severity: 'INFO' },
            ...state.auditLogs
        ]
    })),

    resolveVulnerability: (systemId) => set((state) => ({
        systems: state.systems.map(s => s.id === systemId ? { ...s, status: 'COMPLIANT', version: s.targetVersion, complianceRate: 100 } : s),
        auditLogs: [
            { id: `AUD-${Date.now()}`, timestamp: 'Just now', action: 'Manual Patch Enforced', target: systemId, severity: 'INFO' },
            ...state.auditLogs
        ]
    })),

    registerDigitalAsset: (asset) => set((state) => ({
        digitalAssets: [asset, ...state.digitalAssets],
        auditLogs: [
            { id: `AUD-${Date.now()}`, timestamp: 'Just now', action: 'New Digital Asset Registered', target: asset.name, severity: 'INFO' },
            ...state.auditLogs
        ]
    }))
}));
