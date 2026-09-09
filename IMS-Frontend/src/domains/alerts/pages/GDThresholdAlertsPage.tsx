import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Package,
    Building2,
    TrendingDown,
    ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

interface ThresholdAlert {
    id: string;
    sku: string;
    itemName: string;
    category: string;
    currentStock: number;
    thresholdQty: number;
    percentRemaining: number;
    affectedBranches: string[];
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    suggestedReplenishment: number;
    estimatedCost: number;
    createdAt: string;
    status: 'PENDING' | 'APPROVED' | 'DELAYED' | 'REJECTED';
}

const MOCK_ALERTS: ThresholdAlert[] = [
    {
        id: 'TA-001',
        sku: 'SKU-1122',
        itemName: 'Printer Paper (A4, 80gsm)',
        category: 'Office Supplies',
        currentStock: 45,
        thresholdQty: 500,
        percentRemaining: 9,
        affectedBranches: ['HQ', 'Arada', 'Bole'],
        priority: 'CRITICAL',
        suggestedReplenishment: 1000,
        estimatedCost: 75000,
        createdAt: '2024-01-04T11:00:00',
        status: 'PENDING'
    },
    {
        id: 'TA-002',
        sku: 'SKU-3344',
        itemName: 'Ballpoint Pens (Blue)',
        category: 'Consumables',
        currentStock: 120,
        thresholdQty: 2000,
        percentRemaining: 6,
        affectedBranches: ['HQ', 'Lideta'],
        priority: 'CRITICAL',
        suggestedReplenishment: 3000,
        estimatedCost: 18000,
        createdAt: '2024-01-04T09:30:00',
        status: 'PENDING'
    },
    {
        id: 'TA-003',
        sku: 'SKU-5566',
        itemName: 'Staples (Standard)',
        category: 'Consumables',
        currentStock: 85,
        thresholdQty: 1000,
        percentRemaining: 8.5,
        affectedBranches: ['Bole', 'Kirkos'],
        priority: 'HIGH',
        suggestedReplenishment: 1500,
        estimatedCost: 12000,
        createdAt: '2024-01-03T16:00:00',
        status: 'PENDING'
    },
    {
        id: 'TA-004',
        sku: 'SKU-7788',
        itemName: 'Toner Cartridge (HP LaserJet)',
        category: 'IT Consumables',
        currentStock: 12,
        thresholdQty: 150,
        percentRemaining: 8,
        affectedBranches: ['HQ'],
        priority: 'HIGH',
        suggestedReplenishment: 200,
        estimatedCost: 250000,
        createdAt: '2024-01-03T14:20:00',
        status: 'PENDING'
    },
    {
        id: 'TA-005',
        sku: 'SKU-9900',
        itemName: 'Cleaning Supplies (Disinfectant)',
        category: 'Facilities',
        currentStock: 18,
        thresholdQty: 200,
        percentRemaining: 9,
        affectedBranches: ['Arada', 'Yeka'],
        priority: 'MEDIUM',
        suggestedReplenishment: 300,
        estimatedCost: 45000,
        createdAt: '2024-01-02T10:00:00',
        status: 'PENDING'
    },
    {
        id: 'TA-006',
        sku: 'SKU-2233',
        itemName: 'Sticky Notes (3x3)',
        category: 'Office Supplies',
        currentStock: 65,
        thresholdQty: 800,
        percentRemaining: 8.1,
        affectedBranches: ['HQ', 'Bole', 'Lideta'],
        priority: 'HIGH',
        suggestedReplenishment: 1200,
        estimatedCost: 28000,
        createdAt: '2024-01-04T08:15:00',
        status: 'PENDING'
    }
];

