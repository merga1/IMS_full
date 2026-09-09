import { useState } from "react";
import { useInventoryStore } from "../store";
import { useAuthStore } from "@/state/auth.store";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Checkbox } from "@/shared/ui/checkbox";
import { Truck, CheckCircle2, PackageCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function IncomingTransfersList() {
    const { user } = useAuthStore();
    const { t } = useLanguage();
    const { movements, skus, receiveTransfer } = useInventoryStore();
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
    const [verifiedItems, setVerifiedItems] = useState<Set<string>>(new Set());

    // Filter for transfers sent TO this user's branch that are IN_TRANSIT
    const incomingTransfers = movements.filter(m =>
        m.type === 'TRANSFER' &&
        m.toLocation === user?.branch &&
        m.status === 'IN_TRANSIT'
    );

    const handleOpenVerify = (transfer: any) => {
        setSelectedTransfer(transfer);
        setVerifiedItems(new Set());
        setIsVerifyOpen(true);
    };

    const handleToggleVerify = (serialNumber: string) => {
        const newSet = new Set(verifiedItems);
        if (newSet.has(serialNumber)) {
            newSet.delete(serialNumber);
        } else {
            newSet.add(serialNumber);
        }
        setVerifiedItems(newSet);
    };

    const handleConfirmReceipt = () => {
        if (!selectedTransfer) return;

        const sku = skus.find(s => s.id === selectedTransfer.skuId);

        // Check if all items are verified
        const expectedSerials = getExpectedSerials(selectedTransfer);
        if (expectedSerials.length > 0 && verifiedItems.size !== expectedSerials.length) {
            toast.error(t('toast.verify_all_items'));
            return;
        }

        receiveTransfer(selectedTransfer.id);
        toast.success(t('toast.received_units').replace('{0}', selectedTransfer.quantity).replace('{1}', sku?.name || t('common.item')));
        setIsVerifyOpen(false);
        setSelectedTransfer(null);
        setVerifiedItems(new Set());
    };

    // Get expected serial numbers for a transfer (mock data for now)
    const getExpectedSerials = (transfer: any) => {
        const sku = skus.find(s => s.id === transfer.skuId);

        // Only serialized items have serial numbers
        if (sku?.category !== 'SERIALIZED') return [];

        // Mock serial numbers based on transfer ID
        if (transfer.id === 'MOV-TRF-001') {
            return ['MBP-2024-AR-101', 'MBP-2024-AR-102', 'MBP-2024-AR-103'];
        }

        // Generate mock serials for other transfers
        return Array.from({ length: transfer.quantity }, (_, i) =>
            `${transfer.skuId}-SN-${String(i + 1).padStart(3, '0')}`
        );
    };

    if (incomingTransfers.length === 0) return null;

    return (
        <>
            <Card className="border-blue-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                        <Truck className="w-5 h-5" />
                        {t('stockin.incoming_shipments_hq')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('common.item')}</TableHead>
                                <TableHead>{t('common.quantity')}</TableHead>
                                <TableHead>{t('stockin.sent_date')}</TableHead>
                                <TableHead className="text-right">{t('common.action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incomingTransfers.map((transfer) => {
                                const sku = skus.find(s => s.id === transfer.skuId);
                                return (
                                    <TableRow key={transfer.id}>
                                        <TableCell>
                                            <div className="font-medium">{sku?.name || transfer.skuId}</div>
                                            <div className="text-xs text-muted-foreground">{transfer.notes}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono">
                                                {transfer.quantity} {sku?.unit}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(transfer.timestamp).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleOpenVerify(transfer)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <PackageCheck className="w-4 h-4 mr-2" />
                                                {t('stockin.verify_confirm')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Verification Modal */}
            <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PackageCheck className="w-5 h-5 text-blue-600" />
                            {t('stockin.verify_physical_receipt')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('stockin.verify_description')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTransfer && (() => {
                        const sku = skus.find(s => s.id === selectedTransfer.skuId);
                        const expectedSerials = getExpectedSerials(selectedTransfer);
                        const isSerializedItem = expectedSerials.length > 0;

                        return (
                            <div className="space-y-4 py-4">
                                {/* Transfer Details */}
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">{sku?.name}</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">{t('common.quantity')}:</span>
                                            <span className="ml-2 font-mono">{selectedTransfer.quantity} {sku?.unit}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">{t('common.from')}</span>
                                            <span className="ml-2 font-semibold">{selectedTransfer.fromLocation}</span>
                                        </div>
                                    </div>
                                    {selectedTransfer.notes && (
                                        <p className="text-xs text-muted-foreground mt-2">{selectedTransfer.notes}</p>
                                    )}
                                </div>

                                {/* Serial Number Verification (for serialized items) */}
                                {isSerializedItem ? (
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-sm">{t('stockin.serial_verification')}</h4>
                                            <Badge variant={verifiedItems.size === expectedSerials.length ? "default" : "secondary"}>
                                                {verifiedItems.size} / {expectedSerials.length} {t('stockin.verified')}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            {expectedSerials.map((serial, index) => (
                                                <div
                                                    key={serial}
                                                    className="flex items-center gap-3 p-3 border rounded hover:bg-muted/50 transition-colors"
                                                >
                                                    <Checkbox
                                                        id={serial}
                                                        checked={verifiedItems.has(serial)}
                                                        onCheckedChange={() => handleToggleVerify(serial)}
                                                    />
                                                    <label
                                                        htmlFor={serial}
                                                        className="flex-1 cursor-pointer"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-xs text-muted-foreground">{t('stockin.item_number')} {index + 1}</span>
                                                                <p className="font-mono text-sm">{serial}</p>
                                                            </div>
                                                            {verifiedItems.has(serial) && (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                            )}
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <p className="text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <span>{t('stockin.inspect_instruction')}</span>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Quantity Verification (for non-serialized items) */
                                    <div className="border rounded-lg p-4">
                                        <h4 className="font-semibold text-sm mb-3">{t('stockin.quantity_verification')}</h4>
                                        <div className="flex items-center gap-3 p-3 border rounded">
                                            <Checkbox
                                                id="quantity-verify"
                                                checked={verifiedItems.has('quantity-verified')}
                                                onCheckedChange={() => handleToggleVerify('quantity-verified')}
                                            />
                                            <label htmlFor="quantity-verify" className="flex-1 cursor-pointer">
                                                <p className="text-sm">
                                                    {t('stockin.confirm_count')
                                                        .replace('{0}', selectedTransfer.quantity)
                                                        .replace('{1}', sku?.unit || '')
                                                        .replace('{2}', sku?.name || '')}
                                                </p>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVerifyOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleConfirmReceipt}
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={
                                selectedTransfer &&
                                    getExpectedSerials(selectedTransfer).length > 0
                                    ? verifiedItems.size !== getExpectedSerials(selectedTransfer).length
                                    : !verifiedItems.has('quantity-verified')
                            }
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('stockin.confirm_receipt')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
