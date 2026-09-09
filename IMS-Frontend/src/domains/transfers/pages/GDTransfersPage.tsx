import { useState } from "react";
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
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileText,
    TrendingUp,
    MapPin,
    Package
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog";

interface Transfer {
    id: string;
    gatePassNumber: string;
    type: 'HQ_TO_BRANCH' | 'BRANCH_TO_HQ' | 'BRANCH_TO_BRANCH';
    fromLocation: string;
    toLocation: string;
    assetCount: number;
    highValueAssets: number;
    totalValue: number;
    issuedBy: string;
    receivedBy?: string;
    status: 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'LOST';
    issuedAt: string;
    expectedDelivery: string;
    actualDelivery?: string;
    items: string[];
}

const MOCK_TRANSFERS: Transfer[] = [
    {
        id: 'TRF-001',
        gatePassNumber: 'GP-2024-0145',
        type: 'HQ_TO_BRANCH',
        fromLocation: 'HQ',
        toLocation: 'Arada Branch',
        assetCount: 15,
        highValueAssets: 3,
        totalValue: 450000,
        issuedBy: 'Alemayehu Tadesse',
        receivedBy: 'Sara Mohammed',
        status: 'DELIVERED',
        issuedAt: '2024-01-03T09:00:00',
        expectedDelivery: '2024-01-03T14:00:00',
        actualDelivery: '2024-01-03T13:45:00',
        items: ['Dell Latitude 5420 (3)', 'Office Chairs (10)', 'Monitors (2)']
    },
    {
        id: 'TRF-002',
        gatePassNumber: 'GP-2024-0146',
        type: 'BRANCH_TO_HQ',
        fromLocation: 'Bole Branch',
        toLocation: 'HQ',
        assetCount: 5,
        highValueAssets: 1,
        totalValue: 125000,
        issuedBy: 'Tigist Bekele',
        status: 'IN_TRANSIT',
        issuedAt: '2024-01-04T08:30:00',
        expectedDelivery: '2024-01-04T16:00:00',
        items: ['Printer (HP LaserJet)', 'Faulty Monitors (4)']
    },
    {
        id: 'TRF-003',
        gatePassNumber: 'GP-2024-0147',
        type: 'HQ_TO_BRANCH',
        fromLocation: 'HQ',
        toLocation: 'Lideta Branch',
        assetCount: 25,
        highValueAssets: 8,
        totalValue: 1250000,
        issuedBy: 'Dawit Hailu',
        status: 'DELAYED',
        issuedAt: '2024-01-02T10:00:00',
        expectedDelivery: '2024-01-02T17:00:00',
        items: ['Dell Laptops (8)', 'Office Supplies (Bulk)', 'Furniture (Various)']
    },
    {
        id: 'TRF-004',
        gatePassNumber: 'GP-2024-0148',
        type: 'BRANCH_TO_BRANCH',
        fromLocation: 'Kirkos Branch',
        toLocation: 'Yeka Branch',
        assetCount: 8,
        highValueAssets: 0,
        totalValue: 45000,
        issuedBy: 'Yonas Girma',
        receivedBy: 'Meron Assefa',
        status: 'DELIVERED',
        issuedAt: '2024-01-01T11:00:00',
        expectedDelivery: '2024-01-01T15:00:00',
        actualDelivery: '2024-01-01T14:30:00',
        items: ['Office Supplies (Mixed)', 'Stationery (Bulk)']
    },
    {
        id: 'TRF-005',
        gatePassNumber: 'GP-2024-0149',
        type: 'HQ_TO_BRANCH',
        fromLocation: 'HQ',
        toLocation: 'Bole Branch',
        assetCount: 12,
        highValueAssets: 5,
        totalValue: 850000,
        issuedBy: 'Alemayehu Tadesse',
        status: 'IN_TRANSIT',
        issuedAt: '2024-01-04T07:00:00',
        expectedDelivery: '2024-01-04T15:00:00',
        items: ['HP Laptops (5)', 'Printers (3)', 'Office Chairs (4)']
    }
];

