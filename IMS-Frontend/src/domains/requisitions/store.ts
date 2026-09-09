import { create } from 'zustand';
import { Requisition, ApprovalStep, User, Role, Department, Team } from "@/shared/types";
import { useAuthStore } from "@/state/auth.store";
import { getDepartmentSector } from "@/shared/utils/sectorMapping";

interface RequestState {
    requisitions: Requisition[];

    // Actions
    createRequest: (req: Omit<Requisition, 'id' | 'status' | 'otpHash' | 'createdAt' | 'approvalSteps'>) => void;
    approveRequest: (reqId: string, approverId: string, role: Role) => void;
    rejectRequest: (reqId: string, approverId: string, comment: string) => void;
    getPendingForUser: (user: User) => Requisition[];
    verifyOTP: (reqId: string, otpInput: string) => boolean;
    completeDispatch: (reqId: string, signature: string, serialNumbers?: string[], dispatchedBy?: string) => void;
}

// Helper to generate Approval Chain with Sector-Based DGD Routing
const generateApprovalChain = (requesterRole: Role, requesterDepartment?: Department, _requesterTeam?: Team): ApprovalStep[] => {
    const steps: ApprovalStep[] = [];

    // Determine which DGD role based on department
    let dgdRole: 'DGD_SERVICE' | 'DGD_DIGITALIZATION' = 'DGD_SERVICE';
    let sector: 'SERVICE' | 'DIGITALIZATION' | undefined;

    if (requesterDepartment) {
        sector = getDepartmentSector(requesterDepartment);
        dgdRole = sector === 'SERVICE' ? 'DGD_SERVICE' : 'DGD_DIGITALIZATION';
    }

    // "The system enforces the Addis MESOB hierarchical structure."
    // Employee -> Team Leader -> Director -> Sector-Specific DGD

    if (requesterRole === 'EMPLOYEE') {
        steps.push({ rank: 1, role: 'TEAM_LEADER', status: 'PENDING' });
        steps.push({ rank: 2, role: 'DIRECTOR', department: requesterDepartment, status: 'PENDING' });
        steps.push({ rank: 3, role: dgdRole, sector, status: 'PENDING' });
    } else if (requesterRole === 'THIRD_PARTY') {
        // Third-Party: Sponsor (Team Leader) -> Sector-Specific DGD
        steps.push({ rank: 1, role: 'TEAM_LEADER', status: 'PENDING' }); // Sponsor
        steps.push({ rank: 2, role: dgdRole, sector, status: 'PENDING' });
    } else if (requesterRole === 'TEAM_LEADER') {
        steps.push({ rank: 1, role: 'DIRECTOR', department: requesterDepartment, status: 'PENDING' });
        steps.push({ rank: 2, role: dgdRole, sector, status: 'PENDING' });
    } else if (requesterRole === 'DIRECTOR') {
        // "If a Director requests an item, the chain automatically starts at the DGD level"
        steps.push({ rank: 1, role: dgdRole, sector, status: 'PENDING' });
    }

    return steps;
};

