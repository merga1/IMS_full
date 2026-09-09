import { useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import {
    FileText,
    Download,
    Search,
    TrendingDown,
    CheckCircle2,
    User,
    Package,
    Clock
} from "lucide-react";

interface AuditLog {
    id: string;
    timestamp: string;
    actor: string;
    actorRole: string;
    action: string;
    entity: 'ASSET' | 'USER' | 'REQUEST' | 'TRANSFER' | 'PROCUREMENT';
    entityId: string;
    description: string;
    ipAddress: string;
    branch: string;
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 'AL-001',
        timestamp: '2024-01-04T14:30:00',
        actor: 'Alemayehu Tadesse',
        actorRole: 'STOREKEEPER',
        action: 'ASSET_DISPATCHED',
        entity: 'ASSET',
        entityId: 'FAYDA-12345',
        description: 'Dispatched Dell Latitude 5420 to Tigist Bekele (EMPLOYEE)',
        ipAddress: '192.168.1.45',
        branch: 'HQ'
    },
    {
        id: 'AL-002',
        timestamp: '2024-01-04T13:15:00',
        actor: 'Dawit Hailu',
        actorRole: 'DIRECTOR',
        action: 'REQUEST_APPROVED',
        entity: 'REQUEST',
        entityId: 'REQ-789',
        description: 'Approved asset requisition for 5x Office Chairs',
        ipAddress: '192.168.1.22',
        branch: 'HQ'
    },
    {
        id: 'AL-003',
        timestamp: '2024-01-04T11:00:00',
        actor: 'General Director',
        actorRole: 'GD',
        action: 'PROCUREMENT_APPROVED',
        entity: 'PROCUREMENT',
        entityId: 'PR-001',
        description: 'Approved procurement request for 200x A4 Paper boxes (45,000 Birr)',
        ipAddress: '192.168.1.10',
        branch: 'HQ'
    },
    {
        id: 'AL-004',
        timestamp: '2024-01-04T10:20:00',
        actor: 'Sara Mohammed',
        actorRole: 'STOREKEEPER',
        action: 'TRANSFER_RECEIVED',
        entity: 'TRANSFER',
        entityId: 'TRF-001',
        description: 'Received transfer from HQ (15 items, Gate Pass GP-2024-0145)',
        ipAddress: '192.168.2.15',
        branch: 'Arada'
    },
    {
        id: 'AL-005',
        timestamp: '2024-01-04T09:45:00',
        actor: 'Yonas Girma',
        actorRole: 'TEAM_LEADER',
        action: 'ASSET_REPORTED_DAMAGED',
        entity: 'ASSET',
        entityId: 'FAYDA-67890',
        description: 'Reported HP Printer as damaged during use',
        ipAddress: '192.168.3.30',
        branch: 'Lideta'
    },
    {
        id: 'AL-006',
        timestamp: '2024-01-03T16:00:00',
        actor: 'System Admin',
        actorRole: 'SYSTEM_ADMIN',
        action: 'USER_CREATED',
        entity: 'USER',
        entityId: 'USR-456',
        description: 'Created new user account: Meron Assefa (EMPLOYEE)',
        ipAddress: '192.168.1.5',
        branch: 'HQ'
    }
];

interface IncidentReport {
    id: string;
    type: 'LOST' | 'DAMAGED' | 'SCRAPPED';
    assetId: string;
    assetName: string;
    value: number;
    reportedBy: string;
    reportedAt: string;
    branch: string;
    status: 'UNDER_INVESTIGATION' | 'RESOLVED' | 'CLOSED';
}

