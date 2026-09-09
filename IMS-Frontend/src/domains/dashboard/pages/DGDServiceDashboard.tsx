import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useRequestStore } from "@/domains/requisitions/store";
import {
    Building2,
    Users,
    Package,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock
} from "lucide-react";

export default function DGDServiceDashboard() {
    const { requisitions } = useRequestStore();

    // Filter for Service Sector requests only
    const serviceSectorRequests = requisitions.filter(req => {
        const pendingStep = req.approvalSteps.find(s => s.status === 'PENDING');
        return pendingStep?.sector === 'SERVICE';
    });

    const pendingApprovals = serviceSectorRequests.filter(r => r.status === 'PENDING_DGD');
    const approvedThisWeek = serviceSectorRequests.filter(r => r.status === 'APPROVED').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Service Sector Overview</h1>
                    <p className="text-muted-foreground">Deputy General Director - Service Operations</p>
                </div>
                <Badge className="bg-emerald-500 text-white">Service Sector</Badge>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pendingApprovals.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting your decision</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Approved This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">{approvedThisWeek}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requests processed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Active Branches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">6</div>
                        <p className="text-xs text-muted-foreground mt-1">Service locations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Service Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">245</div>
                        <p className="text-xs text-muted-foreground mt-1">Total inventory</p>
                    </CardContent>
                </Card>
            </div>

            {/* Department Performance */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Department Performance</CardTitle>
                        <CardDescription>Service sector departments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'Land Management', requests: 12, status: 'good' },
                                { name: 'Transport', requests: 8, status: 'warning' },
                                { name: 'Revenue', requests: 5, status: 'good' },
                                { name: 'Social Services', requests: 15, status: 'good' },
                                { name: 'Branch Operations', requests: 10, status: 'good' }
                            ].map(dept => (
                                <div key={dept.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{dept.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">{dept.requests} requests</span>
                                        {dept.status === 'good' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Branch Activity</CardTitle>
                        <CardDescription>Request volume by location</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { branch: 'HQ', count: 18, trend: 'up' },
                                { branch: 'Arada', count: 12, trend: 'stable' },
                                { branch: 'Bole', count: 8, trend: 'down' },
                                { branch: 'Lideta', count: 10, trend: 'up' },
                                { branch: 'Kirkos', count: 6, trend: 'stable' }
                            ].map(branch => (
                                <div key={branch.branch} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{branch.branch}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">{branch.count} requests</span>
                                        {branch.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                                        {branch.trend === 'stable' && <Clock className="w-4 h-4 text-blue-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Package className="w-5 h-5" />
                            <span className="text-xs">View Inventory</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-xs">Approve Requests</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Building2 className="w-5 h-5" />
                            <span className="text-xs">Branch Reports</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-xs">Performance</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