export default function GDThresholdAlertsPage() {
    const [alerts, setAlerts] = useState<ThresholdAlert[]>(MOCK_ALERTS);
    const [selectedAlert, setSelectedAlert] = useState<ThresholdAlert | null>(null);
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
    const [isDelayDialogOpen, setIsDelayDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [actionReason, setActionReason] = useState("");

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Critical</Badge>;
            case 'HIGH':
                return <Badge className="bg-amber-500 gap-1"><ShieldAlert className="w-3 h-3" />High</Badge>;
            case 'MEDIUM':
                return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Medium</Badge>;
            default:
                return null;
        }
    };

    const handleApprove = () => {
        if (!selectedAlert) return;

        setAlerts(prev => prev.map(a =>
            a.id === selectedAlert.id ? { ...a, status: 'APPROVED' as const } : a
        ));

        toast.success(`Replenishment Approved: ${selectedAlert.id}`, {
            description: `${selectedAlert.itemName} - ${selectedAlert.suggestedReplenishment} units`
        });

        setIsApprovalDialogOpen(false);
        setSelectedAlert(null);
    };

    const handleDelay = () => {
        if (!selectedAlert || !actionReason.trim()) {
            toast.error("Delay reason is required");
            return;
        }

        setAlerts(prev => prev.map(a =>
            a.id === selectedAlert.id ? { ...a, status: 'DELAYED' as const } : a
        ));

        toast.warning(`Replenishment Delayed: ${selectedAlert.id}`, {
            description: actionReason
        });

        setIsDelayDialogOpen(false);
        setSelectedAlert(null);
        setActionReason("");
    };

    const handleReject = () => {
        if (!selectedAlert || !actionReason.trim()) {
            toast.error("Rejection reason is required");
            return;
        }

        setAlerts(prev => prev.map(a =>
            a.id === selectedAlert.id ? { ...a, status: 'REJECTED' as const } : a
        ));

        toast.error(`Replenishment Rejected: ${selectedAlert.id}`, {
            description: actionReason
        });

        setIsRejectDialogOpen(false);
        setSelectedAlert(null);
        setActionReason("");
    };

    const pendingAlerts = alerts.filter(a => a.status === 'PENDING');
    const criticalAlerts = pendingAlerts.filter(a => a.priority === 'CRITICAL');
    const totalPendingCost = pendingAlerts.reduce((sum, a) => sum + a.estimatedCost, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Consumable Threshold Alerts</h1>
                <p className="text-muted-foreground">Manage critical stock levels to prevent service interruption at One-Center counters.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Pending Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pendingAlerts.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Items below 10% threshold</p>
                    </CardContent>
                </Card>

                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Critical ({'<5%'})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">{criticalAlerts.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Immediate action required</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Replenishment Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono">{(totalPendingCost / 1000).toFixed(0)}K Birr</div>
                        <p className="text-xs text-muted-foreground mt-1">Estimated procurement value</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Affected Branches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {new Set(pendingAlerts.flatMap(a => a.affectedBranches)).size}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Locations impacted</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Threshold Alerts</CardTitle>
                    <CardDescription>Consumables that have fallen below the 10% safety threshold</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Stock Level</TableHead>
                                <TableHead>Affected Branches</TableHead>
                                <TableHead>Suggested Qty</TableHead>
                                <TableHead className="text-right">Est. Cost</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.map((alert) => (
                                <TableRow key={alert.id} className={alert.status !== 'PENDING' ? 'opacity-50' : ''}>
                                    <TableCell className="font-mono font-medium">{alert.id}</TableCell>
                                    <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{alert.itemName}</p>
                                            <p className="text-xs text-muted-foreground">{alert.sku} • {alert.category}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-mono">{alert.currentStock}</span>
                                                    <span className={`font-bold ${alert.percentRemaining < 5 ? 'text-destructive' : 'text-amber-500'}`}>
                                                        {alert.percentRemaining}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${alert.percentRemaining < 5 ? 'bg-destructive' : 'bg-amber-500'}`}
                                                        style={{ width: `${alert.percentRemaining}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {alert.affectedBranches.map(branch => (
                                                <Badge key={branch} variant="outline" className="text-xs">
                                                    <Building2 className="w-2 h-2 mr-1" />
                                                    {branch}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono">{alert.suggestedReplenishment}</TableCell>
                                    <TableCell className="text-right font-mono font-medium">
                                        {alert.estimatedCost.toLocaleString()} Birr
                                    </TableCell>
                                    <TableCell>
                                        {alert.status === 'PENDING' && (
                                            <Badge variant="outline" className="gap-1">
                                                <Clock className="w-3 h-3" />Pending
                                            </Badge>
                                        )}
                                        {alert.status === 'APPROVED' && (
                                            <Badge className="bg-emerald-500 gap-1">
                                                <CheckCircle2 className="w-3 h-3" />Approved
                                            </Badge>
                                        )}
                                        {alert.status === 'DELAYED' && (
                                            <Badge className="bg-amber-500 gap-1">
                                                <Clock className="w-3 h-3" />Delayed
                                            </Badge>
                                        )}
                                        {alert.status === 'REJECTED' && (
                                            <Badge variant="destructive">Rejected</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {alert.status === 'PENDING' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedAlert(alert);
                                                    setIsApprovalDialogOpen(true);
                                                }}
                                            >
                                                Review
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Approval Dialog */}
            <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            Review Threshold Alert
                        </DialogTitle>
                        <DialogDescription>
                            Decide whether to approve replenishment to prevent service interruption.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAlert && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Alert ID</Label>
                                    <p className="font-mono font-bold">{selectedAlert.id}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Priority</Label>
                                    <div className="mt-1">{getPriorityBadge(selectedAlert.priority)}</div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs text-muted-foreground">Item</Label>
                                    <p className="font-medium">{selectedAlert.itemName}</p>
                                    <p className="text-xs text-muted-foreground">{selectedAlert.sku} • {selectedAlert.category}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Current Stock</Label>
                                    <p className="font-mono text-lg font-bold text-destructive">{selectedAlert.currentStock}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Threshold</Label>
                                    <p className="font-mono text-lg font-bold">{selectedAlert.thresholdQty}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Remaining %</Label>
                                    <p className={`font-mono text-lg font-bold ${selectedAlert.percentRemaining < 5 ? 'text-destructive' : 'text-amber-500'}`}>
                                        {selectedAlert.percentRemaining}%
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Suggested Replenishment</Label>
                                    <p className="font-mono text-lg font-bold text-emerald-600">{selectedAlert.suggestedReplenishment}</p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs text-muted-foreground">Affected Branches</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedAlert.affectedBranches.map(branch => (
                                            <Badge key={branch} variant="outline">
                                                <Building2 className="w-3 h-3 mr-1" />
                                                {branch}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 border-l-4 border-primary rounded">
                                <Label className="text-xs text-muted-foreground">Estimated Replenishment Cost</Label>
                                <p className="text-2xl font-bold font-mono text-primary">
                                    {selectedAlert.estimatedCost.toLocaleString()} Birr
                                </p>
                            </div>

                            {selectedAlert.priority === 'CRITICAL' && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-bold text-destructive">Critical Stock Level</p>
                                        <p className="text-muted-foreground">Service interruption imminent. Immediate approval recommended.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsApprovalDialogOpen(false);
                                setIsRejectDialogOpen(true);
                            }}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsApprovalDialogOpen(false);
                                setIsDelayDialogOpen(true);
                            }}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Delay
                        </Button>
                        <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve Replenishment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delay Dialog */}
            <Dialog open={isDelayDialogOpen} onOpenChange={setIsDelayDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <Clock className="w-5 h-5" />
                            Delay Replenishment
                        </DialogTitle>
                        <DialogDescription>
                            Provide justification for delaying this replenishment request.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAlert && (
                        <div className="space-y-4">
                            <div className="p-3 bg-muted/30 rounded">
                                <p className="text-sm font-medium">{selectedAlert.itemName}</p>
                                <p className="text-xs text-muted-foreground">{selectedAlert.id} - {selectedAlert.percentRemaining}% remaining</p>
                            </div>

                            <div>
                                <Label htmlFor="delay-reason">Delay Reason *</Label>
                                <Textarea
                                    id="delay-reason"
                                    placeholder="Explain why replenishment should be delayed..."
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    className="mt-1"
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDelayDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleDelay}>
                            Confirm Delay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <TrendingDown className="w-5 h-5" />
                            Reject Replenishment
                        </DialogTitle>
                        <DialogDescription>
                            Provide clear justification for rejecting this threshold alert.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAlert && (
                        <div className="space-y-4">
                            <div className="p-3 bg-muted/30 rounded">
                                <p className="text-sm font-medium">{selectedAlert.itemName}</p>
                                <p className="text-xs text-muted-foreground">{selectedAlert.id} - {selectedAlert.estimatedCost.toLocaleString()} Birr</p>
                            </div>

                            <div>
                                <Label htmlFor="reject-reason">Rejection Reason *</Label>
                                <Textarea
                                    id="reject-reason"
                                    placeholder="Explain why this replenishment cannot be approved..."
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    className="mt-1"
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