// Mock requests
const MOCK_REQUESTS: Requisition[] = [
    // 1. Pending Team Leader Approval (Almaz requests)
    {
        id: 'REQ-001',
        requesterId: 'u7', // Almaz (Employee)
        requesterName: 'Almaz Ayana',
        requesterDepartment: 'IT',
        requesterTeam: 'SOFTWARE_DEV',
        type: 'STANDARD',
        items: [{ skuId: 'IT-LAP-01', name: 'MacBook Pro M3', quantity: 1 }],
        justification: 'Current laptop battery failed.',
        status: 'PENDING_TL',
        otpHash: 'INVALID_HASH',
        createdAt: '2025-10-25',
        approvalSteps: [
            { rank: 1, role: 'TEAM_LEADER', status: 'PENDING' },
            { rank: 2, role: 'DIRECTOR', department: 'IT', status: 'PENDING' },
            { rank: 3, role: 'DGD_DIGITALIZATION', sector: 'DIGITALIZATION', status: 'PENDING' }
        ]
    },
    {
        id: 'REQ-001',
        requesterId: 'u7', // Almaz (Employee)
        requesterName: 'Almaz Ayana',
        requesterDepartment: 'IT',
        type: 'STANDARD',
        items: [{ skuId: 'IT-MON-27', name: 'Dell UltraSharp 27"', quantity: 1 }],
        justification: 'Need second screen for coding.',
        status: 'PENDING_TL',
        otpHash: 'mock-hash',
        createdAt: '2024-03-10',
        approvalSteps: [
            { rank: 1, role: 'TEAM_LEADER', status: 'PENDING' },
            { rank: 2, role: 'DIRECTOR', department: 'IT', status: 'PENDING' },
            { rank: 3, role: 'DGD_DIGITALIZATION', sector: 'DIGITALIZATION', status: 'PENDING' }
        ]
    },
    // Demo User Requests (Civil Reg Staff)
    {
        id: 'REQ-DEMO-01', requesterId: 'st-econ-1', requesterName: 'Civil Reg Staff', requesterDepartment: 'ECONOMY_SERVICES', requesterTeam: 'CIVIL_REGISTRATION', type: 'STANDARD',
        items: [{ skuId: 'STAT-PAP-01', name: 'A4 Paper Ream', quantity: 5 }],
        justification: 'Monthly supply for certificates.',
        status: 'PENDING_TL', otpHash: 'demo', createdAt: '2024-03-14',
        approvalSteps: [{ rank: 1, role: 'TEAM_LEADER', status: 'PENDING' }, { rank: 2, role: 'DIRECTOR', status: 'PENDING' }, { rank: 3, role: 'DGD_SERVICE', status: 'PENDING' }]
    },
    {
        id: 'REQ-DEMO-02', requesterId: 'st-econ-1', requesterName: 'Civil Reg Staff', requesterDepartment: 'ECONOMY_SERVICES', requesterTeam: 'CIVIL_REGISTRATION', type: 'STANDARD',
        items: [{ skuId: 'UNI-MESOB-L', name: 'Mesob Field Uniform', quantity: 2 }],
        justification: 'Replacement for worn out gear.',
        status: 'APPROVED', otpHash: 'demo', createdAt: '2024-03-12',
        approvalSteps: [{ rank: 1, role: 'TEAM_LEADER', status: 'APPROVED' }, { rank: 2, role: 'DIRECTOR', status: 'APPROVED' }, { rank: 3, role: 'DGD_SERVICE', status: 'APPROVED' }]
    },
    {
        id: 'REQ-DEMO-03', requesterId: 'st-econ-1', requesterName: 'Civil Reg Staff', requesterDepartment: 'ECONOMY_SERVICES', requesterTeam: 'CIVIL_REGISTRATION', type: 'STANDARD',
        items: [{ skuId: 'IT-LAP-01', name: 'MacBook Pro M3', quantity: 1 }],
        justification: 'Upgrade for mobile registration unit.',
        status: 'REJECTED', otpHash: 'demo', createdAt: '2024-03-01',
        approvalSteps: [
            { rank: 1, role: 'TEAM_LEADER', status: 'APPROVED', comments: 'Endorsed for field work.' },
            { rank: 2, role: 'DIRECTOR', status: 'REJECTED', comments: 'Budget freeze on new laptops. Use existing desktop.' },
            { rank: 3, role: 'DGD_SERVICE', status: 'SKIPPED' }
        ]
    },
    {
        id: 'REQ-002',
        requesterId: 'u4', // Tirunesh (TL)
        requesterName: 'Tirunesh Dibaba',
        requesterDepartment: 'LAND_MANAGEMENT',
        requesterTeam: 'LAND_TENURE',
        type: 'STANDARD',
        items: [{ skuId: 'FURN-CH-02', name: 'Ergonomic Chair', quantity: 2 }],
        justification: 'New staff joining next week.',
        status: 'PENDING_DIR',
        otpHash: 'INVALID',
        createdAt: '2025-10-26',
        approvalSteps: [
            { rank: 1, role: 'DIRECTOR', department: 'LAND_MANAGEMENT', status: 'PENDING' },
            { rank: 2, role: 'DGD_SERVICE', sector: 'SERVICE', status: 'PENDING' },
        ]
    },
    {
        id: 'REQ-003',
        requesterId: 'u2',
        requesterName: 'Haile Gebrselassie',
        requesterDepartment: 'BRANCH_OPERATIONS',
        type: 'STANDARD',
        items: [{ skuId: 'STAT-PAP-01', name: 'A4 Paper Ream', quantity: 5 }],
        justification: 'Board meeting supplies',
        status: 'APPROVED',
        otpHash: '123456',
        createdAt: '2025-10-20',
        approvalSteps: [
            { rank: 1, role: 'GD', status: 'APPROVED', approverId: 'u1', timestamp: '2025-10-21' }
        ]
    },
    {
        id: 'REQ-004',
        requesterId: 'u7',
        requesterName: 'Almaz Ayana',
        requesterDepartment: 'IT',
        requesterTeam: 'SOFTWARE_DEV',
        type: 'STANDARD',
        items: [{ skuId: 'V-TRK-001', name: 'Isuzu NPR Truck', quantity: 1 }],
        justification: 'Personal move',
        status: 'REJECTED',
        otpHash: 'INVALID',
        createdAt: '2025-10-15',
        approvalSteps: [
            { rank: 1, role: 'TEAM_LEADER', status: 'REJECTED', approverId: 'u4', timestamp: '2025-10-16', comments: "Company assets are for official use only." }
        ]
    },
    {
        id: 'REQ-EXT-005',
        requesterId: 'u8',
        requesterName: 'Kenenisa Bekele',
        type: 'THIRD_PARTY',
        items: [{ skuId: 'UNI-MESOB-L', name: 'Mesob Field Uniform (L)', quantity: 50 }],
        justification: 'Field operation partnership',
        status: 'PENDING_DGD',
        otpHash: 'INVALID',
        createdAt: '2025-10-27',
        approvalSteps: [
            { rank: 1, role: 'TEAM_LEADER', status: 'APPROVED', approverId: 'u4', timestamp: '2025-10-27' }, // Sponsored by TL
            { rank: 2, role: 'DGD_SERVICE', sector: 'SERVICE', status: 'PENDING' }
        ]
    }
];

