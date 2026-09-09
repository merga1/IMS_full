import { useRequestStore } from "@/domains/requisitions/store";
import { useAuthStore } from "@/state/auth.store";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Check, X, Eye, ShieldCheck, History as HistoryIcon } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  const { getPendingForUser, approveRequest, rejectRequest } = useRequestStore();
  const { toast } = useToast();
  const { t } = useLanguage();

  // If user is null, ProtectedRoute handles it, but for type safety:
  if (!user) return null;

  const pendingRequests = getPendingForUser(user);

  const handleApprove = (reqId: string) => {
    approveRequest(reqId, user.id, user.role);
    toast({
      title: t('approvals.toast_approved').replace('{0}', reqId),
      description: "Successfully processed.", // Optional, could add more details
    });
  };

  const handleReject = (reqId: string) => {
    rejectRequest(reqId, user.id, "Rejected via Quick Action");
    toast({
      title: t('approvals.toast_rejected').replace('{0}', reqId),
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">{t('approvals.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('approvals.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><HistoryIcon className="w-4 h-4 mr-2" /> {t('approvals.audit_trail')}</Button>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <ShieldCheck className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-muted-foreground">{t('approvals.caught_up')}</h3>
          <p className="text-sm text-muted-foreground">{t('approvals.no_pending')}</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingRequests.map((req) => (
            <Card key={req.id} className="group hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-2 border-b flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold text-primary tracking-widest">{req.id}</span>
                <Badge variant="secondary" className="text-[10px] font-bold">{req.status.replace('_', ' ')}</Badge>
              </div>
              <CardContent className="p-6">
                <div className="grid lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      {req.items.map((item, idx) => (
                        <h3 key={idx} className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">
                          {item.name} <span className="text-sm font-normal text-muted-foreground">x{item.quantity}</span>
                        </h3>
                      ))}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{req.requesterName.charAt(0)}</div>
                        <p className="text-sm font-medium">{req.requesterName} <span className="text-muted-foreground text-xs ml-1">• {req.type}</span></p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg border-l-4 border-l-primary/30 italic text-sm text-muted-foreground">
                      "{req.justification}"
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('approvals.approval_path')}</p>
                    <div className="space-y-2">
                      {req.approvalSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <div className={`w-1.5 h-1.5 rounded-full ${step.status === 'APPROVED' ? 'bg-emerald-500' :
                            step.status === 'PENDING' ? 'bg-amber-500 animate-pulse' :
                              step.status === 'REJECTED' ? 'bg-red-500' : 'bg-muted'
                            }`} />
                          <span className={step.status === 'PENDING' ? 'font-bold' : 'text-muted-foreground'}>
                            {step.role.replace('_', ' ')} <span className="opacity-50">({step.status})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-2">
                    <Button
                      className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                      onClick={() => handleApprove(req.id)}
                    >
                      <Check className="w-4 h-4 mr-2" /> {t('approvals.approve')}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="font-bold">
                        <Eye className="w-3 h-3 mr-1" /> {t('approvals.view')}
                      </Button>
                      <Button variant="destructive" size="sm" className="font-bold" onClick={() => handleReject(req.id)}>
                        <X className="w-3 h-3 mr-1" /> {t('approvals.reject')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 p-8 bg-card border-2 border-dashed rounded-3xl flex flex-col items-center text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-primary opacity-20" />
        <div>
          <h3 className="text-lg font-bold">{t('approvals.immutable_audit')}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{t('approvals.audit_desc')}</p>
        </div>
      </div>
    </div>
  );
}
