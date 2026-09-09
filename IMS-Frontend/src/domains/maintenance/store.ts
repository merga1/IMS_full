import { create } from 'zustand';

export type IncidentType = 'DAMAGE' | 'LOSS' | 'MALFUNCTION' | 'MAINTENANCE_REQ';
export type IncidentStatus = 'REPORTED' | 'ASSIGNED' | 'In Progress' | 'READY_FOR_PICKUP' | 'RESOLVED' | 'RETIRED_ASSET';
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
    id: string;
    assetId: string;
    assetName: string;
    reporterId: string;
    reporterName: string;
    type: IncidentType;
    description: string;
    status: IncidentStatus;
    priority: IncidentPriority;
    dateReported: string;

    // Technical Fields
    assignedTo?: string; // Technician ID
    technicalNotes?: string;
    partsUsed?: string[];
    resolution?: string;
    resolvedAt?: string;

    // New Maintenance Fields
    warrantyStatus?: 'Valid' | 'Expired';
    healthScore?: number; // 0-100
    handoverOtp?: string;
    // Location
    branch?: string; // e.g. 'HQ', 'ARADA'
}

interface IncidentState {
    incidents: Incident[];
    reportIncident: (incident: Omit<Incident, 'id' | 'dateReported' | 'status' | 'priority'> & { priority?: IncidentPriority }) => void;
    updateIncident: (id: string, updates: Partial<Incident>) => void;
    getIncidentsByUser: (userId: string) => Incident[];
    getAllIncidents: () => Incident[];
    getQueueStats: (branch?: string) => { open: number, critical: number, avgTime: string };
}

// Mock Data
const MOCK_INCIDENTS: Incident[] = [
    {
        id: "TIC-882",
        assetId: "SN-992-AX",
        assetName: "Dell Precision 5000",
        reporterId: "u7",
        reporterName: "Almaz Ayana",
        type: "MALFUNCTION",
        description: "Screen flickering intermittently when charger is plugged in.",
        status: "ASSIGNED",
        priority: "CRITICAL",
        dateReported: "2024-03-01",
        assignedTo: "tech-1",
        branch: "ARADA"
    },
    {
        id: "TIC-885",
        assetId: "HQ-R201",
        assetName: "Desktop Workstation",
        reporterId: "bot",
        reporterName: "System Bot",
        type: "MAINTENANCE_REQ",
        description: "OS License Expired. Automatic flag.",
        status: "REPORTED",
        priority: "MEDIUM",
        dateReported: new Date().toISOString().split('T')[0],
        branch: "HQ"
    },
    {
        id: "TIC-889",
        assetId: "SN-002-XC",
        assetName: "HP EliteBook Gen 8",
        reporterId: "u5",
        reporterName: "John Consultant",
        type: "DAMAGE",
        description: "Broken screen hinge due to drop.",
        status: "RESOLVED",
        priority: "LOW",
        dateReported: "2024-02-15",
        resolution: "Replaced top chassis.",
        partsUsed: ["Top Cover Assembly", "Hinge Kit"],
        resolvedAt: "2024-02-18",
        branch: "ARADA"
    }
];

export const useIncidentStore = create<IncidentState>((set, get) => ({
    incidents: MOCK_INCIDENTS,

    reportIncident: (data) => set((state) => {
        const id = `TIC-${Math.floor(1000 + Math.random() * 9000)}`;
        // Calculate priority based on type if not provided (simple logic)
        const priority = data.priority || (data.type === 'LOSS' || data.type === 'MALFUNCTION' ? 'HIGH' : 'MEDIUM');

        return {
            incidents: [{
                ...data,
                id,
                status: 'REPORTED',
                priority,
                dateReported: new Date().toISOString().split('T')[0],
            }, ...state.incidents]
        };
    }),

    updateIncident: (id, updates) => set((state) => ({
        incidents: state.incidents.map(inc =>
            inc.id === id ? { ...inc, ...updates } : inc
        )
    })),

    getIncidentsByUser: (userId) => get().incidents.filter(i => i.reporterId === userId),

    getAllIncidents: () => get().incidents,

    getQueueStats: (branch) => {
        const incidents = get().incidents;
        // Filter by branch if provided
        const relevant = branch ? incidents.filter(i => i.branch === branch) : incidents;

        const open = relevant.filter(i => i.status !== 'RESOLVED' && i.status !== 'RETIRED_ASSET').length;
        const critical = relevant.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
        return { open, critical, avgTime: '4.2 hrs' };
    }
}));