export const useRequestStore = create<RequestState>((set, get) => ({
    requisitions: MOCK_REQUESTS,

    createRequest: (reqData) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return;

        const newReq: Requisition = {
            id: `REQ-${Math.floor(Math.random() * 10000)}`,
            ...reqData,
            requesterDepartment: currentUser.department,
            requesterTeam: currentUser.team,
            status: 'PENDING_TL',
            otpHash: Math.random().toString(36).substring(7).toUpperCase(),
            createdAt: new Date().toISOString().split('T')[0],
            approvalSteps: generateApprovalChain(currentUser.role, currentUser.department, currentUser.team)
        };
        if (newReq.approvalSteps.length > 0) {
            const firstRole = newReq.approvalSteps[0].role;
            if (firstRole === 'TEAM_LEADER') newReq.status = 'PENDING_TL';
            else if (firstRole === 'DIRECTOR') newReq.status = 'PENDING_DIR';
            else if (firstRole === 'DGD_SERVICE' || firstRole === 'DGD_DIGITALIZATION') newReq.status = 'PENDING_DGD';
        }

        set((state) => ({ requisitions: [newReq, ...state.requisitions] }));
    },

    approveRequest: (reqId, approverId, role) => set((state) => {
        return {
            requisitions: state.requisitions.map(req => {
                if (req.id !== reqId) return req;
                const stepIndex = req.approvalSteps.findIndex(s => s.role === role && s.status === 'PENDING');
                if (stepIndex === -1) return req;

                const updatedSteps = [...req.approvalSteps];
                updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], status: 'APPROVED', approverId, timestamp: new Date().toISOString() };

                // Determine next status
                let nextStatus = req.status;
                if (stepIndex < req.approvalSteps.length - 1) {
                    // Move to next level
                    const nextRole = req.approvalSteps[stepIndex + 1].role;
                    if (nextRole === 'DIRECTOR') nextStatus = 'PENDING_DIR';
                    else if (nextRole === 'DGD_SERVICE' || nextRole === 'DGD_DIGITALIZATION') nextStatus = 'PENDING_DGD';
                } else {
                    // Final approval
                    nextStatus = 'APPROVED';
                }

                return { ...req, approvalSteps: updatedSteps, status: nextStatus };
            })
        };
    }),

    rejectRequest: (reqId, _approverId) => set((state) => ({
        requisitions: state.requisitions.map(req =>
            req.id === reqId ? { ...req, status: 'REJECTED' } : req
        )
    })),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPendingForUser: (user) => {
        const all = get().requisitions;
        // Filter based on what this user needs to approve
        return all.filter(req => {
            // If I am a TL, I see 'PENDING_TL'.
            if (req.status === 'PENDING_TL' && user.role === 'TEAM_LEADER') {
                // Strict Team-level filtering: A TL only sees requests from their Team
                if (user.team) {
                    return req.requesterTeam === user.team;
                }
                // Fallback for Dept if Team not set (though implementation requires Team)
                return req.requesterDepartment === user.department;
            }
            if (req.status === 'PENDING_DIR' && user.role === 'DIRECTOR') {
                // Director MUST strictly see only their Department's requests
                return req.requesterDepartment === user.department;
            }
            if (req.status === 'PENDING_DGD' && (user.role === 'DGD_SERVICE' || user.role === 'DGD_DIGITALIZATION')) {
                // Sector-based filtering: only show requests for their sector
                const currentStep = req.approvalSteps.find(s => s.status === 'PENDING');
                if (currentStep && currentStep.sector) {
                    return currentStep.sector === user.sector;
                }
                return true; // Fallback if no sector specified
            }
            if (req.status === 'PENDING_GD' && user.role === 'GD') return true;
            return false;
        });
    },

    verifyOTP: (reqId, otpInput) => {
        const req = get().requisitions.find(r => r.id === reqId);
        if (!req) return false;
        return req.status === 'APPROVED' && otpInput.length === 6;
    },

    completeDispatch: (reqId, signature, serialNumbers, dispatchedBy) => {
        set((state) => ({
            requisitions: state.requisitions.map(req =>
                req.id === reqId
                    ? {
                        ...req,
                        status: 'DISPATCHED' as any,
                        signature,
                        serialNumbersIssued: serialNumbers,
                        dispatchedAt: new Date().toISOString(),
                        dispatchedBy
                    }
                    : req
            )
        }));
    }
}));
