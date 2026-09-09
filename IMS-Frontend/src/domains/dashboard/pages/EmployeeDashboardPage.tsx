import { useState, useRef } from "react";
import { useAuthStore } from "@/state/auth.store";
import { useInventoryStore } from "@/domains/inventory/store";
import { useRequestStore } from "@/domains/requisitions/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label"; // Check if Label exists or use standard label
import { Laptop, AlertTriangle, Plus, Clock, CheckCircle2, XCircle, Package, QrCode } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { cn } from "@/shared/utils/utils";
import { Requisition, Asset } from "@/shared/types";
import { toast } from "sonner"; // Assuming sonner is used

// --- Sub-Components ---

const RequestProgressBar = ({ request }: { request: Requisition }) => {
    const steps = [
        { id: 'PENDING_TL', label: 'Team Lead' },
        { id: 'PENDING_DIRECTOR', label: 'Director' },
        { id: 'PENDING_DGD', label: 'DGD' },
        { id: 'APPROVED', label: 'Approved' }
    ];

    // Helper to determine step status
    const getStepStatus = (stepId: string, index: number) => {
        if (request.status === 'REJECTED') return 'error';
        if (request.status === 'APPROVED') return 'completed';
        if (request.status === stepId) return 'current';

        // If request is past this step
        const currentStepIndex = steps.findIndex(s => s.id === request.status);
        if (currentStepIndex > index) return 'completed';

        return 'pending';
    };

    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />

                {steps.map((step, idx) => {
                    const status = getStepStatus(step.id, idx);
                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all",
                                status === 'completed' ? "bg-primary border-primary text-primary-foreground" :
                                    status === 'current' ? "bg-amber-100 border-amber-500 text-amber-700 animate-pulse" :
                                        status === 'error' ? "bg-red-100 border-red-500 text-red-700" :
                                            "bg-gray-50 border-gray-300 text-gray-400"
                            )}>
                                {status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> :
                                    status === 'error' ? <XCircle className="w-3 h-3" /> :
                                        idx + 1}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium whitespace-nowrap",
                                status === 'current' ? "text-amber-700" : "text-muted-foreground"
                            )}>{step.label}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

import { useIncidentStore } from "@/domains/maintenance/store";

