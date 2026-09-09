import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/shared/hooks/use-toast";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import {
    AlertTriangle,
    ShieldAlert,
    Users,
    Search,
    Download,
    Activity,
    UserCog,
    Landmark,
    Truck,
    HeartPulse
} from "lucide-react";
import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { useAuthStore } from "@/state/auth.store";

// Mock Data
const BRANCH_STATUS = [
    { id: 'HQ', name: 'Headquarters', status: 'GOOD', load: 85 },
    { id: 'AR', name: 'Arada Branch', status: 'CRITICAL', load: 92 },
    { id: 'BO', name: 'Bole Branch', status: 'GOOD', load: 60 },
    { id: 'LI', name: 'Lideta Branch', status: 'WARNING', load: 78 },
    { id: 'KI', name: 'Kirkos Branch', status: 'GOOD', load: 45 },
    { id: 'YE', name: 'Yeka Branch', status: 'GOOD', load: 55 },
];

const SECTOR_DATA = [
    { name: 'Land Management', progress: 85, color: 'bg-emerald-500', icon: Landmark },
    { name: 'Transport Fleet', progress: 42, color: 'bg-amber-500', icon: Truck },
    { name: 'Social Services', progress: 91, color: 'bg-blue-500', icon: HeartPulse },
];

const PROCUREMENT_QUEUE = [
    { id: 1, title: "10x Toyota Hilux Fleet", department: "Transport", value: "45,000,000 Birr", urgent: true },
    { id: 2, title: "500x Dell Latitude Laptops", department: "IT Ops", value: "25,000,000 Birr", urgent: false },
    { id: 3, title: "Office Furniture (New Wing)", department: "Facilities", value: "8,500,000 Birr", urgent: false },
];

const TECH_HEALTH_DATA = [
    { name: 'Active', value: 65, color: '#10b981' },
    { name: 'Maintenance', value: 25, color: '#f59e0b' },
    { name: 'Scrapped', value: 10, color: '#ef4444' },
];

