import { create } from 'zustand';
import { Asset, SKUItem, AssetStatus, StockMovement } from "@/shared/types";

interface InventoryState {
    assets: Asset[]; // Individual serialized items (Laptops, etc.)
    skus: SKUItem[]; // Bulk items (Uniforms, Consumables)
    movements: StockMovement[]; // Audit trail of stock changes

    // Actions
    addAsset: (asset: Asset) => void;
    addAssets: (assets: Asset[]) => void; // Bulk add
    addSku: (sku: SKUItem) => void; // Add new SKU definition
    transferStock: (skuId: string, fromBranch: string, toBranch: string, quantity: number, specificAssetIds?: string[]) => void;
    receiveTransfer: (movementId: string) => void;
    updateAssetStatus: (assetId: string, status: AssetStatus, holderId?: string) => void;
    updateStock: (skuId: string, quantityChange: number) => void; // +ve for add, -ve for deduct
    checkThreshold: (skuId: string) => boolean; // Returns true if critical
    getAssetsByHolder: (holderId: string) => Asset[];
    recordMovement: (movement: StockMovement) => void;
    placeAsset: (assetId: string, floor: string, room: string) => void; // [NEW]
    registerVendorBatch: (batchData: any) => void; // [NEW]
}

// MOCK DATA INJECTION
const MOCK_SKUS: SKUItem[] = [
    // IT Peripherals
    { id: "IT-LAP-01", name: "MacBook Pro M3", category: "SERIALIZED", productCategory: "Electronics", currentStock: 12, thresholdQty: 5, unit: "pcs" },
    { id: "IT-MON-27", name: "Dell UltraSharp 27\"", category: "SERIALIZED", productCategory: "Electronics", currentStock: 8, thresholdQty: 3, unit: "pcs" },
    { id: "IT-KEY-MEC", name: "Keychron K2 Mechanical", category: "SKU", productCategory: "Electronics", currentStock: 15, thresholdQty: 5, unit: "pcs" },

    // Furniture
    { id: "FURN-CH-02", name: "Ergonomic Chair", category: "STATIONARY", productCategory: "Furniture", currentStock: 45, thresholdQty: 10, unit: "pcs" },
    { id: "FURN-DSK-ST", name: "Standing Desk Electric", category: "STATIONARY", productCategory: "Furniture", currentStock: 20, thresholdQty: 5, unit: "pcs" },

    // Consumables (Critical Stock Scenarios)
    { id: "STAT-PAP-01", name: "A4 Paper Ream (80gsm)", category: "CONSUMABLE", productCategory: "Office Supplies", currentStock: 8, thresholdQty: 20, unit: "ream" }, // Critical!
    { id: "STAT-PEN-BL", name: "Ballpoint Pen (Blue)", category: "CONSUMABLE", productCategory: "Office Supplies", currentStock: 200, thresholdQty: 50, unit: "box" },
    { id: "STAT-TNR-HP", name: "HP Laser Toner 85A", category: "CONSUMABLE", productCategory: "Office Supplies", currentStock: 2, thresholdQty: 5, unit: "cartridge" }, // Critical!

    // Digital
    { id: "SOFT-WIN-11", name: "Windows 11 Pro License", category: "DIGITAL", productCategory: "Software", currentStock: 50, thresholdQty: 10, unit: "license" },
    { id: "SOFT-ADOBE", name: "Adobe Creative Cloud", category: "DIGITAL", productCategory: "Software", currentStock: 5, thresholdQty: 2, unit: "sub" },

    // Uniforms
    { id: "UNI-MESOB-L", name: "Mesob Field Uniform (L)", category: "SKU", productCategory: "Apparel", currentStock: 100, thresholdQty: 15, unit: "set" },
    { id: "UNI-MESOB-M", name: "Mesob Field Uniform (M)", category: "SKU", productCategory: "Apparel", currentStock: 85, thresholdQty: 15, unit: "set" },
    { id: "UNI-BOOT-42", name: "Safety Boots (Size 42)", category: "SKU", productCategory: "Apparel", currentStock: 30, thresholdQty: 10, unit: "pair" },
];

