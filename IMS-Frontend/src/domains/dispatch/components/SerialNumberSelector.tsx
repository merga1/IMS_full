import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Barcode, Plus, X } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface SerialNumberSelectorProps {
    open: boolean;
    onClose: () => void;
    onSave: (serialNumbers: string[]) => void;
    itemName: string;
    quantity: number;
    availableSerials?: string[]; // Pre-populated serial numbers from inventory
}

export default function SerialNumberSelector({
    open,
    onClose,
    onSave,
    itemName,
    quantity,
    availableSerials = []
}: SerialNumberSelectorProps) {
    const { t } = useLanguage();
    const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
    const [manualInput, setManualInput] = useState("");

    const handleAddManual = () => {
        if (manualInput && !selectedSerials.includes(manualInput)) {
            setSelectedSerials([...selectedSerials, manualInput]);
            setManualInput("");
        }
    };

    const handleRemoveSerial = (serial: string) => {
        setSelectedSerials(selectedSerials.filter(s => s !== serial));
    };

    const handleSelectFromList = (serial: string) => {
        if (selectedSerials.includes(serial)) {
            handleRemoveSerial(serial);
        } else if (selectedSerials.length < quantity) {
            setSelectedSerials([...selectedSerials, serial]);
        }
    };

    const handleSave = () => {
        if (selectedSerials.length === quantity) {
            onSave(selectedSerials);
            setSelectedSerials([]);
            // Don't call onClose here, as parent will transition step
        }
    };

    const handleClose = () => {
        setSelectedSerials([]);
        setManualInput("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('dispatch.components.select_serials')}</DialogTitle>
                    <DialogDescription>
                        {t('inventory.item')}: <span className="font-semibold text-foreground">{itemName}</span>
                        <br />
                        {t('dispatch.components.select_instruction').replace('{0}', String(quantity)).replace('{1}', quantity > 1 ? 's' : '')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Manual Entry */}
                    <div className="space-y-2">
                        <Label>{t('dispatch.components.scan_enter')}</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('dispatch.components.scan_placeholder')}
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={handleAddManual} disabled={!manualInput}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Available Serials List */}
                    {availableSerials.length > 0 && (
                        <div className="space-y-2">
                            <Label>{t('dispatch.components.available')}</Label>
                            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                                {availableSerials.map((serial) => (
                                    <div
                                        key={serial}
                                        onClick={() => handleSelectFromList(serial)}
                                        className={`p-2 rounded cursor-pointer transition-colors ${selectedSerials.includes(serial)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <span className="font-mono text-sm">{serial}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selected Serials */}
                    <div className="space-y-2">
                        <Label>
                            {t('dispatch.components.selected_count').replace('{0}', String(selectedSerials.length)).replace('{1}', String(quantity))}
                        </Label>
                        <div className="border rounded-lg p-3 min-h-[80px]">
                            {selectedSerials.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    {t('dispatch.components.no_selected')}
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {selectedSerials.map((serial) => (
                                        <Badge key={serial} variant="secondary" className="gap-1">
                                            <span className="font-mono">{serial}</span>
                                            <X
                                                className="w-3 h-3 cursor-pointer hover:text-destructive"
                                                onClick={() => handleRemoveSerial(serial)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose}>
                        {t('dispatch.components.cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={selectedSerials.length !== quantity}
                    >
                        {t('dispatch.components.confirm_selection').replace('{0}', String(selectedSerials.length)).replace('{1}', String(quantity))}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
