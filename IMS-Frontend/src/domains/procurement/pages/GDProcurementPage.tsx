import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
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
    XCircle,
    Clock,
    DollarSign,
    Package,
    Building2,
    User,
    FileText
} from "lucide-react";
import { toast } from "sonner";

// Mock Data Types
interface ProcurementRequest {
    id: string;
    trigger: 'STOCK_ZERO' | 'BULK_PURCHASE' | 'THRESHOLD_10';
    itemCategory: string;
    sku: string;
    itemName: string;
    requestedQty: number;
    branch: string;
    requestedBy: string;
    requestedByRole: string;
    justification: string;
    estimatedCost: number;
    status: 'PENDING_GD' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    currentStock: number;
}

// Mock Procurement Requests
const MOCK_REQUESTS: ProcurementRequest[] = [
    {
        id: 'PR-001',
        trigger: 'STOCK_ZERO',
        itemCategory: 'Office Supplies',
        sku: 'SKU-1234',
        itemName: 'A4 Paper (500 sheets/box)',
        requestedQty: 200,
        branch: 'Arada Branch',
        requestedBy: 'Alemayehu Tadesse',
        requestedByRole: 'STOREKEEPER',
        justification: 'Stock depleted. Cannot fulfill employee requisitions. Service counter halted.',
        estimatedCost: 45000,
        status: 'PENDING_GD',
        createdAt: '2024-01-04T10:30:00',
        currentStock: 0
    },
    {
        id: 'PR-002',
        trigger: 'THRESHOLD_10',
        itemCategory: 'Consumables',
        sku: 'SKU-5678',
        itemName: 'Printer Toner (HP LaserJet)',
        requestedQty: 50,
        branch: 'HQ',
        requestedBy: 'Tigist Bekele',
        requestedByRole: 'STOREKEEPER',
        justification: 'Critical threshold reached (8% remaining). Bulk purchase for cost efficiency.',
        estimatedCost: 125000,
        status: 'PENDING_GD',
        createdAt: '2024-01-04T09:15:00',
        currentStock: 8
    },
    {
        id: 'PR-003',
        trigger: 'BULK_PURCHASE',
        itemCategory: 'IT Equipment',
        sku: 'SKU-9012',
        itemName: 'Dell Latitude 5420 Laptop',
        requestedQty: 100,
        branch: 'HQ',
        requestedBy: 'Dawit Hailu',
        requestedByRole: 'DIRECTOR',
        justification: 'Annual procurement for new employee onboarding program. Negotiated bulk discount.',
        estimatedCost: 25000000,
        status: 'PENDING_GD',
        createdAt: '2024-01-03T14:20:00',
        currentStock: 15
    },
    {
        id: 'PR-004',
        trigger: 'STOCK_ZERO',
        itemCategory: 'Consumables',
        sku: 'SKU-3456',
        itemName: 'Staples (Box of 5000)',
        requestedQty: 100,
        branch: 'Bole Branch',
        requestedBy: 'Sara Mohammed',
        requestedByRole: 'STOREKEEPER',
        justification: 'Zero stock. Essential for document processing at One-Center.',
        estimatedCost: 8500,
        status: 'PENDING_GD',
        createdAt: '2024-01-04T08:00:00',
        currentStock: 0
    },
    {
        id: 'PR-005',
        trigger: 'THRESHOLD_10',
        itemCategory: 'Office Furniture',
        sku: 'SKU-7890',
        itemName: 'Ergonomic Office Chair',
        requestedQty: 30,
        branch: 'Lideta Branch',
        requestedBy: 'Yonas Girma',
        requestedByRole: 'TEAM_LEADER',
        justification: 'Stock at 9%. New branch expansion requires immediate furniture procurement.',
        estimatedCost: 450000,
        status: 'PENDING_GD',
        createdAt: '2024-01-02T16:45:00',
        currentStock: 12
    }
];

