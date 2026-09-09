import { useState } from "react";
import { useAuthStore } from "@/state/auth.store";
import { useIncidentStore, Incident } from "@/domains/maintenance/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Slider } from "@/shared/ui/slider";
import { Input } from "@/shared/ui/input";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Wrench,
    Clock
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { toast } from "sonner";

const SPARE_PARTS = [
    { id: 'SP-001', name: 'Latitude 5420 Screen', stock: 3, min: 5, category: 'Hardware' },
    { id: 'SP-002', name: 'USB-C Docking Station', stock: 12, min: 10, category: 'Accessory' },
    { id: 'SP-003', name: 'SSD 512GB NVMe', stock: 0, min: 8, category: 'Storage' },
    { id: 'SP-004', name: 'RJ45 Crimping Tool', stock: 5, min: 2, category: 'Tool' },
];

// Helper to calculate SLA time
const SLATimer = ({ dateStr }: { dateStr: string }) => {
    // For demo purposes, we treat the dateStr as if it happened at 00:00 today if typical date string
    const start = new Date(dateStr).getTime();
    const now = new Date().getTime();
    // Use Math.abs to handle potential timezone weirdness in mock data
    const diffHours = Math.floor(Math.abs(now - start) / (1000 * 60 * 60));

    let color = "text-emerald-600 font-bold";
    let text = "On Track";

    if (diffHours > 48) {
        color = "text-red-500 font-bold animate-pulse";
        text = "SLA BREACH";
    } else if (diffHours > 24) {
        color = "text-amber-500 font-bold";
        text = "At Risk";
    }

    return (
        <div className="flex flex-col items-end min-w-[80px]">
            <div className="flex items-center gap-1 text-xs font-mono bg-muted px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                <span>{diffHours}h open</span>
            </div>
            <span className={cn("text-[10px] uppercase tracking-wider mt-1", color)}>
                {text}
            </span>
        </div>
    );
};

