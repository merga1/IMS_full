import { create } from 'zustand';

interface AdminState {
    isWizardOpen: boolean;
    setWizardOpen: (open: boolean) => void;
    // Metadata for "Dynamic" Branch management (Mock)
    knownBranches: string[];
    branchStructure: Record<string, { floors: { id: string; name: string; rooms: string[] }[] }>;
    addBranch: (name: string, structure: any) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    isWizardOpen: false,
    setWizardOpen: (open) => set({ isWizardOpen: open }),
    knownBranches: ['HQ', 'ARADA', 'BOLE', 'LIDETA', 'KIRKOS'],
    branchStructure: {},
    addBranch: (name, structure) => set((state) => ({
        knownBranches: [...state.knownBranches, name],
        branchStructure: { ...state.branchStructure, [name]: structure }
    }))
}));