export default function GDProcurementPage() {
    const [requests, setRequests] = useState<ProcurementRequest[]>(MOCK_REQUESTS);
    const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const getTriggerBadge = (trigger: string) => {
        switch (trigger) {
            case 'STOCK_ZERO':
                return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Stock = 0</Badge>;
            case 'THRESHOLD_10':
                return <Badge className="bg-amber-500 gap-1"><Clock className="w-3 h-3" />{'<10%'}</Badge>;
            case 'BULK_PURCHASE':
                return <Badge variant="outline" className="gap-1"><Package className="w-3 h-3" />Bulk</Badge>;
            default:
                return null;
        }
    };

    const handleApprove = () => {
        if (!selectedRequest) return;

        setRequests(prev => prev.map(r =>
            r.id === selectedRequest.id ? { ...r, status: 'APPROVED' as const } : r
        ));

        toast.success(`Procurement ${selectedRequest.id} Approved`, {
            description: `${selectedRequest.itemName} - ${selectedRequest.estimatedCost.toLocaleString()} Birr`
        });

        setIsApprovalDialogOpen(false);
        setSelectedRequest(null);
    };

    const handleReject = () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            toast.error("Rejection reason is required");
            return;
        }

        setRequests(prev => prev.map(r =>
            r.id === selectedRequest.id ? { ...r, status: 'REJECTED' as const } : r
        ));

        toast.error(`Procurement ${selectedRequest.id} Rejected`, {
            description: rejectionReason
        });

        setIsRejectDialogOpen(false);
        setSelectedRequest(null);
        setRejectionReason("");
    };

    const pendingRequests = requests.filter(r => r.status === 'PENDING_GD');
    const totalPendingValue = pendingRequests.reduce((sum, r) => sum + r.estimatedCost, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Procurement Approval Queue</h1>
                <p className="text-muted-foreground">Review and approve "Ask-to-Buy" requests requiring GD authorization.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pendingRequests.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting GD signature</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Total Pending Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono">{(totalPendingValue / 1000000).toFixed(1)}M Birr</div>
                        <p className="text-xs text-muted-foreground mt-1">Organizational spending on hold</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Critical (Stock=0)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">
                            {pendingRequests.filter(r => r.trigger === 'STOCK_ZERO').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Immediate action required</p>
                    </CardContent>
                </Card>
            </div>

            {/* Requests Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Procurement Requests</CardTitle>
                    <CardDescription>All requests requiring General Director approval</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Trigger</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Requested By</TableHead>
                                <TableHead className="text-right">Est. Cost</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow key={request.id} className={request.status !== 'PENDING_GD' ? 'opacity-50' : ''}>
                                    <TableCell className="font-mono font-medium">{request.id}</TableCell>
                                    <TableCell>{getTriggerBadge(request.trigger)}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{request.itemName}</p>
                                            <p className="text-xs text-muted-foreground">{request.sku}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono">{request.requestedQty}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Building2 className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-sm">{request.branch}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-sm">{request.requestedBy}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium">
                                        {request.estimatedCost.toLocaleString()} Birr
                                    </TableCell>
                                    <TableCell>
                                        {request.status === 'PENDING_GD' && (
                                            <Badge variant="outline" className="gap-1">
                                                <Clock className="w-3 h-3" />Pending
                                            </Badge>
                                        )}
                                        {request.status === 'APPROVED' && (
                                            <Badge className="bg-emerald-500 gap-1">
                                                <CheckCircle2 className="w-3 h-3" />Approved
                                            </Badge>
                                        )}
                                        {request.status === 'REJECTED' && (
                                            <Badge variant="destructive" className="gap-1">
                                                <XCircle className="w-3 h-3" />Rejected
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {request.status === 'PENDING_GD' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setIsApprovalDialogOpen(true);
                                                    }}
                                                >
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    Review
                                                </Button>
                                            </div>
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
                            <DollarSign className="w-5 h-5 text-primary" />
                            Review Procurement Request
                        </DialogTitle>
                        <DialogDescription>
                            Carefully review all details before authorizing organizational spending.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Request ID</Label>
                                    <p className="font-mono font-bold">{selectedRequest.id}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Trigger</Label>
                                    <div className="mt-1">{getTriggerBadge(selectedRequest.trigger)}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Item</Label>
                                    <p className="font-medium">{selectedRequest.itemName}</p>
                                    <p className="text-xs text-muted-foreground">{selectedRequest.sku}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Category</Label>
                                    <p className="font-medium">{selectedRequest.itemCategory}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Requested Quantity</Label>
                                    <p className="font-mono text-lg font-bold">{selectedRequest.requestedQty}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Current Stock</Label>
                                    <p className={`font-mono text-lg font-bold ${selectedRequest.currentStock === 0 ? 'text-destructive' : ''}`}>
                                        {selectedRequest.currentStock}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Branch</Label>
                                    <p className="font-medium">{selectedRequest.branch}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Requested By</Label>
                                    <p className="font-medium">{selectedRequest.requestedBy}</p>
                                    <p className="text-xs text-muted-foreground">{selectedRequest.requestedByRole}</p>
                                </div>
                            </div>

                            <div>
                                <Label>Justification</Label>
                                <p className="mt-1 p-3 bg-muted/20 rounded border text-sm">{selectedRequest.justification}</p>
                            </div>

                            <div className="p-4 bg-primary/5 border-l-4 border-primary rounded">
                                <Label className="text-xs text-muted-foreground">Estimated Cost</Label>
                                <p className="text-2xl font-bold font-mono text-primary">
                                    {selectedRequest.estimatedCost.toLocaleString()} Birr
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setIsApprovalDialogOpen(false);
                                setIsRejectDialogOpen(true);
                            }}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                        <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve Procurement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <XCircle className="w-5 h-5" />
                            Reject Procurement Request
                        </DialogTitle>
                        <DialogDescription>
                            Provide a clear justification for rejecting this request.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="p-3 bg-muted/30 rounded">
                                <p className="text-sm font-medium">{selectedRequest.itemName}</p>
                                <p className="text-xs text-muted-foreground">{selectedRequest.id} - {selectedRequest.estimatedCost.toLocaleString()} Birr</p>
                            </div>

                            <div>
                                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                                <Textarea
                                    id="rejection-reason"
                                    placeholder="Explain why this procurement cannot be approved..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
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
