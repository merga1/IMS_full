import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { GatePass } from "../utils/gatePassGenerator";
import { QrCode, Printer, Download, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface GatePassPreviewModalProps {
    open: boolean;
    onClose: () => void;
    gatePass: GatePass | null;
    onPrint: () => void;
}

export default function GatePassPreviewModal({
    open,
    onClose,
    gatePass,
    onPrint
}: GatePassPreviewModalProps) {
    const { t } = useLanguage();
    if (!gatePass) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        {t('dispatch.components.gate_pass_success')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Success Message */}
                    <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-center">
                        <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                            {t('dispatch.components.dispatch_complete')}
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                            {t('dispatch.components.ready_print')}
                        </p>
                    </div>

                    {/* Gate Pass Preview */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left: Details */}
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">{t('dispatch.components.pass_id')}</p>
                                        <p className="font-mono text-sm font-semibold">{gatePass.id}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">{t('dispatch.components.employee')}</p>
                                        <p className="font-medium">{gatePass.employeeName}</p>
                                        <p className="text-sm text-muted-foreground font-mono">{gatePass.employeeId}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">{t('dispatch.components.issued_at')}</p>
                                        <p className="text-sm">{new Date(gatePass.issuedAt).toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">{t('requests.items')}</p>
                                        <div className="space-y-2">
                                            {gatePass.items.map((item, idx) => (
                                                <div key={idx} className="border rounded p-2">
                                                    <p className="text-sm font-medium">{item.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {t('dispatch.components.qty')}: {item.quantity}
                                                        </Badge>
                                                        {item.serialNumbers && item.serialNumbers.length > 0 && (
                                                            <span className="text-xs text-muted-foreground font-mono">
                                                                {t('dispatch.components.sn')}: {item.serialNumbers.join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: QR Code */}
                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
                                    <QrCode className="w-8 h-8 text-muted-foreground mb-3" />
                                    <img
                                        src={gatePass.qrCode}
                                        alt="Gate Pass QR Code"
                                        className="w-48 h-48 border rounded"
                                    />
                                    <p className="text-xs text-muted-foreground mt-3 text-center">
                                        {t('dispatch.components.scan_gate')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={onClose}>
                            <Download className="w-4 h-4 mr-2" />
                            {t('dispatch.components.save_pdf')}
                        </Button>
                        <Button onClick={onPrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            {t('dispatch.components.print_pass')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
