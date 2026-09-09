import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useInventoryStore } from '../store';
import { ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TransferStockModal({ isOpen, onClose }: TransferModalProps) {
    const { skus, transferStock } = useInventoryStore();

    const [selectedSkuId, setSelectedSkuId] = useState('');
    const [toBranch, setToBranch] = useState('');
    const [quantity, setQuantity] = useState(0);

    const selectedSku = skus.find(s => s.id === selectedSkuId);

    const handleTransfer = () => {
        if (!selectedSkuId || !toBranch || quantity <= 0) {
            toast.error("Please fill in all fields correctly.");
            return;
        }

        if (selectedSku && quantity > selectedSku.currentStock) {
            toast.error("Insufficient stock for transfer.");
            return;
        }

        transferStock(selectedSkuId, 'HQ', toBranch, quantity);
        toast.success(`Transferred ${quantity} ${selectedSku?.unit} to ${toBranch}`);
        onClose();

        // Reset form
        setQuantity(0);
        setSelectedSkuId('');
        setToBranch('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                        Transfer Stock
                    </DialogTitle>
                    <DialogDescription>
                        Move inventory from HQ Central Store to Branch.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Source</Label>
                        <div className="font-medium p-2 bg-slate-100 rounded text-sm text-slate-600">
                            HQ Central Warehouse
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Destination Branch</Label>
                        <Select value={toBranch} onValueChange={setToBranch}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ARADA">Arada Branch</SelectItem>
                                <SelectItem value="BOLE">Bole Branch</SelectItem>
                                <SelectItem value="LIDETA">Lideta Branch</SelectItem>
                                <SelectItem value="KIRKOS">Kirkos Branch</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Item to Transfer</Label>
                        <Select value={selectedSkuId} onValueChange={setSelectedSkuId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select SKU" />
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
                        <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                        />
                        {selectedSku && (
                            <p className="text-xs text-muted-foreground text-right">
                                Max available: {selectedSku.currentStock}
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleTransfer}>Confirm Transfer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}