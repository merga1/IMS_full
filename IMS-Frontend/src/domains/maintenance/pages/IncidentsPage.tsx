import { useState } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";

import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { AlertTriangle, Wrench, FileWarning } from "lucide-react";
import { useAuthStore } from "@/state/auth.store";
import { useInventoryStore } from "@/domains/inventory/store";
import { useIncidentStore, IncidentType } from "@/domains/maintenance/store";
import { useToast } from "@/shared/hooks/use-toast";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function IncidentsPage() {
    const { user } = useAuthStore();
    const { getAssetsByHolder } = useInventoryStore();
    const { incidents, reportIncident } = useIncidentStore();
    const { toast } = useToast();
    const { t } = useLanguage();

    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        assetId: '',
        type: 'MALFUNCTION' as IncidentType,
        description: ''
    });

    const myAssets = user ? getAssetsByHolder(user.id) : [];

    const handleReport = () => {
        if (!user) return;

        const asset = myAssets.find(a => a.id === formData.assetId);
        if (!asset) {
            toast({
                title: t('incidents.toast_error_asset'),
                variant: 'destructive'
            });
            return;
        }

        reportIncident({
            assetId: formData.assetId,
            assetName: asset.name,
            reporterId: user.id,
            reporterName: user.fullName,
            type: formData.type,
            description: formData.description
        });

        setIsOpen(false);
        setFormData({ assetId: '', type: 'MALFUNCTION', description: '' });
        toast({
            title: t('incidents.toast_success'),
            description: t('incidents.reported_date') + " " + new Date().toLocaleDateString()
        });
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">{t('incidents.title')}</h1>
                    <p className="text-muted-foreground">{t('incidents.subtitle')}</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            <FileWarning className="w-4 h-4 mr-2" /> {t('incidents.report_btn')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t('incidents.dialog_title')}</DialogTitle>
                            <DialogDescription>
                                {t('incidents.dialog_desc')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="asset" className="text-right">{t('incidents.label_asset')}</Label>
                                <div className="col-span-3">
                                    <Select onValueChange={(v) => setFormData({ ...formData, assetId: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('incidents.label_asset')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {myAssets.map(asset => (
                                                <SelectItem key={asset.id} value={asset.id}>{asset.name} ({asset.id})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">{t('incidents.label_type')}</Label>
                                <div className="col-span-3">
                                    <Select onValueChange={(v) => setFormData({ ...formData, type: v as IncidentType })} defaultValue="MALFUNCTION">
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('incidents.label_type')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALFUNCTION">{t('incidents.type_malfunction')}</SelectItem>
                                            <SelectItem value="DAMAGE">{t('incidents.type_damage')}</SelectItem>
                                            <SelectItem value="LOSS">{t('incidents.type_loss')}</SelectItem>
                                            <SelectItem value="MAINTENANCE_REQ">{t('incidents.type_maintenance')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="desc" className="text-right">{t('incidents.label_details')}</Label>
                                <Textarea
                                    id="desc"
                                    className="col-span-3"
                                    placeholder={t('incidents.placeholder_details')}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleReport} disabled={!formData.assetId || !formData.description}>{t('incidents.submit')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {incidents.length === 0 ? (
                    <Card className="p-8 text-center border-dashed">
                        <Wrench className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('incidents.no_incidents')}</p>
                    </Card>
                ) : (
                    incidents.map((inc) => (
                        <Card key={inc.id} className="border-l-4 border-l-destructive/50">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            {inc.type === 'DAMAGE' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                                            {inc.type === 'LOSS' && <FileWarning className="w-4 h-4 text-destructive" />}
                                            {inc.type === 'MALFUNCTION' && <Wrench className="w-4 h-4 text-amber-500" />}
                                            {inc.assetName}
                                        </CardTitle>
                                        <CardDescription className="font-mono text-xs mt-1">{inc.id} • {t('maintenance.reported_by')} {inc.reporterName}</CardDescription>
                                    </div>
                                    <Badge variant={inc.status === 'RESOLVED' ? 'outline' : 'destructive'} className={inc.status === 'RESOLVED' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                        {inc.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm bg-muted p-3 rounded-md italic">"{inc.description}"</p>
                                {inc.resolution && (
                                    <div className="mt-4 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100">
                                        <span className="font-bold">{t('incidents.resolution')}</span> {inc.resolution}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground flex justify-between">
                                <span>{t('incidents.reported_date')} {inc.dateReported}</span>
                                <span>{t('incidents.asset_id')} {inc.assetId}</span>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
