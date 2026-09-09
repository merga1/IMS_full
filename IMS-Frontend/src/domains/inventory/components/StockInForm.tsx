import { useState } from 'react';
import { useInventoryStore } from '../store';
import { useAuthStore } from '@/state/auth.store';
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { Plus, Package, Truck, AlertCircle, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Asset } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';

export default function StockInForm() {
    const { skus, updateStock, addAssets, recordMovement } = useInventoryStore();
    const { user } = useAuthStore();

    const [selectedSkuId, setSelectedSkuId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const [serialNumbers, setSerialNumbers] = useState("");
    const [vendor, setVendor] = useState("");
    const [batchId, setBatchId] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [warrantyMonths, setWarrantyMonths] = useState(0);

    const selectedSku = skus.find(s => s.id === selectedSkuId);

    const handleSubmit = () => {
        if (!selectedSku || quantity <= 0) return;

        // 1. Handle Serialized Items
        if (selectedSku.category === 'SERIALIZED') {
            const serialsList = serialNumbers.split('\n').filter(s => s.trim());

            if (serialsList.length !== quantity) {
                toast.error(`Quantity is ${quantity} but you provided ${serialsList.length} serial numbers.`);
                return;
            }

            const newAssets: Asset[] = serialsList.map(sn => ({
                id: `A-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: selectedSku.name,
                category: 'SERIALIZED',
                serialNumber: sn.trim(),
                status: 'IN_STORE',
                condition: 'NEW',
                purchaseDate: purchaseDate,
                value: 0,
                branch: user?.branch || 'HQ',
                sku: selectedSku.id,
                invoiceNumber: invoiceNumber,
                batchId: batchId,
                warrantyExpiration: warrantyMonths > 0
                    ? new Date(new Date(purchaseDate).setMonth(new Date(purchaseDate).getMonth() + warrantyMonths)).toISOString()
                    : undefined
            }));

            addAssets(newAssets);
            updateStock(selectedSku.id, quantity);
            toast.success(`${quantity} serialized assets added to inventory.`);
        }
        // 2. Handle Stationary Items (Auto-generate IDs, no serials required)
        else if (selectedSku.category === 'STATIONARY') {
            const newAssets: Asset[] = Array.from({ length: quantity }).map((_, i) => ({
                id: `ST-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
                name: selectedSku.name,
                category: 'STATIONARY',
                serialNumber: undefined, // Not typically tracked by SN
                status: 'IN_STORE',
                condition: 'NEW',
                purchaseDate: purchaseDate,
                value: 0,
                branch: user?.branch || 'HQ',
                sku: selectedSku.id,
                invoiceNumber: invoiceNumber,
                batchId: batchId,
                warrantyExpiration: warrantyMonths > 0
                    ? new Date(new Date(purchaseDate).setMonth(new Date(purchaseDate).getMonth() + warrantyMonths)).toISOString()
                    : undefined
            }));

            addAssets(newAssets);
            updateStock(selectedSku.id, quantity);
            toast.success(`${quantity} stationary items added. You can now assign them to rooms.`);
        }
        // 3. Handle Bulk Items (SKUs)
        else {
            updateStock(selectedSku.id, quantity);
            toast.success(`Stock level updated for ${selectedSku.name}. New total: ${selectedSku.currentStock + quantity}`);
        }

        // 3. Record Audit Log (Movement)
        recordMovement({
            id: uuidv4(),
            type: 'INTAKE',
            skuId: selectedSku.id,
            quantity: quantity,
            performedBy: user?.id || 'unknown',
            timestamp: new Date().toISOString(),
            notes: notes,
            batchId: batchId,
            vendor: vendor,
            invoiceNumber: invoiceNumber,
            toLocation: 'MAIN_STORE' // Default
        });

        // Reset Form
        setQuantity(1);
        setNotes("");
        setSerialNumbers("");
        setBatchId("");
        setInvoiceNumber("");
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setWarrantyMonths(0);
        // Don't reset vendor to allow quick entry
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Receive Stock</CardTitle>
                    <CardDescription>Enter details of incoming shipment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    <div className="space-y-2">
                        <Label>Select Item (SKU)</Label>
                        <Select value={selectedSkuId} onValueChange={setSelectedSkuId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose item..." />
                            </SelectTrigger>
                            <SelectContent>
                                {skus.map(sku => (
                                    <SelectItem key={sku.id} value={sku.id}>
                                        <span className="font-mono mr-2 text-muted-foreground">{sku.id}</span>
                                        {sku.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                            />
                        </div>
                        {selectedSku && (
                            <div className="flex-1 space-y-2">
                                <Label>Current Stock</Label>
                                <div className="flex items-center h-10 px-3 border rounded-md bg-muted/50 font-mono text-sm">
                                    {selectedSku.currentStock} {selectedSku.unit}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedSku?.category === 'SERIALIZED' && (
                        <div className="pt-2 border-t">
                            <div className="space-y-2">
                                <Label className="flex justify-between">
                                    <span>Serial Numbers</span>
                                    <span className={serialNumbers.split('\n').filter(s => s.trim()).length === quantity ? "text-green-600" : "text-amber-600"}>
                                        {serialNumbers.split('\n').filter(s => s.trim()).length} / {quantity}
                                    </span>
                                </Label>
                                <Textarea
                                    placeholder="Scan or type serial numbers (one per line)"
                                    className="font-mono min-h-[120px]"
                                    value={serialNumbers}
                                    onChange={(e) => setSerialNumbers(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Required for serialized items. Must match quantity.
                                </p>
                            </div>
                        </div>
                    )}

                    {user?.branch === 'HQ' && (
                        <>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                <div className="space-y-2">
                                    <Label>Vendor Name</Label>
                                    <Input
                                        placeholder="e.g. Dell Distributor"
                                        value={vendor}
                                        onChange={(e) => setVendor(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Batch / PO #</Label>
                                    <Input
                                        placeholder="e.g. PO-2024-001"
                                        value={batchId}
                                        onChange={(e) => setBatchId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Invoice Number</Label>
                                    <Input
                                        placeholder="e.g. INV-2024-999"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Purchase Date</Label>
                                    <Input
                                        type="date"
                                        value={purchaseDate}
                                        onChange={(e) => setPurchaseDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Warranty (Months)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={warrantyMonths}
                                        onChange={(e) => setWarrantyMonths(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2 flex items-end">
                                    <div className="flex gap-2 w-full">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => console.log('Upload Invoice clicked')}>
                                            <FileText className="w-4 h-4 mr-2" /> Invoice
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => console.log('Upload Warranty clicked')}>
                                            <Upload className="w-4 h-4 mr-2" /> Docs
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label>Notes / Condition</Label>
                        <Textarea
                            placeholder="Any damage or discrepancies?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <Button className="w-full" onClick={handleSubmit} disabled={!selectedSku}>
                        <Plus className="mr-2 h-4 w-4" /> Confirm & Add to Inventory
                    </Button>

                </CardContent>
            </Card>

            {/* Right Column: Info & Preview */}
            <div className="space-y-6">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center text-sm font-medium">
                            <Package className="mr-2 h-4 w-4" /> Item Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedSku ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-muted-foreground">Name</div>
                                    <div className="font-bold">{selectedSku.name}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-muted-foreground">Category</div>
                                        <Badge variant="outline">{selectedSku.category}</Badge>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Unit</div>
                                        <div>{selectedSku.unit}</div>
                                    </div>
                                </div>

                                {selectedSku.currentStock <= selectedSku.thresholdQty && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                        <div>
                                            <div className="font-bold">Low Stock Warning</div>
                                            This item is below the threshold of {selectedSku.thresholdQty}. Replenishment is recommended.
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Select an item to view details
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="flex items-center text-sm font-medium text-blue-700 dark:text-blue-400">
                            <Truck className="mr-2 h-4 w-4" /> Receiving Guidelines
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2 text-blue-700/80 dark:text-blue-400/80">
                        <p>• Verify physical count against invoice/PO.</p>
                        <p>• Inspect for damages before accepting.</p>
                        <p>• For electronics, record all serial numbers.</p>
                        <p>• HQ deliveries must have valid Vendor & Batch ID.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
