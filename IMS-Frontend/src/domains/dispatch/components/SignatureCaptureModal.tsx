import { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, Check } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface SignatureCaptureModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (signature: string) => void;
    employeeName: string;
}

export default function SignatureCaptureModal({
    open,
    onClose,
    onSave,
    employeeName
}: SignatureCaptureModalProps) {
    const { t } = useLanguage();
    const sigPadRef = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        if (open && sigPadRef.current) {
            sigPadRef.current.clear();
            setIsEmpty(true);
        }
    }, [open]);

    const handleClear = () => {
        if (sigPadRef.current) {
            sigPadRef.current.clear();
            setIsEmpty(true);
        }
    };

    const handleSave = () => {
        if (sigPadRef.current && !isEmpty) {
            const signatureData = sigPadRef.current.toDataURL('image/png');
            onSave(signatureData);
            // Don't call onClose here, as parent will transition step
        }
    };

    const handleBegin = () => {
        setIsEmpty(false);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('dispatch.components.capture_sig')}</DialogTitle>
                    <DialogDescription>
                        {t('dispatch.components.sign_instruction').replace('{0}', employeeName)}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="border-2 border-dashed border-primary/30 rounded-lg overflow-hidden bg-muted/20">
                        <SignatureCanvas
                            ref={sigPadRef}
                            canvasProps={{
                                width: 600,
                                height: 250,
                                className: 'signature-canvas cursor-crosshair bg-background'
                            }}
                            onBegin={handleBegin}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {t('dispatch.components.draw_mouse')}
                    </p>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        disabled={isEmpty}
                    >
                        <Eraser className="mr-2 h-4 w-4" />
                        {t('dispatch.components.clear')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isEmpty}
                    >
                        <Check className="mr-2 h-4 w-4" />
                        {t('dispatch.components.confirm_sig')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
