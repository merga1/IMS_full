
interface InventoryActions {
    updateAssetStatus: (id: string, status: 'ISSUED', holderId: string) => void;
    updateStock: (id: string, qty: number) => void;
}

export function finalizeDispatchTransaction(
    req: any,
    inventoryActions: InventoryActions
) {
    req.items.forEach((item: any) => {
        if (item.type === 'SERIALIZED') {
            inventoryActions.updateAssetStatus(item.skuId, 'ISSUED', req.requesterId);
        } else {
            inventoryActions.updateStock(item.inventoryId, -item.quantity);
        }
    });
}
