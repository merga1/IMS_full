import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { AlertTriangle, Hammer, History as HistoryIcon } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

const TICKETS = [
  {
    id: "TIC-882",
    title: "Laptop Battery Swollen",
    asset: "MacBook Pro (SN-992-AX)",
    priority: "CRITICAL",
    status: "ASSIGNED",
    reporter: "Almaz Ayana",
    time: "2h ago"
  },
  {
    id: "TIC-885",
    title: "OS License Expired",
    asset: "Desktop Workstation (HQ-R201)",
    priority: "MEDIUM",
    status: "PENDING",
    reporter: "System Bot",
    time: "5h ago"
  },
  {
    id: "TIC-889",
    title: "Broken Screen hinge",
    asset: "HP EliteBook (SN-002-XC)",
    priority: "LOW",
    status: "RESOLVED",
    reporter: "John Consultant",
    time: "Yesterday"
  }
];

export default function MaintenancePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">{t('maintenance.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('maintenance.subtitle')}</p>
        </div>
        <Button variant="outline"><AlertTriangle className="w-4 h-4 mr-2" /> {t('maintenance.report_failure')}</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TICKETS.map((ticket) => (
          <Card key={ticket.id} className={`group hover:shadow-xl transition-all duration-300 border-l-4 ${ticket.priority === 'CRITICAL' ? 'border-l-destructive' :
            ticket.priority === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-emerald-500'
            }`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={ticket.priority === 'CRITICAL' ? 'destructive' : 'secondary'} className="text-[10px] font-bold">
                  {ticket.priority}
                </Badge>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{ticket.id}</span>
              </div>
              <CardTitle className="text-lg font-black group-hover:text-primary transition-colors">{ticket.title}</CardTitle>
              <CardDescription className="text-xs font-bold text-foreground/60">{ticket.asset}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px]">{ticket.reporter.charAt(0)}</div>
                <p className="text-xs text-muted-foreground">{t('maintenance.reported_by')} {ticket.reporter} • {ticket.time}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-6">
                <Button size="sm" variant="outline" className="font-bold text-[10px] uppercase">{t('maintenance.diagnose')}</Button>
                <Button size="sm" className="font-bold text-[10px] uppercase">
                  {ticket.status === 'RESOLVED' ? t('maintenance.view_details') : t('maintenance.take_action')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="w-5 h-5 text-primary" /> {t('maintenance.hardware_control')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('maintenance.hardware_desc')}</p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-destructive hover:bg-destructive/90 font-bold">{t('maintenance.mark_scrapped')}</Button>
              <Button size="sm" variant="outline" className="font-bold">{t('maintenance.move_repair')}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-primary" /> {t('maintenance.digital_management')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('maintenance.digital_desc')}</p>
            <div className="flex gap-2">
              <Button size="sm" className="font-bold">{t('maintenance.renew_license')}</Button>
              <Button size="sm" variant="outline" className="font-bold">{t('maintenance.version_audit')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