const TicketActionForm = ({ ticket, onClose }: { ticket: Incident, onClose: () => void }) => {
    const { updateIncident, incidents } = useIncidentStore();
    const [notes, setNotes] = useState(ticket.technicalNotes || "");
    const [action, setAction] = useState<'diagnose' | 'complete' | 'scrap' | 'handover'>('diagnose');
    const [healthScore, setHealthScore] = useState(ticket.healthScore || 85);
    const [otp, setOtp] = useState("");

    // Derived Asset History
    const assetHistory = incidents.filter(i => i.assetId === ticket.assetId && i.id !== ticket.id);
    const isReadyForPickup = ticket.status === 'READY_FOR_PICKUP';

    const handleSubmit = () => {
        if (!isReadyForPickup && action === 'diagnose') {
            updateIncident(ticket.id, {
                status: 'In Progress',
                technicalNotes: notes,
                assignedTo: 'ME',
                healthScore
            });
            toast.success("Diagnostic log updated. Asset status: In Progress");
        } else if (!isReadyForPickup && action === 'complete') {
            // "Repair Complete" -> Ready for Pickup
            updateIncident(ticket.id, {
                status: 'READY_FOR_PICKUP',
                technicalNotes: notes,
                resolution: 'Pending Handover',
                handoverOtp: '9988' // MOCK OTP for demo
            });
            toast.success("Repair Complete. User notified to collect with OTP.");
        } else if (isReadyForPickup) {
            // Handover flow
            if (otp === '9988') { // Mock check
                updateIncident(ticket.id, {
                    status: 'RESOLVED',
                    resolvedAt: new Date().toISOString(),
                    resolution: 'Handover Verified'
                });
                toast.success("OTP Verified. Ticket Closed.");
            } else {
                toast.error("Invalid OTP. Handover failed.");
                return; // Don't close
            }
        }

        onClose();
    };

    const handleExtendLife = () => {
        toast.success("Asset EOL extended by 1 year.", { description: "Updated in master asset registry." });
    };

    const handleFileUpload = () => {
        toast.success("Evidence photo uploaded.");
    };

    return (
        <div className="space-y-6">
            <div className="p-3 bg-muted rounded-md text-xs font-mono flex justify-between">
                <div>
                    <strong>Asset:</strong> {ticket.assetName} <br />
                    <strong>Issue:</strong> {ticket.description}
                </div>
                <div className="text-right">
                    <Badge variant={ticket.warrantyStatus === 'Expired' ? 'destructive' : 'outline'} className="mb-1">
                        {ticket.warrantyStatus || 'Warranty Valid'}
                    </Badge>
                </div>
            </div>

            {isReadyForPickup ? (
                <div className="py-8 text-center space-y-4">
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold">Asset Ready for Handover</h3>
                    <p className="text-sm text-muted-foreground">Ask Employee for their 4-digit pickup code.</p>
                    <div className="flex justify-center gap-2 max-w-[200px] mx-auto">
                        <Input
                            className="bg-muted text-center text-2xl tracking-widest font-mono"
                            maxLength={4}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="0-0-0-0"
                        />
                    </div>
                </div>
            ) : (
                <Tabs defaultValue="action" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="action">Resolution</TabsTrigger>
                        <TabsTrigger value="history">Asset History ({assetHistory.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="action" className="space-y-4 pt-4">
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={action === 'diagnose' ? 'default' : 'outline'}
                                onClick={() => setAction('diagnose')}
                                className="text-xs"
                            >
                                <Activity className="w-3 h-3 mr-1" /> Diagnose
                            </Button>
                            <Button
                                variant={action === 'complete' ? 'default' : 'outline'}
                                onClick={() => setAction('complete')}
                                className="text-xs"
                            >
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Finish Repair
                            </Button>
                            <Button
                                variant={action === 'scrap' ? 'destructive' : 'outline'}
                                onClick={() => setAction('scrap')}
                                className="text-xs"
                            >
                                <AlertTriangle className="w-3 h-3 mr-1" /> Scrap
                            </Button>
                        </div>

                        {/* Health Score & Diagnostics */}
                        <div className="space-y-4 border p-4 rounded-lg bg-gray-50/50">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Asset Health Score</Label>
                                    <span className={cn("text-xs font-bold", healthScore < 50 ? "text-red-500" : "text-emerald-600")}>
                                        {healthScore}/100
                                    </span>
                                </div>
                                <Slider
                                    value={[healthScore]}
                                    onValueChange={(vals) => setHealthScore(vals[0])}
                                    max={100}
                                    step={5}
                                    className="py-2"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Diagnostic Evidence</Label>
                                <Button size="sm" variant="secondary" onClick={handleFileUpload} className="h-6 text-[10px]">
                                    Upload Photo
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Technical Notes / Parts Used</Label>
                            <Textarea
                                placeholder="e.g. Replaced thermal paste, ran diagnostics..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="ghost" size="sm" onClick={handleExtendLife} className="text-xs text-blue-600">
                                <Calendar className="w-3 h-3 mr-1" /> Extend End-of-Life
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="pt-4">
                        <div className="flex items-center justify-between mb-4 p-3 bg-muted/40 rounded-lg border">
                            <div>
                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Life Story</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold">{assetHistory.length}</span>
                                    <span className="text-xs text-muted-foreground">Previous Breakdowns</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground mb-1">
                                    <Wrench className="w-3 h-3" /> Last Technician
                                </div>
                                <span className="font-medium text-sm">
                                    {assetHistory.length > 0 ? (assetHistory[0].assignedTo || 'Unknown') : '—'}
                                </span>
                            </div>
                        </div>

                        {assetHistory.length === 0 ? (
                            <div className="text-center text-muted-foreground text-sm py-8">
                                No previous incidents for this asset.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                {assetHistory.map(h => (
                                    <div key={h.id} className="text-xs border-b pb-2 last:border-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold">{h.dateReported}</span>
                                            <Badge variant="outline" className="scale-90">{h.type}</Badge>
                                        </div>
                                        <p className="text-muted-foreground mb-1">{h.description}</p>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground bg-muted/30 p-1.5 rounded">
                                            <span>Resolution: {h.resolution || 'Pending'}</span>
                                            <span className="font-mono">Tech: {h.assignedTo || '—'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}

            <DialogFooter>
                <Button onClick={handleSubmit} className="w-full">
                    {isReadyForPickup
                        ? 'Verify OTP & Close Ticket'
                        : action === 'diagnose' ? 'Update Diagnostics'
                            : action === 'complete' ? 'Request Pickup (Notify User)'
                                : 'Recommend Scrap'}
                </Button>
            </DialogFooter>
        </div>
    );
};

export default function MaintenanceDashboardPage() {
    const { user } = useAuthStore();
    const { incidents, getQueueStats } = useIncidentStore();
    const userBranch = user?.branch || 'HQ';
    const stats = getQueueStats(userBranch);
    const activeQueue = incidents
        .filter(i => i.branch === userBranch) // Strict Branch Filter
        .filter(i => i.status !== 'RESOLVED' && i.status !== 'RETIRED_ASSET')
        .sort((a, b) => {
            // CRITICAL first
            const prio = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
            return prio[a.priority] - prio[b.priority];
        });

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Wrench className="w-6 h-6" /> System Guardian Hub
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-primary/20 text-muted-foreground">
                            {userBranch} COMMAND
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                            Maintenance & Technical Operations • {user?.fullName}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs">Open Tickets</span>
                        <span className="font-bold text-lg">{stats.open}</span>
                    </div>
                    <div className="w-px bg-border h-10"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs">Critical</span>
                        <span className="font-bold text-lg text-red-600">{stats.critical}</span>
                    </div>
                    <div className="w-px bg-border h-10"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs">Avg Resolution</span>
                        <span className="font-bold text-lg text-emerald-600">{stats.avgTime}</span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="queue" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="queue" className="gap-2">
                        <Activity className="w-4 h-4" /> Active Queue ({activeQueue.length})
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2">
                        <Calendar className="w-4 h-4" /> Health Calendar
                    </TabsTrigger>
                    <TabsTrigger value="parts" className="gap-2">
                        <Wrench className="w-4 h-4" /> Spare Parts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="queue" className="space-y-4">
                    {activeQueue.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gray-50">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <h3 className="font-medium text-lg">All Systems Operational</h3>
                            <p className="text-muted-foreground">No pending maintenance tickets.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {activeQueue.map(ticket => (
                                <Card key={ticket.id} className={cn(
                                    "border-l-4 transition-all hover:shadow-md",
                                    ticket.priority === 'CRITICAL' ? "border-l-red-500 bg-red-50/10" :
                                        ticket.priority === 'HIGH' ? "border-l-orange-500" :
                                            "border-l-blue-500"
                                )}>
                                    <div className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={ticket.priority === 'CRITICAL' ? 'destructive' : 'secondary'} className="uppercase text-[10px]">
                                                    {ticket.priority}
                                                </Badge>
                                                <span className="font-mono text-xs text-muted-foreground">• {ticket.id}</span>
                                                <span className="text-xs text-muted-foreground">• {ticket.dateReported}</span>
                                            </div>
                                            <h3 className="font-bold text-base">{ticket.description}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">{ticket.assetName}</span> • Reported by {ticket.reporterName}
                                            </p>
                                        </div>

                                        {/* SLA Timer */}
                                        <SLATimer dateStr={ticket.dateReported} />

                                        <div className="flex items-center gap-3">
                                            {ticket.status !== 'REPORTED' && (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                                                    {ticket.status}
                                                </Badge>
                                            )}

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm">Take Action</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Update Ticket {ticket.id}</DialogTitle>
                                                        <DialogDescription>Log diagnostics, parts, or resolve.</DialogDescription>
                                                    </DialogHeader>
                                                    <TicketActionForm ticket={ticket} onClose={() => { }} />
                                                    {/* Note: onClose in DialogContent triggers strict mode warning in some setups, but Dialog handles close via trigger usually. 
                                                        We need to pass a real closer if we want programmatic close. 
                                                        For now relying on user clicking outside or we can wire up a setOpen state per card if needed.
                                                        Actually, let's just let the form be strictly controlled by the Dialog.
                                                    */}
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="calendar">
                    {/* Calendar Content (unchanged) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preventative Maintenance Schedule</CardTitle>
                            <CardDescription>Upcoming generated tasks based on asset health scores.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { date: 'Today', task: 'Server Room A - Dust Filter Clean', status: 'Pending' },
                                    { date: 'Tomorrow', task: 'Biometric Scanners - Calibration (HQ)', status: 'Scheduled' },
                                    { date: 'Fri, Oct 24', task: 'Firewall Firmware Update - v4.2.1', status: 'Scheduled' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-background border p-2 rounded text-center min-w-[60px]">
                                                <span className="text-xs font-bold block">{item.date.split(' ')[0]}</span>
                                                <span className="text-[10px] text-muted-foreground">{item.date.split(' ').slice(1).join(' ')}</span>
                                            </div>
                                            <span className="font-medium text-sm">{item.task}</span>
                                        </div>
                                        <Button variant="ghost" size="sm">Details</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="parts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Maintenance Inventory</CardTitle>
                            <CardDescription>Spare parts and tools available in the tech lab.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {SPARE_PARTS.map(part => (
                                    <div key={part.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm">{part.name}</h4>
                                                <Badge variant="outline" className="text-[10px]">{part.category}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">ID: {part.id}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <span className={cn("text-xl font-bold block", part.stock === 0 ? "text-red-500" : part.stock < part.min ? "text-amber-500" : "text-emerald-600")}>
                                                    {part.stock}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase">In Stock</span>
                                            </div>
                                            <Button size="sm" variant={part.stock === 0 ? "destructive" : "outline"} disabled={part.stock > 0}>
                                                {part.stock === 0 ? "Restock" : "Request"}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