const MOCK_ASSETS: Asset[] = [
    // Laptops
    { id: "A-1001", name: "MacBook Pro M3", sku: "IT-LAP-01", category: "SERIALIZED", serialNumber: "MBP-2024-001", status: "ISSUED", condition: "GOOD", purchaseDate: "2024-01-15", value: 3500, branch: "HQ", holderId: "u1" }, // General Director
    { id: "A-1002", name: "MacBook Pro M3", sku: "IT-LAP-01", category: "SERIALIZED", serialNumber: "MBP-2024-002", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-01-15", value: 3500, branch: "HQ" },
    { id: "A-1003", name: "Dell XPS 15", sku: "IT-LAP-01", category: "SERIALIZED", serialNumber: "XPS-2023-992", status: "ISSUED", condition: "FAIR", purchaseDate: "2023-05-10", value: 2400, branch: "BOLE", holderId: "u7" },

    // Vehicles
    { id: "V-TRK-001", name: "Isuzu NPR Truck", category: "SERIALIZED", serialNumber: "ETH-3-12345", status: "ISSUED", condition: "GOOD", purchaseDate: "2020-09-01", value: 45000, branch: "LIDETA", holderId: "u6" }, // Assigned to Driver
    { id: "V-VAN-004", name: "Toyota HiAce Van", category: "SERIALIZED", serialNumber: "ETH-3-98765", status: "MAINTENANCE", condition: "POOR", purchaseDate: "2021-03-12", value: 38000, branch: "HQ" }, // In Maintenance

    // Printers
    { id: "A-PRT-001", name: "HP Laser Jet Pro", category: "SERIALIZED", serialNumber: "PRT-2023-55", status: "ISSUED", condition: "FAIR", purchaseDate: "2023-01-10", value: 400, branch: "BOLE", holderId: "u4" },
    { id: "A-PRT-002", name: "Canon ImageRunner", category: "SERIALIZED", serialNumber: "CN-IR-2022", status: "SCRAPPED", condition: "POOR", purchaseDate: "2018-05-20", value: 0, branch: "HQ" },

    // Demo Staff Assets (Civil Reg Staff)
    { id: "A-DEMO-01", name: "Dell Latitude 5420", category: "SERIALIZED", serialNumber: "DL-5420-X82", status: "ISSUED", condition: "GOOD", purchaseDate: "2024-02-15", value: 1200, branch: "HQ", holderId: "st-econ-1" },
    { id: "A-DEMO-02", name: "Ergonomic Chair", category: "SKU", status: "MAINTENANCE", condition: "FAIR", purchaseDate: "2023-11-01", value: 300, branch: "HQ", holderId: "st-econ-1" },

    // ARADA Branch Assets (existing inventory)
    { id: "A-ARADA-001", name: "Dell XPS 15", category: "SERIALIZED", serialNumber: "XPS-2024-AR-001", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-01-10", value: 2400, branch: "ARADA" },
    { id: "A-ARADA-002", name: "Dell XPS 15", category: "SERIALIZED", serialNumber: "XPS-2024-AR-002", status: "ISSUED", condition: "GOOD", purchaseDate: "2024-01-10", value: 2400, branch: "ARADA", holderId: "u8" },
    { id: "A-ARADA-003", name: "Ergonomic Chair", category: "STATIONARY", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-01-05", value: 350, branch: "ARADA", floor: "2", room: "201" },
    { id: "A-ARADA-004", name: "Ergonomic Chair", category: "STATIONARY", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-01-05", value: 350, branch: "ARADA", floor: "2", room: "202" },
    { id: "A-ARADA-005", name: "Standing Desk Electric", category: "STATIONARY", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-01-05", value: 800, branch: "ARADA", floor: "2", room: "201" },
];

// Mock Stock Movements (including IN_TRANSIT transfers for branches to receive)
const MOCK_MOVEMENTS: StockMovement[] = [
    // IN_TRANSIT: Pending transfer to ARADA branch
    {
        id: "MOV-TRF-001",
        type: "TRANSFER",
        skuId: "IT-LAP-01",
        quantity: 3,
        fromLocation: "HQ",
        toLocation: "ARADA",
        performedBy: "HQ-ADMIN",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        notes: "Dispatch of 3 MacBook Pro M3 units to ARADA branch",
        status: "IN_TRANSIT"
    },
    {
        id: "MOV-TRF-002",
        type: "TRANSFER",
        skuId: "STAT-PAP-01",
        quantity: 50,
        fromLocation: "HQ",
        toLocation: "ARADA",
        performedBy: "HQ-ADMIN",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        notes: "Restock of A4 Paper to ARADA",
        status: "IN_TRANSIT"
    },
    // Completed transfer example
    {
        id: "MOV-TRF-003",
        type: "TRANSFER",
        skuId: "FURN-CH-02",
        quantity: 10,
        fromLocation: "HQ",
        toLocation: "BOLE",
        performedBy: "HQ-ADMIN",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        notes: "Office furniture dispatch to BOLE",
        status: "COMPLETED"
    },
];

export const useInventoryStore = create<InventoryState>((set, get) => ({
    assets: MOCK_ASSETS,
    skus: MOCK_SKUS,
    movements: MOCK_MOVEMENTS,

    addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),

    addAssets: (newAssets) => set((state) => ({ assets: [...state.assets, ...newAssets] })),

    addSku: (sku) => set((state) => ({ skus: [...state.skus, sku] })),

    transferStock: (skuId, fromBranch, toBranch, quantity, specificAssetIds) => set((state) => {
        const sku = state.skus.find(s => s.id === skuId);
        if (!sku) return state;

        // 1. Logic for moving ACTUAL ASSETS (Stationary & Serialized)
        // We need to find 'quantity' number of available assets at the source branch
        if (sku.category === 'STATIONARY' || sku.category === 'SERIALIZED') {
            const availableAssets = state.assets.filter(a =>
                a.sku === skuId &&
                a.branch === fromBranch &&
                a.status === 'IN_STORE'
            );

            let assetsToMove: Asset[] = [];

            if (specificAssetIds && specificAssetIds.length > 0) {
                // If specific assets are requested, use them (validation expected at caller or here)
                assetsToMove = availableAssets.filter(a => specificAssetIds.includes(a.id));

                if (assetsToMove.length !== quantity) {
                    console.warn(`Requested ${quantity} assets but found ${assetsToMove.length} matching IDs.`);
                    // specific logic: decide if we fail or proceed. For now, we trust the caller sends matching count or we adjust quantity?
                    // Let's rely on the found count.
                }
            } else {
                // Legacy/Auto behavior
                if (availableAssets.length < quantity) {
                    console.warn(`Not enough asset records found for ${sku.name} at ${fromBranch}`);
                }
                assetsToMove = availableAssets.slice(0, quantity);
            }
            const assetIdsToMove = new Set(assetsToMove.map(a => a.id));

            // Update the assets
            const updatedAssets = state.assets.map(asset => {
                if (assetIdsToMove.has(asset.id)) {
                    return {
                        ...asset,
                        branch: toBranch as any, // Cast to Branch type
                        status: 'IN_STORE' as AssetStatus, // Reset status at new branch (ready for placement/issue)
                        locationId: undefined, // Clear old location
                        floor: undefined,
                        room: undefined
                    };
                }
                return asset;
            });

            return {
                assets: updatedAssets,
                movements: [
                    {
                        id: `MOV-TRF-${Date.now()}`,
                        type: 'TRANSFER',
                        skuId,
                        quantity,
                        fromLocation: fromBranch,
                        toLocation: toBranch,
                        performedBy: 'HQ-ADMIN',
                        timestamp: new Date().toISOString(),
                        notes: `Transfer from ${fromBranch} to ${toBranch}`,
                        status: 'COMPLETED' // simplified for prototype
                    },
                    ...state.movements
                ]
            };
        }

        // 2. Fallback for Bulk SKU (just recording movement, assuming infinite pile or managed elsewhere)
        return {
            movements: [
                {
                    id: `MOV-TRF-${Date.now()}`,
                    type: 'TRANSFER',
                    skuId,
                    quantity,
                    fromLocation: fromBranch,
                    toLocation: toBranch,
                    performedBy: 'HQ-ADMIN', // context usually handles this
                    timestamp: new Date().toISOString(),
                    notes: `Transfer from ${fromBranch} to ${toBranch}`,
                    status: 'IN_TRANSIT'
                },
                ...state.movements
            ]
        };
    }),

    receiveTransfer: (movementId) => set((state) => ({
        movements: state.movements.map(m =>
            m.id === movementId
                ? { ...m, status: 'RECEIVED', notes: m.notes + ' (Received)' }
                : m
        )
    })),

    updateAssetStatus: (assetId, status, holderId) => set((state) => ({
        assets: state.assets.map(a => a.id === assetId ? { ...a, status, holderId: holderId || a.holderId } : a)
    })),

    updateStock: (skuId, quantityChange) => set((state) => ({
        skus: state.skus.map(s => s.id === skuId ? { ...s, currentStock: s.currentStock + quantityChange } : s)
    })),

    checkThreshold: (skuId) => {
        const item = get().skus.find(s => s.id === skuId);
        if (!item) return false;
        return item.currentStock <= item.thresholdQty;
    },

    placeAsset: (assetId: string, floor: string, room: string) => set((state) => ({
        assets: state.assets.map(a =>
            a.id === assetId
                ? { ...a, floor, room, status: 'ISSUED', locationId: `${floor}-${room}` }
                : a
        )
    })),

    registerVendorBatch: (_batchData: any) => set((state) => {
        // Mock implementation for bulk registration
        // In reality, this would create multiple Asset entries
        console.log("Registered batch:", _batchData);
        return state;
    }),

    getAssetsByHolder: (holderId) => {
        return get().assets.filter(a => a.holderId === holderId);
    },

    recordMovement: (movement) => set((state) => ({ movements: [movement, ...state.movements] }))
}));

// MOCK DATA EXTENSION FOR STATIONARY ITEMS
MOCK_ASSETS.push(
    // --- BRANCH: BOLE (For Branch Storekeeper Testing) ---
    // 1. Unassigned Assets (For 'Stationary Assignment' Page)
    { id: "BOLE-CH-NEW-01", name: "Mesh Ergonomic Chair", category: "STATIONARY", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-02-01", value: 200, branch: "BOLE", batchId: "B-2024-001" },
    { id: "BOLE-CH-NEW-02", name: "Mesh Ergonomic Chair", category: "STATIONARY", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-02-01", value: 200, branch: "BOLE", batchId: "B-2024-001" },
    { id: "BOLE-CAB-01", name: "Steel Filing Cabinet", category: "STATIONARY", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-02-01", value: 350, branch: "BOLE", batchId: "B-2024-001" },

    // 2. Placed Assets (For 'Floor Map' & 'Local Transfer' Pages)
    { id: "BOLE-CONF-TBL", name: "Mahogany Conference Table", category: "STATIONARY", status: "ISSUED", condition: "GOOD", purchaseDate: "2023-06-15", value: 1200, branch: "BOLE", floor: "Floor 2", room: "Room 202 (Meeting Room)", locationId: "F2-R202" },
    { id: "BOLE-PRT-SHARED", name: "Xerox WorkCentre A3", category: "STATIONARY", status: "ISSUED", condition: "GOOD", purchaseDate: "2023-08-10", value: 2500, branch: "BOLE", floor: "Floor 1", room: "Room 101 (Reception)", locationId: "F1-R101" },
    { id: "BOLE-DESK-EXEC", name: "L-Shaped Executive Desk", category: "STATIONARY", status: "ISSUED", condition: "GOOD", purchaseDate: "2023-01-20", value: 800, branch: "BOLE", floor: "Floor 3", room: "Room 301 (Director Office)", locationId: "F3-R301" },

    // --- BRANCH: HQ (For HQ Storekeeper Testing) ---
    // 1. Central Stock (For 'Inter-Branch Dispatch')
    { id: "HQ-LAPT-POOL-01", name: "Dell Latitude 5540", sku: "IT-LAP-01", category: "SERIALIZED", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-03-01", value: 1100, branch: "HQ", batchId: "HQ-B-005", serialNumber: "DL-5540-001" },
    { id: "HQ-LAPT-POOL-02", name: "Dell Latitude 5540", sku: "IT-LAP-01", category: "SERIALIZED", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-03-01", value: 1100, branch: "HQ", batchId: "HQ-B-005", serialNumber: "DL-5540-002" },
    { id: "HQ-LAPT-POOL-03", name: "Dell Latitude 5540", sku: "IT-LAP-01", category: "SERIALIZED", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-03-01", value: 1100, branch: "HQ", batchId: "HQ-B-005", serialNumber: "DL-5540-003" },

    // 2. HQ Stationary (For HQ Building Management)
    { id: "HQ-SOFA-LOBBY", name: "Leather Reception Sofa", category: "STATIONARY", status: "ISSUED", condition: "GOOD", purchaseDate: "2022-11-01", value: 1500, branch: "HQ", floor: "Floor 1", room: "Room 101 (Reception)", locationId: "HQ-F1-R101" },
    { id: "HQ-SERVER-RACK", name: "42U Server Rack", category: "STATIONARY", status: "ISSUED", condition: "GOOD", purchaseDate: "2022-05-15", value: 3000, branch: "HQ", floor: "Floor 3", room: "Room 302 (Server Room)", locationId: "HQ-F3-R302" },
    { id: "HQ-DESK-NEW", name: "Glass Computer Desk", category: "STATIONARY", status: "IN_STORE", condition: "NEW", purchaseDate: "2024-03-05", value: 400, branch: "HQ", batchId: "HQ-B-009" },

    // 3. Bulk Unassigned Stationary (For Bulk Assignment Testing)
    ...Array.from({ length: 20 }).map((_, i) => ({
        id: `HQ-CH-BULK-${i + 1}`,
        name: "Ergonomic Office Chair",
        category: "STATIONARY" as const,
        status: "IN_STORE" as const,
        condition: "NEW" as const,
        purchaseDate: "2024-03-10",
        value: 150,
        branch: "HQ" as const,
        batchId: "HQ-BATCH-2024-01"
    })),
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: `HQ-CAB-BULK-${i + 1}`,
        name: "Metal Filing Cabinet",
        category: "STATIONARY" as const,
        status: "IN_STORE" as const,
        condition: "NEW" as const,
        purchaseDate: "2024-03-10",
        value: 300,
        branch: "HQ" as const,
        batchId: "HQ-BATCH-2024-01"
    }))
);