const MOCK_INCIDENTS: IncidentReport[] = [
    {
        id: 'INC-001',
        type: 'DAMAGED',
        assetId: 'FAYDA-67890',
        assetName: 'HP LaserJet Printer',
        value: 25000,
        reportedBy: 'Yonas Girma',
        reportedAt: '2024-01-04T09:45:00',
        branch: 'Lideta',
        status: 'UNDER_INVESTIGATION'
    },
    {
        id: 'INC-002',
        type: 'LOST',
        assetId: 'FAYDA-11223',
        assetName: 'Dell Monitor 24"',
        value: 8500,
        reportedBy: 'Tigist Bekele',
        reportedAt: '2024-01-02T14:00:00',
        branch: 'Bole',
        status: 'UNDER_INVESTIGATION'
    },
    {
        id: 'INC-003',
        type: 'SCRAPPED',
        assetId: 'FAYDA-99887',
        assetName: 'Old Desktop Computer',
        value: 15000,
        reportedBy: 'Alemayehu Tadesse',
        reportedAt: '2024-01-01T10:00:00',
        branch: 'HQ',
        status: 'CLOSED'
    }
];

export default function GDAuditPage() {
    const [logs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
    const { toast } = useToast();
    const { t } = useLanguage();
    const [incidents] = useState<IncidentReport[]>(MOCK_INCIDENTS);
    const [entityFilter, setEntityFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState("");

    const getEntityBadge = (entity: string) => {
        const colors = {
            ASSET: 'bg-blue-500',
            USER: 'bg-purple-500',
            REQUEST: 'bg-amber-500',
            TRANSFER: 'bg-emerald-500',
            PROCUREMENT: 'bg-red-500'
        };
        return <Badge className={colors[entity as keyof typeof colors] || 'bg-gray-500'}>{entity}</Badge>;
    };

    const getIncidentBadge = (type: string) => {
        switch (type) {
            case 'LOST':
                return <Badge variant="destructive">Lost</Badge>;
            case 'DAMAGED':
                return <Badge className="bg-amber-500">Damaged</Badge>;
            case 'SCRAPPED':
                return <Badge variant="outline">Scrapped</Badge>;
            default:
                return null;
        }
    };

    const filteredLogs = logs.filter(log => {
        if (entityFilter !== 'ALL' && log.entity !== entityFilter) return false;
        if (searchQuery && !log.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !log.entityId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const totalIncidentValue = incidents.reduce((sum, i) => sum + i.value, 0);
    const activeInvestigations = incidents.filter(i => i.status === 'UNDER_INVESTIGATION').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">{t('gd.audit.title')}</h1>
                <p className="text-muted-foreground">{t('gd.audit.subtitle')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('gd.audit.total_logs')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{logs.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('gd.audit.immutable_records')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('gd.audit.todays_activity')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('gd.audit.actions_logged')}</p>
                    </CardContent>
                </Card>

                <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('gd.audit.active_incidents')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{activeInvestigations}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('gd.audit.under_investigation')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('gd.audit.incident_value')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono">{(totalIncidentValue / 1000).toFixed(0)}K Birr</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('gd.audit.total_loss')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Logs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{t('gd.audit.trail_title')}</CardTitle>
                            <CardDescription>{t('gd.audit.trail_subtitle')}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: t('gd.audit.export_logs_toast_title'), description: t('gd.audit.export_logs_toast_desc') })}>
                            <Download className="w-4 h-4 mr-2" />
                            {t('gd.audit.export_logs')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <Label>{t('gd.audit.entity_type')}</Label>
                            <Select value={entityFilter} onValueChange={setEntityFilter}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">{t('gd.audit.all_entities')}</SelectItem>
                                    <SelectItem value="ASSET">Assets</SelectItem>
                                    <SelectItem value="USER">Users</SelectItem>
                                    <SelectItem value="REQUEST">Requests</SelectItem>
                                    <SelectItem value="TRANSFER">Transfers</SelectItem>
                                    <SelectItem value="PROCUREMENT">Procurement</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Label>{t('gd.audit.search_logs')}</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('gd.audit.search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('gd.audit.table.timestamp')}</TableHead>
                                <TableHead>{t('gd.audit.table.actor')}</TableHead>
                                <TableHead>{t('gd.audit.table.action')}</TableHead>
                                <TableHead>{t('gd.audit.table.entity')}</TableHead>
                                <TableHead>{t('gd.audit.table.description')}</TableHead>
                                <TableHead>{t('gd.audit.table.branch')}</TableHead>
                                <TableHead>{t('gd.audit.table.ip')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{log.actor}</p>
                                                <p className="text-xs text-muted-foreground">{log.actorRole}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-xs">{log.action}</TableCell>
                                    <TableCell>
                                        {getEntityBadge(log.entity)}
                                        <p className="text-xs text-muted-foreground mt-1 font-mono">{log.entityId}</p>
                                    </TableCell>
                                    <TableCell className="max-w-md text-sm">{log.description}</TableCell>
                                    <TableCell className="text-sm">{log.branch}</TableCell>
                                    <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Incident Reports */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{t('gd.audit.incident_reports')}</CardTitle>
                            <CardDescription>{t('gd.audit.incident_subtitle')}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: t('gd.audit.export_report_toast_title'), description: t('gd.audit.export_report_toast_desc') })}>
                            <Download className="w-4 h-4 mr-2" />
                            {t('gd.audit.export_report')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('gd.audit.incident_table.id')}</TableHead>
                                <TableHead>{t('gd.audit.incident_table.type')}</TableHead>
                                <TableHead>{t('gd.audit.incident_table.asset')}</TableHead>
                                <TableHead>{t('gd.audit.incident_table.value')}</TableHead>
                                <TableHead>{t('gd.audit.incident_table.reported_by')}</TableHead>
                                <TableHead>{t('gd.audit.table.branch')}</TableHead>
                                <TableHead>{t('gd.audit.incident_table.date')}</TableHead>
                                <TableHead>{t('gd.audit.incident_table.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incidents.map((incident) => (
                                <TableRow key={incident.id}>
                                    <TableCell className="font-mono font-medium">{incident.id}</TableCell>
                                    <TableCell>{getIncidentBadge(incident.type)}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{incident.assetName}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{incident.assetId}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono font-medium">{incident.value.toLocaleString()} Birr</TableCell>
                                    <TableCell className="text-sm">{incident.reportedBy}</TableCell>
                                    <TableCell className="text-sm">{incident.branch}</TableCell>
                                    <TableCell className="text-xs">{new Date(incident.reportedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {incident.status === 'UNDER_INVESTIGATION' && (
                                            <Badge className="bg-amber-500 gap-1">
                                                <Clock className="w-3 h-3" />Investigating
                                            </Badge>
                                        )}
                                        {incident.status === 'RESOLVED' && (
                                            <Badge className="bg-emerald-500 gap-1">
                                                <CheckCircle2 className="w-3 h-3" />Resolved
                                            </Badge>
                                        )}
                                        {incident.status === 'CLOSED' && (
                                            <Badge variant="outline">Closed</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Reports Section */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" />
                            {t('gd.audit.depreciation_report')}
                        </CardTitle>
                        <CardDescription>{t('gd.audit.depreciation_subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">IT Equipment</span>
                                <span className="font-mono font-bold text-destructive">-15%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Office Furniture</span>
                                <span className="font-mono font-bold text-destructive">-8%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Vehicles</span>
                                <span className="font-mono font-bold text-destructive">-12%</span>
                            </div>
                            <Button variant="outline" className="w-full mt-4" size="sm" onClick={() => toast({ title: t('gd.audit.download_depreciation_toast_title'), description: t('gd.audit.download_depreciation_toast_desc') })}>
                                <Download className="w-4 h-4 mr-2" />
                                {t('gd.audit.download_report')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {t('gd.audit.maintenance_summary')}
                        </CardTitle>
                        <CardDescription>{t('gd.audit.maintenance_subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Active Assets</span>
                                <span className="font-mono font-bold text-emerald-600">245</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Under Maintenance</span>
                                <span className="font-mono font-bold text-amber-600">18</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Scrapped (YTD)</span>
                                <span className="font-mono font-bold text-muted-foreground">7</span>
                            </div>
                            <Button variant="outline" className="w-full mt-4" size="sm" onClick={() => toast({ title: t('gd.audit.view_analysis_toast_title'), description: t('gd.audit.view_analysis_toast_desc') })}>
                                <FileText className="w-4 h-4 mr-2" />
                                {t('gd.audit.view_analysis')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