export default function GDTransfersPage() {
    const [transfers] = useState<Transfer[]>(MOCK_TRANSFERS);
    const { t } = useLanguage();
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return <Badge className="bg-emerald-500 gap-1"><CheckCircle2 className="w-3 h-3" />Delivered</Badge>;
            case 'IN_TRANSIT':
                return <Badge className="bg-blue-500 gap-1"><Clock className="w-3 h-3" />In Transit</Badge>;
            case 'DELAYED':
                return <Badge className="bg-amber-500 gap-1"><AlertTriangle className="w-3 h-3" />Delayed</Badge>;
            case 'LOST':
                return <Badge variant="destructive">Lost</Badge>;
            default:
                return null;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'HQ_TO_BRANCH':
                return 'HQ → Branch';
            case 'BRANCH_TO_HQ':
                return 'Branch → HQ';
            case 'BRANCH_TO_BRANCH':
                return 'Branch ↔ Branch';
            default:
                return type;
        }
    };

    const filteredTransfers = transfers.filter(t => {
        if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
        if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
        return true;
    });

    const totalValue = filteredTransfers.reduce((sum, t) => sum + t.totalValue, 0);
    const inTransit = filteredTransfers.filter(t => t.status === 'IN_TRANSIT').length;
    const delayed = filteredTransfers.filter(t => t.status === 'DELAYED').length;
    const highValueCount = filteredTransfers.reduce((sum, t) => sum + t.highValueAssets, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">{t('gd.transfers.title')}</h1>
                <p className="text-muted-foreground">{t('gd.transfers.subtitle')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('gd.transfers.total_transfers')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{filteredTransfers.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('gd.transfers.tracked')}</p>
                    </CardContent>
                </Card>

                <Card className="border-blue-500/50 bg-blue-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('gd.transfers.in_transit')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{inTransit}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('gd.transfers.moving')}</p>
                    </CardContent>
                </Card>

                <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('gd.transfers.delayed')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{delayed}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('gd.transfers.attention')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('gd.transfers.total_value')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono">{(totalValue / 1000000).toFixed(1)}M Birr</div>
                        <p className="text-xs text-muted-foreground mt-1">{highValueCount} {t('gd.transfers.high_value')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('gd.transfers.filters')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>{t('gd.transfers.status')}</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                                    <SelectItem value="DELAYED">Delayed</SelectItem>
                                    <SelectItem value="LOST">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>{t('gd.transfers.type')}</Label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="HQ_TO_BRANCH">HQ → Branch</SelectItem>
                                    <SelectItem value="BRANCH_TO_HQ">Branch → HQ</SelectItem>
                                    <SelectItem value="BRANCH_TO_BRANCH">Branch ↔ Branch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>{t('gd.transfers.search_gatepass')}</Label>
                            <Input placeholder="GP-2024-XXXX" className="mt-1" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transfers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('gd.transfers.history_title')}</CardTitle>
                    <CardDescription>{t('gd.transfers.history_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('gd.transfers.table.id')}</TableHead>
                                <TableHead>{t('gd.transfers.table.gatepass')}</TableHead>
                                <TableHead>{t('gd.transfers.table.route')}</TableHead>
                                <TableHead>{t('gd.transfers.table.assets')}</TableHead>
                                <TableHead>{t('gd.transfers.table.value')}</TableHead>
                                <TableHead>{t('gd.transfers.table.issued_by')}</TableHead>
                                <TableHead>{t('gd.transfers.status')}</TableHead>
                                <TableHead>{t('gd.transfers.table.timeline')}</TableHead>
                                <TableHead className="text-right">{t('gd.transfers.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransfers.map((transfer) => (
                                <TableRow key={transfer.id}>
                                    <TableCell className="font-mono font-medium">{transfer.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <FileText className="w-3 h-3 text-muted-foreground" />
                                            <span className="font-mono text-xs">{transfer.gatePassNumber}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <Building2 className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-sm font-medium">{transfer.fromLocation}</span>
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-sm font-medium">{transfer.toLocation}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{getTypeLabel(transfer.type)}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{transfer.assetCount} items</p>
                                            {transfer.highValueAssets > 0 && (
                                                <Badge variant="outline" className="text-xs mt-1">
                                                    <TrendingUp className="w-2 h-2 mr-1" />
                                                    {transfer.highValueAssets} high-value
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono font-medium">
                                        {transfer.totalValue.toLocaleString()} Birr
                                    </TableCell>
                                    <TableCell className="text-sm">{transfer.issuedBy}</TableCell>
                                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                                    <TableCell>
                                        <div className="text-xs">
                                            <p className="text-muted-foreground">Issued: {new Date(transfer.issuedAt).toLocaleDateString()}</p>
                                            <p className="text-muted-foreground">Expected: {new Date(transfer.expectedDelivery).toLocaleDateString()}</p>
                                            {transfer.actualDelivery && (
                                                <p className="text-emerald-600 font-medium">Delivered: {new Date(transfer.actualDelivery).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline">
                                                    {t('gd.transfers.view_details')}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Transfer Manifest: {transfer.id}</DialogTitle>
                                                    <DialogDescription>
                                                        Gate Pass: <span className="font-mono">{transfer.gatePassNumber}</span>
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="rounded-md border p-4">
                                                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                            <Package className="w-4 h-4" /> Items in Transit
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {transfer.items.map((item, idx) => (
                                                                <li key={idx} className="text-sm border-b last:border-0 pb-2 last:pb-0 flex justify-between">
                                                                    <span>{item}</span>
                                                                    <Badge variant="secondary" className="text-[10px]">1 Unit</Badge>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <span className="text-muted-foreground block">Issued By</span>
                                                            <span className="font-medium">{transfer.issuedBy}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground block">Received By</span>
                                                            <span className="font-medium">{transfer.receivedBy || 'Pending'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Transfer Analytics */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('gd.transfers.frequency')}</CardTitle>
                        <CardDescription>{t('gd.transfers.frequency_subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">HQ → Branches</span>
                                <span className="font-mono font-bold">{transfers.filter(t => t.type === 'HQ_TO_BRANCH').length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Branches → HQ</span>
                                <span className="font-mono font-bold">{transfers.filter(t => t.type === 'BRANCH_TO_HQ').length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Branch ↔ Branch</span>
                                <span className="font-mono font-bold">{transfers.filter(t => t.type === 'BRANCH_TO_BRANCH').length}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('gd.transfers.performance')}</CardTitle>
                        <CardDescription>{t('gd.transfers.performance_subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">On-Time Deliveries</span>
                                <span className="font-mono font-bold text-emerald-600">
                                    {transfers.filter(t => t.status === 'DELIVERED').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Delayed Transfers</span>
                                <span className="font-mono font-bold text-amber-600">
                                    {transfers.filter(t => t.status === 'DELAYED').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Success Rate</span>
                                <span className="font-mono font-bold text-primary">
                                    {((transfers.filter(t => t.status === 'DELIVERED').length / transfers.length) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
