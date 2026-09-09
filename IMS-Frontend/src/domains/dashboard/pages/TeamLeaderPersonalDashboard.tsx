import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useAuthStore } from "@/state/auth.store";
import { useInventoryStore } from "@/domains/inventory/store";
import { useRequestStore } from "@/domains/requisitions/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/shared/ui/dialog";
import {
    Laptop,
    ArrowRight,
    Package,
    ShieldCheck,
    Zap,
    Users,
    CheckCircle
} from "lucide-react";
import { getTeamName } from "@/shared/utils/teamMapping";
import { format } from "date-fns";

export default function TeamLeaderPersonalDashboard() {
    const { user, users } = useAuthStore();
    const { getAssetsByHolder, assets } = useInventoryStore();
    const { requisitions } = useRequestStore();

    if (!user || user.role !== 'TEAM_LEADER' || !user.team) return null;

    // Personal Stats
    const myAssets = getAssetsByHolder(user.id);
    const myRequests = requisitions.filter(r => r.requesterId === user.id);
    const approvedRequests = myRequests.filter(r => r.status === 'APPROVED' || r.status === 'DISPATCHED');
    const pendingRequests = myRequests.filter(r => !['APPROVED', 'DISPATCHED', 'REJECTED'].includes(r.status));

    // Team Stats (for overview)
    const teamMembers = users.filter(u => u.team === user.team && u.id !== user.id);
    const teamAssets = assets.filter(item => {
        const owner = users.find(u => u.id === item.holderId);
        return owner && owner.team === user.team;
    });

    return (
        <div className="space-y-8 pb-20">
            {/* Personal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-primary/5 border border-primary/10 rounded-xl relative overflow-hidden">
                <div className="z-10">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Command Dashboard: {user.fullName}</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Rank 4 • Team Leader • {getTeamName(user.team)} • {user.branch} Branch
                    </p>
                </div>
                <div className="z-10">
                    <Link href="/team-lead">
                        <Button size="lg" className="shadow-lg">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Go to Managerial Workspace
                        </Button>
                    </Link>
                </div>
                <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Personal KPI Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Personal Assets</CardTitle>
                        <Laptop className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{myAssets.length} Items</div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" /> Currently in your custody
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">My Requests</CardTitle>
                        <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{myRequests.length}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {approvedRequests.length} approved • {pendingRequests.length} pending
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Team Size</CardTitle>
                        <Users className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{teamMembers.length + 1}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Including you • {getTeamName(user.team)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Team Assets</CardTitle>
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{teamAssets.length}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Total team inventory
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Personal Info */}
            <Tabs defaultValue="assets" className="w-full">
                <TabsList>
                    <TabsTrigger value="assets">My Assets ({myAssets.length})</TabsTrigger>
                    <TabsTrigger value="requests">My Requests ({myRequests.length})</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>

                {/* My Assets Tab */}
                <TabsContent value="assets" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assets in My Custody</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myAssets.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No assets currently assigned to you</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myAssets.map((asset) => (
                                        <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Laptop className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{asset.name}</p>
                                                    <p className="text-xs text-muted-foreground">Serial: {asset.serialNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline">{asset.condition}</Badge>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Value: ${asset.value.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* My Requests Tab */}
                <TabsContent value="requests" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Requisition History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myRequests.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No requests submitted yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myRequests.slice(0, 10).map((req) => (
                                        <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{req.id}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {req.items.length} item(s) • {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {(req.status === 'APPROVED' || req.status === 'PENDING_TL' || req.status === 'PENDING_DIR' || req.status === 'PENDING_DGD') && !req.dispatchedAt && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                                                                View OTP
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Collection OTP</DialogTitle>
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
                                                <Badge variant={
                                                    req.status === 'APPROVED' || req.status === 'DISPATCHED' ? 'default' :
                                                        req.status === 'REJECTED' ? 'destructive' : 'secondary'
                                                }>
                                                    {req.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Full Name</p>
                                        <p className="font-medium">{user.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Role</p>
                                        <p className="font-medium">Team Leader (Rank 4)</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Team</p>
                                        <p className="font-medium">{getTeamName(user.team)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Branch</p>
                                        <p className="font-medium">{user.branch}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Department</p>
                                        <p className="font-medium">{user.department || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