const MaintenanceTicketForm = ({ asset, onClose }: { asset: Asset, onClose: () => void }) => {
    const [issue, setIssue] = useState("");
    const [evidence, setEvidence] = useState<string | null>(null);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const { updateAssetStatus } = useInventoryStore();
    const { reportIncident } = useIncidentStore(); // Connect to real store
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        // 1. generate random ID for local display (store generates its own, but for sync visual we can mock or use store's return if async)
        // ideally store returns ID, but we set it here for simplicity of the success view
        const newTicketId = `MT-${Math.floor(1000 + Math.random() * 9000)}`;
        setTicketId(newTicketId);

        console.log("Creating ticket:", newTicketId, "for:", asset.id);

        // 2. Update Inventory Status
        updateAssetStatus(asset.id, 'MAINTENANCE');

        // 3. Create Real Incident in Maintenance Store
        reportIncident({
            assetId: asset.id,
            assetName: asset.name,
            reporterId: user?.id || 'unknown',
            reporterName: user?.fullName || 'Unknown',
            type: 'MALFUNCTION', // Defaulting for now dialog doesn't ask type
            description: issue,
            priority: 'MEDIUM', // Default
            // technical fields left empty
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setEvidence(objectUrl);
        }
    };

    if (ticketId) {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-emerald-900">Ticket Generated!</h3>
                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                        Your maintenance request has been logged successfully.
                    </p>
                </div>

                <div className="bg-muted p-4 rounded-lg w-full text-center border-dashed border-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Ticket ID</span>
                    <div className="text-3xl font-mono font-black text-primary mt-1 tracking-wider">
                        #{ticketId}
                    </div>
                </div>

                <DialogFooter className="w-full mt-4">
                    <Button onClick={onClose} className="w-full">Done</Button>
                </DialogFooter>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <p className="text-sm font-medium">Asset Details</p>
                <div className="p-2 bg-muted rounded text-xs font-mono">{asset.name} (SN: {asset.serialNumber})</div>
            </div>
            <div className="space-y-2">
                <p className="text-sm font-medium">Describe the Issue</p>
                <Textarea
                    placeholder="e.g., Screen flickering, Keypad not responsive..."
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <p className="text-sm font-medium">Evidence (Photo)</p>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 cursor-pointer transition-colors relative overflow-hidden min-h-[100px] flex items-center justify-center"
                >
                    {evidence ? (
                        <div className="relative w-full h-full">
                            <img src={evidence} alt="Evidence" className="max-h-[200px] mx-auto rounded-md object-contain" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                <span className="text-white text-xs font-medium">Change Photo</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <Plus className="w-6 h-6" />
                            <span className="text-xs">Tap to upload damage photo</span>
                        </div>
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit} disabled={!issue}>Generate Ticket</Button>
            </DialogFooter>
        </div>
    );
};

const ReturnRequestForm = ({ asset, onClose }: { asset: Asset, onClose: () => void }) => {
    return (
        <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-100 rounded text-amber-800 text-xs">
                You are initiating a return for <strong>{asset.name}</strong>. This item will remain in your custody until physically handed over to a Storekeeper.
            </div>
            <div className="space-y-2">
                <Label>Reason for Return</Label>
                <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option>No longer needed</option>
                    <option>Resignation / Exit</option>
                    <option>Project Complete</option>
                    <option>Defective / Scrapped</option>
                </select>
            </div>
            <DialogFooter>
                <Button variant="destructive" onClick={() => { toast.success("Return initiated. Visit Storekeeper."); onClose(); }}>
                    Confirm Return
                </Button>
            </DialogFooter>
        </div>
    );
}

const DigitalAssetCard = ({ asset }: { asset: Asset }) => (
    <div className="flex flex-col items-center space-y-4 py-4">
        <div className="w-48 h-48 bg-white p-2 rounded-xl border-4 border-black">
            <div className="w-full h-full bg-black flex items-center justify-center">
                {/* Mock QR */}
                <QrCode className="text-white w-32 h-32" />
            </div>
        </div>
        <div className="text-center">
            <h3 className="font-bold text-lg">{asset.name}</h3>
            <p className="font-mono text-sm text-muted-foreground">{asset.serialNumber}</p>
            <Badge className="mt-2 text-xs" variant="secondary">CUSTODY CONFIRMED</Badge>
        </div>
        <div className="text-[10px] text-muted-foreground text-center max-w-[200px]">
            Scan this code at Audit Checkpoints to verify authorized possession.
        </div>
    </div>
);


const ProfileDialog = ({ user, onClose }: { user: any, onClose: () => void }) => {
    // Mock Data from Fayda
    const phone = "+251 91 123 4567";
    const emergencyName = "Abebe Kebede";
    const emergencyPhone = "+251 91 000 0000";

    return (
        <div className="space-y-4 py-2">
            <div className="flex items-center gap-4 border-b pb-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">👤</div>
                <div>
                    <h3 className="font-bold text-lg">{user.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{user.role} • {user.department?.replace('_', ' ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{user.faydaId}</Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 flex gap-1 items-center px-1.5 h-5 text-[10px]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            Fayda Verified
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 py-2 opacity-80 pointer-events-none select-none">
                <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <div className="relative">
                        <input
                            id="phone"
                            readOnly
                            value={phone}
                            className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                        />
                        <div className="absolute right-3 top-2.5 text-muted-foreground opacity-50">
                            🔒
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="font-medium text-sm text-muted-foreground">Emergency Contact (Next of Kin)</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Full Name</Label>
                            <input
                                readOnly
                                value={emergencyName}
                                className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Emergency Contact Number</Label>
                            <input
                                readOnly
                                value={emergencyPhone}
                                className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
            </DialogFooter>
        </div>
    );
};


const ViewActiveTicket = ({ asset, onClose }: { asset: Asset, onClose: () => void }) => {
    // Mock Ticket Details based on asset
    const ticketId = `MT-${asset.id.split('-').pop()?.padEnd(4, '0')}`;
    const reportDate = new Date();
    reportDate.setDate(reportDate.getDate() - 2); // Mock: Reported 2 days ago

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Active Ticket</span>
                    <div className="text-2xl font-black text-amber-900 mt-1">#{ticketId}</div>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                    <Clock className="w-6 h-6 text-amber-600" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs">Asset</span>
                        <span className="font-medium">{asset.name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs">Reported On</span>
                        <span className="font-medium">{format(reportDate, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs">Status</span>
                        <Badge className="w-fit bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                            In Progress
                        </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs">Technician</span>
                        <span className="font-medium">Unassigned</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Latest Update</span>
                    <div className="p-3 bg-muted rounded-md text-sm border-l-4 border-l-primary">
                        "Asset received at ICT workshop. Diagnostic checks pending."
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
            </DialogFooter>
        </div>
    );
};

const AssetCard = ({ asset }: { asset: Asset }) => {
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
    const [isReturnOpen, setIsReturnOpen] = useState(false);
    const [isQROpen, setIsQROpen] = useState(false);

    const isUnderMaintenance = asset.status === 'MAINTENANCE';

    return (
        <Card className="overflow-hidden group">
            <CardHeader className="pb-2 bg-gray-50/50">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-background">{asset.category}</Badge>
                    <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1 text-muted-foreground hover:text-black">
                                <QrCode className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-center">Digital Asset Identity</DialogTitle>
                            </DialogHeader>
                            <DigitalAssetCard asset={asset} />
                        </DialogContent>
                    </Dialog>
                </div>
                <CardTitle className="text-base mt-2 truncate">{asset.name}</CardTitle>
                <CardDescription className="font-mono text-xs">{asset.serialNumber || 'No Serial'}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                    <span>Issued:</span>
                    <span className="font-medium text-foreground">{asset.purchaseDate}</span>
                </div>
                <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={asset.status === 'ISSUED' ? 'secondary' : asset.status === 'MAINTENANCE' ? 'destructive' : 'outline'} className="text-[10px] h-5 px-1.5">
                        {asset.status}
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="pt-0 grid grid-cols-2 gap-2">
                <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
                    <DialogTrigger asChild>
                        {isUnderMaintenance ? (
                            <Button variant="secondary" size="sm" className="w-full text-xs h-8 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100">
                                <Clock className="w-3 h-3 mr-1.5" />
                                View Ticket
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                <AlertTriangle className="w-3 h-3 mr-1.5 text-amber-500" />
                                Report
                            </Button>
                        )}
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isUnderMaintenance ? 'Maintenance Status' : 'Report Maintenance Issue'}</DialogTitle>
                            {isUnderMaintenance ? (
                                <DialogDescription>Tracking details for your active request.</DialogDescription>
                            ) : (
                                <DialogDescription>Submit a ticket and upload evidence.</DialogDescription>
                            )}
                        </DialogHeader>
                        {isUnderMaintenance ? (
                            <ViewActiveTicket asset={asset} onClose={() => setIsMaintenanceOpen(false)} />
                        ) : (
                            <MaintenanceTicketForm asset={asset} onClose={() => setIsMaintenanceOpen(false)} />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200" disabled={isUnderMaintenance}>
                            Return
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Return Asset</DialogTitle>
                        </DialogHeader>
                        <ReturnRequestForm asset={asset} onClose={() => setIsReturnOpen(false)} />
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
};

export default function EmployeeDashboardPage() {
    const { user } = useAuthStore();
    const { getAssetsByHolder } = useInventoryStore();
    const { requisitions } = useRequestStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    if (!user) return null;

    const myAssets = getAssetsByHolder(user.id);
    const myRequests = requisitions
        .filter(r => r.requesterId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const readyForCollection = myRequests.filter(r => r.status === 'APPROVED' && !r.dispatchedAt);

    return (
        <div className="space-y-6 pb-20">

            {/* Header with Universal Profile */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Work</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Welcome, {user.fullName} • {user.faydaId}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <span className="mr-2">👤</span> Profile & Emergency
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>My Profile</DialogTitle>
                                <DialogDescription>Contact details.</DialogDescription>
                            </DialogHeader>
                            <ProfileDialog user={user} onClose={() => setIsProfileOpen(false)} />
                        </DialogContent>
                    </Dialog>
                    <Link href="/requests">
                        <Button className="shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" />
                            New Asset Ask
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Ready for Collection Alert */}
            {readyForCollection.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-900">Ready for Collection</h3>
                            <p className="text-sm text-emerald-700">
                                {readyForCollection.length} request(s) approved. Visit the Storekeeper with your OTP.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {readyForCollection.map(req => (
                            <Dialog key={req.id}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                                        View OTP ({req.items[0].name})
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Collection OTP</DialogTitle>
                                        <DialogDescription>Show this code to the Storekeeper.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-8 flex flex-col items-center justify-center bg-muted/50 rounded-xl border border-dashed my-4">
                                        <span className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Passcode</span>
                                        <span className="text-5xl font-mono font-black tracking-widest text-primary">829412</span>
                                        <span className="text-[10px] text-muted-foreground mt-2">(Mock Generated Code)</span>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>
                </div>
            )}

            <Tabs defaultValue="inventory" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="inventory" className="gap-2">
                        <Laptop className="w-4 h-4" /> My Assets ({myAssets.length})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                        <Clock className="w-4 h-4" /> Request History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-6">
                    {myAssets.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-lg">No Assets Assigned</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
                                You currently don't have any assets in your custody. Need something?
                            </p>
                            <Link href="/requests"><Button variant="outline">Request Asset</Button></Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {myAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <div className="space-y-4">
                        {myRequests.map((req) => {
                            const rejectionReason = req.approvalSteps.find(s => s.status === 'REJECTED')?.comments;
                            return (
                                <Card key={req.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between">
                                            <div>
                                                <CardTitle className="text-base">{req.items[0].name}</CardTitle>
                                                <CardDescription>x{req.items[0].quantity} • {format(new Date(req.createdAt), 'MMM dd, yyyy')}</CardDescription>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {(req.status === 'APPROVED' || req.status === 'PENDING_TL' || req.status === 'PENDING_DIR' || req.status === 'PENDING_DGD') && !req.dispatchedAt && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" variant="outline" className="h-6 text-[10px] border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                                                                View OTP
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Request Security Code</DialogTitle>
                                                                <DialogDescription>Use this code for request verification and collection.</DialogDescription>
                                                            </DialogHeader>
                                                            <div className="py-8 flex flex-col items-center justify-center bg-muted/50 rounded-xl border border-dashed my-4">
                                                                <span className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Passcode</span>
                                                                <span className="text-5xl font-mono font-black tracking-widest text-primary">829412</span>
                                                                <span className="text-[10px] text-muted-foreground mt-2">(Mock Generated Code)</span>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                                <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'outline'}>
                                                    {req.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <RequestProgressBar request={req} />
                                        {rejectionReason && (
                                            <div className="mt-2 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100 flex items-start gap-2">
                                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                                <div>
                                                    <span className="font-bold">Rejected:</span> {rejectionReason}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
