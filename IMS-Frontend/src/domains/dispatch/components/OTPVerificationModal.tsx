import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface OTPVerificationModalProps {
    open: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<boolean>;
    onComplete?: () => void;
    requestId: string;
    employeeName: string;
}

export default function OTPVerificationModal({
    open,
    onClose,
    onVerify,
    onComplete,
    requestId,
    employeeName
}: OTPVerificationModalProps) {
    const { t } = useLanguage();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError(t('dispatch.components.invalid_otp'));
            return;
        }

        setLoading(true);
        setError("");

        try {
            const isValid = await onVerify(otp);

            if (isValid) {
                setSuccess(true);
                setTimeout(() => {
                    if (onComplete) {
                        onComplete();
                    } else {
                        onClose();
                    }
                    setOtp("");
                    setSuccess(false);
                }, 1500);
            } else {
                setError(t('dispatch.components.invalid_otp'));
                setOtp("");
            }
        } catch (err) {
            setError(t('dispatch.components.verification_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOtp("");
        setError("");
        setSuccess(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('dispatch.components.verify_otp')}</DialogTitle>
                    <DialogDescription>
                        {t('dispatch.components.employee')}: <span className="font-semibold text-foreground">{employeeName}</span>
                        <br />
                        {t('dispatch.request_id')} <span className="font-mono text-xs">{requestId}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    {!success ? (
                        <>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-4">
                                    {t('dispatch.components.ask_otp')}
                                </p>
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={(value) => {
                                        setOtp(value);
                                        setError("");
                                    }}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    disabled={loading}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <div className="mx-2">-</div>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-destructive text-sm">
                                    <XCircle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-emerald-600">
                            <CheckCircle2 className="w-16 h-16" />
                            <p className="font-semibold">{t('dispatch.components.otp_success')}</p>
                        </div>
                    )}
                </div>

                {!success && (
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={loading}>
                            {t('dispatch.components.cancel')}
                        </Button>
                        <Button
                            onClick={handleVerify}
                            disabled={otp.length !== 6 || loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('dispatch.components.verify_continue')}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
