import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Building2, Truck, ArrowRight, Package } from "lucide-react";
import { useInventoryStore } from "../store";
import { useAuthStore } from "@/state/auth.store";
import { Branch } from "@/shared/types";
import { toast } from "sonner";

const BRANCHES: Branch[] = ['ARADA', 'BOLE', 'LIDETA', 'KIRKOS'];

export default function InterBranchDispatchPage() {
    const { user } = useAuthStore();
    const { skus, movements, transferStock } = useInventoryStore();

    const recentTransfers = movements
        .filter(m => m.type === 'TRANSFER' && m.fromLocation === 'HQ')
        .slice(0, 5);

    const [formData, setFormData] = useState<{
        toBranch: string;
        skuId: string;
        quantity: number;
        notes: string;
        selectedAssetIds: string[];
    }>({
        toBranch: "",
        skuId: "",
        quantity: 0,
        notes: "",
        selectedAssetIds: []
    });

    const selectedSku = skus.find(s => s.id === formData.skuId);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssetToggle = (assetId: string) => {
        setFormData(prev => {
            const currentSelected = prev.selectedAssetIds;
            const newSelected = currentSelected.includes(assetId)
                ? currentSelected.filter((id: string) => id !== assetId)
                : [...currentSelected, assetId];

            // Auto-update quantity for serialized items based on selection
            return {
                ...prev,
                selectedAssetIds: newSelected,
                quantity: newSelected.length
            };
        });
    };

    const isSerialized = selectedSku?.category === 'SERIALIZED';
    const availableAssets = isSerialized && selectedSku
        ? user?.branch === 'HQ' // Ensure we only look at HQ stock for dispatch
            ? skus.find(s => s.id === selectedSku.id) // verifying SKU exists
                ? useInventoryStore.getState().assets.filter(a => a.sku === selectedSku.id && a.branch === 'HQ' && a.status === 'IN_STORE')
                : []
            : []
        : [];

    const handleSubmit = () => {
        if (!formData.toBranch || !formData.skuId) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (isSerialized) {
            if (formData.selectedAssetIds.length === 0) {
                toast.error("Please select at least one asset to dispatch.");
                return;
            }
            if (formData.selectedAssetIds.length !== formData.quantity) {
                // quantity is auto-synced, but good safety check
                toast.error("Selected quantity mismatch.");
                return;
            }
        } else {
            if (formData.quantity <= 0) {
                toast.error("Please enter a valid quantity");
                return;
            }
        }

        if (selectedSku && formData.quantity > selectedSku.currentStock) {
            toast.error(`Insufficient stock! HQ only has ${selectedSku.currentStock} ${selectedSku.unit}s.`);
            return;
        }

        transferStock(
            formData.skuId,
            'HQ',
            formData.toBranch,
            Number(formData.quantity),
            isSerialized ? formData.selectedAssetIds : undefined
        );

        toast.success(`Dispatched ${formData.quantity} ${selectedSku?.unit}s to ${formData.toBranch} Branch`);

        // Reset form
        setFormData({
            toBranch: "",
            skuId: "",
            quantity: 0,
            notes: "",
            selectedAssetIds: []
        });
    };

    if (user?.branch !== 'HQ') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Building2 className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-2xl font-bold">HQ Access Only</h2>
                <p className="text-muted-foreground mt-2">
                    Inter-branch dispatch is managed at Headquarters.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Inter-Branch Dispatch</h1>
                <p className="text-muted-foreground">
                    Move inventory from HQ Warehouse to Branch locations
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-gold" />
                            New Dispatch Order
                        </CardTitle>
                        <CardDescription>
                            Initiate a stock transfer
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Route Visual */}
                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-dashed text-sm">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-emerald-600" />
                                <span className="font-semibold">HQ Warehouse</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold">
                                    {formData.toBranch || "Select Branch"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Destination Branch</Label>
                            <Select
                                value={formData.toBranch}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, toBranch: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BRANCHES.map(branch => (
                                        <SelectItem key={branch} value={branch}>
                                            {branch} Branch
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Item (SKU)</Label>
                            <Select
                                value={formData.skuId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, skuId: val, selectedAssetIds: [], quantity: 0 }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Item to Dispatch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {skus.map(sku => (
                                        <SelectItem key={sku.id} value={sku.id}>
                                            {sku.name} (Stock: {sku.currentStock})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    disabled={isSerialized} // Disable manual input for serialized items
                                    className={isSerialized ? "bg-muted text-muted-foreground" : ""}
                                />
                                {selectedSku && (
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                        {selectedSku.unit}s
                                    </span>
                                )}
                            </div>
                            {isSerialized && (
                                <p className="text-xs text-blue-600">
                                    * auto-calculated based on selection
                                </p>
                            )}
                            {selectedSku && !isSerialized && (
                                <p className="text-xs text-muted-foreground">
                                    Available at HQ: {selectedSku.currentStock} {selectedSku.unit}s
                                </p>
                            )}
                        </div>

                        {/* Serialized Asset Selection */}
                        {isSerialized && (
                            <div className="space-y-2 border rounded-md p-3 bg-muted/20">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Select Assets to Dispatch ({availableAssets.length} available)
                                </Label>
                                {availableAssets.length === 0 ? (
                                    <p className="text-sm text-red-500">No available units in stock at HQ.</p>
                                ) : (
                                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                                        {availableAssets.map(asset => (
                                            <div key={asset.id}
                                                className={`flex items-start gap-3 p-2 border rounded cursor-pointer transition-all ${formData.selectedAssetIds.includes(asset.id) ? 'bg-primary/5 border-primary' : 'hover:bg-white bg-white'}`}
                                                onClick={() => handleAssetToggle(asset.id)}
                                            >
                                                <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center ${formData.selectedAssetIds.includes(asset.id) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                                    {formData.selectedAssetIds.includes(asset.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{asset.serialNumber}</p>
                                                    <p className="text-xs text-muted-foreground">Condition: {asset.condition}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Transfer Notes</Label>
                            <Input
                                name="notes"
                                placeholder="e.g. Monthly replenishment"
                                value={formData.notes}
                                onChange={handleInputChange}
                            />
                        </div>

                        <Button className="w-full" onClick={handleSubmit}>
                            <Truck className="w-4 h-4 mr-2" />
                            Dispatch Stock
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-muted/10 border-dashed">
                    <CardHeader>
                        <CardTitle className="text-base text-muted-foreground">
                            Recent Dispatches
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTransfers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No recent transfers found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentTransfers.map(t => {
                                    const skuName = skus.find(s => s.id === t.skuId)?.name || t.skuId;
                                    return (
                                        <div key={t.id} className="flex items-center justify-between bg-white p-3 rounded border shadow-sm">
                                            <div>
                                                <div className="font-medium text-sm">{skuName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t.quantity} units &rarr; {t.toLocation}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                    {(t.status || 'UNKNOWN').replace('_', ' ')}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground mt-1">
                                                    {new Date(t.timestamp).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
