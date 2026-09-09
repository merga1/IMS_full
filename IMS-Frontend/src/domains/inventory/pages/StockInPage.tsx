import { useAuthStore } from "@/state/auth.store";
import StockInForm from "../components/StockInForm";
import IncomingTransfersList from "../components/IncomingTransfersList";
import { PackagePlus, Truck } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function StockInPage() {
    const { user } = useAuthStore();
    const { t } = useLanguage();
    const isHQ = user?.branch === 'HQ';

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        {isHQ ? (
                            <>
                                <PackagePlus className="w-8 h-8" />
                                {t('stockin.vendor_intake_title')}
                            </>
                        ) : (
                            <>
                                <Truck className="w-8 h-8" />
                                {t('stockin.receive_hq_title')}
                            </>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isHQ
                            ? t('stockin.hq_description')
                            : t('stockin.branch_description')}
                    </p>
                </div>
            </div>

            <div className="bg-background rounded-lg space-y-8">
                {isHQ ? (
                    /* HQ: Full Stock-In Form with vendor intake */
                    <StockInForm />
                ) : (
                    /* Branch: Only Incoming Transfers List */
                    <div className="space-y-4">
                        <IncomingTransfersList />
                        <div className="text-center text-sm text-muted-foreground p-4 border border-dashed rounded-lg">
                            <p>💡 <strong>{t('common.note')}</strong> {t('stockin.hq_only_note')}</p>
                            <p className="mt-1">{t('stockin.branch_update_note')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
