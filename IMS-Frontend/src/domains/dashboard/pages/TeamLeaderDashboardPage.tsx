import { useAuthStore } from "@/state/auth.store";
import { useRequestStore } from "@/domains/requisitions/store";
import { useInventoryStore } from "@/domains/inventory/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Check, X, Users, Box, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getTeamName } from "@/shared/utils/teamMapping";

export default function TeamLeaderDashboardPage() {
    const { user, users } = useAuthStore();
    const { getPendingForUser, approveRequest, rejectRequest } = useRequestStore();
    const { assets, skus } = useInventoryStore();

    if (!user || user.role !== 'TEAM_LEADER' || !user.team) return null;

    const pendingRequests = getPendingForUser(user);
    const teamMembers = users.filter(u => u.team === user.team && u.id !== user.id);
    const teamAssets = assets.filter(item => {
        // Find owner by holderId
        const owner = users.find(u => u.id === item.holderId);
        return owner && owner.team === user.team;
    });

    // Check for low stock on consumables (Global check for now as proxy for "Team relevant")
    const lowStockConsumables = skus.filter(s => s.category === 'CONSUMABLE' && s.currentStock <= s.thresholdQty).length;

    const handleApprove = (reqId: string) => {
        approveRequest(reqId, user.id, 'TEAM_LEADER');
        toast.success("Request sponsored successfully");
    };

    const handleReject = (reqId: string) => {
        rejectRequest(reqId, user.id, "Rejected by Team Leader");
        toast.error("Request rejected");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Managerial Workspace</h1>
                    <p className="text-muted-foreground">
                        {getTeamName(user.team)} • {user.branch} Branch
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        My Team ({teamMembers.length})
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sponsorship Queue</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRequests.length}</div>
                        <p className="text-xs text-muted-foreground">Pending verification</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Assets</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamAssets.length}</div>
                        <p className="text-xs text-muted-foreground">Active in-hand items</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{lowStockConsumables}</div>
                        <p className="text-xs text-muted-foreground">Consumables below 10%</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">94%</div>
                        <p className="text-xs text-muted-foreground">Equipment active</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="approvals" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="approvals">Sponsorship Queue</TabsTrigger>
                    <TabsTrigger value="inventory">Team Asset Hub</TabsTrigger>
                    <TabsTrigger value="members">My Team</TabsTrigger>
                </TabsList>

                <TabsContent value="approvals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Staff Requests</CardTitle>
                            <CardDescription>Verify and sponsor requests before forwarding to Director.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No pending requests from your team.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingRequests.map(req => (
                                        <div key={req.id} className="flex items-center justify-between border p-4 rounded-lg bg-card/50">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{req.requesterName}</span>
                                                    <Badge variant="outline">{req.type}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Requesting: <span className="font-medium text-foreground">{req.items[0].name} (x{req.items[0].quantity})</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground italic">"{req.justification}"</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(req.id)}>
                                                    <X className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                                <Button size="sm" onClick={() => handleApprove(req.id)}>
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Sponsor
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Custody Overview</CardTitle>
                            <CardDescription>Real-time view of assets held by your direct reports.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teamAssets.length === 0 ? <p className="text-muted-foreground">No assets currently assigned to this team.</p> : (
                                    teamAssets.map(item => (
                                        <div key={item.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">SN: {item.serialNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="secondary">In Use</Badge>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Holder: {users.find(u => u.id === item.holderId)?.fullName}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="members">
                    <Card>
                        <CardHeader>
                            <CardTitle>Direct Reports</CardTitle>
                            <CardDescription>Staff members under your supervision.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {member.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{member.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{member.faydaId}</p>
                                            <p className="text-xs text-muted-foreground">{member.email}</p>
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