export default function GDDashboardPage() {
    const [delegationActive, setDelegationActive] = useState(false);
    const [selectedDelegate, setSelectedDelegate] = useState<string>("");
    const [_, setLocation] = useLocation();
    const { users } = useAuthStore();
    const { toast } = useToast();
    const { t } = useLanguage();

    // Filter eligible delegates (both DGD roles and DIRECTOR)
    const eligibleDelegates = users.filter(u =>
        (u.role === 'DGD_SERVICE' || u.role === 'DGD_DIGITALIZATION' || u.role === 'DIRECTOR') && u.status === 'ACTIVE'
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full text-foreground/90">

            {/* LEFT: Main Command Center (3 cols) */}
            <div className="lg:col-span-3 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">{t('gd.dashboard.title')}</h1>
                        <p className="text-muted-foreground">{t('gd.dashboard.subtitle')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">{t('gd.dashboard.total_value')}</p>
                        <h2 className="text-2xl font-bold font-mono text-foreground">142,850,000 Birr</h2>
                    </div>
                </div>

                {/* 1. Branch Heatmap Grid */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            {t('gd.dashboard.network_status')}
                        </h3>
                        <Badge variant="outline" className="font-mono">{t('gd.dashboard.realtime')}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {BRANCH_STATUS.map(branch => (
                            <Card key={branch.id} className={`border-l-4 transition-all hover:shadow-md ${branch.status === 'CRITICAL' ? 'border-l-destructive bg-destructive/5' :
                                branch.status === 'WARNING' ? 'border-l-amber-500 bg-amber-500/5' :
                                    'border-l-emerald-500'
                                }`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-sm tracking-tight">{branch.name}</span>
                                        {branch.status === 'CRITICAL' && <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{t('gd.dashboard.stock_load')}</span>
                                            <span>{branch.load}%</span>
                                        </div>
                                        <Progress value={branch.load} className="h-1.5" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* 2. Sector Status & Tech Health */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Sector Availability */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('gd.dashboard.sector_resource')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {SECTOR_DATA.map(sector => (
                                <div key={sector.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <sector.icon className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">{sector.name}</span>
                                        </div>
                                        <span className="font-mono">{sector.progress}%</span>
                                    </div>
                                    <Progress value={sector.progress} className={`h-2 ${sector.color?.replace('bg-', '[&>div]:bg-')}`} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Tech Health */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-0">
                            <CardTitle className="text-base">{t('gd.dashboard.tech_health')}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => toast({ title: t('gd.dashboard.download_tech_toast_title'), description: t('gd.dashboard.download_tech_toast_desc') })}><Download className="w-4 h-4" /></Button>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                                    <PieChart>
                                        <Pie
                                            data={TECH_HEALTH_DATA}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {TECH_HEALTH_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <span className="text-3xl font-bold">94%</span>
                                <p className="text-xs text-muted-foreground">{t('gd.dashboard.operational')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Delegation & Audit Hub */}
                <Card className="bg-muted/30 border-dashed">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <UserCog className="w-5 h-5" />
                            {t('gd.dashboard.delegation_hub')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-background rounded-lg border shadow-sm text-center min-w-[120px]">
                                    <span className="block text-xs text-muted-foreground mb-1">{t('gd.dashboard.acting_power')}</span>
                                    <Switch checked={delegationActive} onCheckedChange={setDelegationActive} />
                                    <span className={`block text-xs font-bold mt-1 ${delegationActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                        {delegationActive ? t('gd.dashboard.delegated') : t('gd.dashboard.revoked')}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium">{t('gd.dashboard.designated_rep')}</span>
                                        <Select value={selectedDelegate} onValueChange={setSelectedDelegate}>
                                            <SelectTrigger className="w-[280px] h-8 text-xs">
                                                <SelectValue placeholder={t('gd.dashboard.select_delegate')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {eligibleDelegates.map(user => (
                                                    <SelectItem key={user.id} value={user.id} className="text-xs">
                                                        {user.fullName}
                                                        {user.role === 'DGD_SERVICE' && ' (DGD - Service Sector)'}
                                                        {user.role === 'DGD_DIGITALIZATION' && ' (DGD - Digitalization)'}
                                                        {user.role === 'DIRECTOR' && ` (Director - ${user.department || 'N/A'})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <p className="text-muted-foreground text-xs">{t('gd.dashboard.grant_access_warning')}</p>
                                </div>
                            </div>

                            <div className="flex-1 w-full md:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder={t('gd.dashboard.search_placeholder')} className="pl-9 bg-background" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* RIGHT: Urgent Action Sidebar (1 col) */}
            <div className="space-y-6">

                {/* Procurement Signer */}
                <Card className="border-primary/20 bg-primary/5 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between text-primary">
                            <span>{t('gd.dashboard.pending_signatures')}</span>
                            <Badge variant="destructive" className="rounded-full px-2">3</Badge>
                        </CardTitle>
                        <CardDescription className="text-xs">{t('gd.dashboard.procurement_subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {PROCUREMENT_QUEUE.map(item => (
                            <div key={item.id} className="p-3 bg-background rounded-lg border shadow-sm space-y-2">
                                <div className="flex justify-between items-start">
                                    <span className="line-clamp-1 font-semibold text-sm" title={item.title}>{item.title}</span>
                                    {item.urgent && <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-xs text-muted-foreground">
                                        <p>{item.department}</p>
                                        <p className="font-mono text-foreground font-medium">{item.value}</p>
                                    </div>
                                    <Button size="sm" className="h-7 text-xs bg-primary/90 hover:bg-primary" onClick={() => toast({ title: t('gd.dashboard.approve_toast_title'), description: `${item.title} authorized for purchase.` })}>
                                        {t('gd.dashboard.approve')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full text-xs" onClick={() => setLocation('/gd/procurement')}>{t('gd.dashboard.view_all_queue')}</Button>
                    </CardContent>
                </Card>

                {/* Critical Alerts Feed */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-destructive" />
                            {t('gd.dashboard.critical_alerts')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-3 text-sm pb-3 border-b last:border-0 last:pb-0">
                                <div className="mt-0.5 w-2 h-2 rounded-full bg-destructive shrink-0" />
                                <div>
                                    <p className="font-medium">Low Stock Warning: Arada Branch</p>
                                    <p className="text-xs text-muted-foreground">Desktop Computers (Core i7) dropped below 10% threshold.</p>
                                    <span className="text-[10px] text-muted-foreground mt-1 block">2 hours ago</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* User Hierarchy Snippet */}
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setLocation('/admin/hierarchy')}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {t('gd.dashboard.hierarchy_view')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 border rounded bg-muted/20 text-center text-sm text-muted-foreground">
                            {t('gd.dashboard.hierarchy_preview')}
                            <br />
                            <span className="text-xs opacity-70">{t('gd.dashboard.click_expand')}</span>
                        </div>
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}
