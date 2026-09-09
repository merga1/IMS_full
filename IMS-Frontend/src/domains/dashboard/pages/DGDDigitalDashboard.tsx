import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useRequestStore } from "@/domains/requisitions/store";
import {
    Server,
    Cpu,
    HardDrive,
    Wifi,
    AlertTriangle,
    CheckCircle2,
    Code
} from "lucide-react";

export default function DGDDigitalDashboard() {
    const { requisitions } = useRequestStore();

    // Filter for Digitalization Sector requests only
    const digitalSectorRequests = requisitions.filter(req => {
        const pendingStep = req.approvalSteps.find(s => s.status === 'PENDING');
        return pendingStep?.sector === 'DIGITALIZATION';
    });

    const pendingApprovals = digitalSectorRequests.filter(r => r.status === 'PENDING_DGD');
    const approvedThisWeek = digitalSectorRequests.filter(r => r.status === 'APPROVED').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Digitalization Sector Overview</h1>
                    <p className="text-muted-foreground">Deputy General Director - Digital Transformation</p>
                </div>
                <Badge className="bg-blue-500 text-white">Digitalization Sector</Badge>
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

                <Card className="border-emerald-500/50 bg-emerald-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">System Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">99.8%</div>
                        <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Digital Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">156</div>
                        <p className="text-xs text-muted-foreground mt-1">Licenses & hardware</p>
                    </CardContent>
                </Card>
            </div>

            {/* Department Performance */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Department Performance</CardTitle>
                        <CardDescription>Digitalization sector departments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'IT', requests: 18, status: 'good' },
                                { name: 'Software Development', requests: 12, status: 'good' },
                                { name: 'Infrastructure', requests: 8, status: 'warning' },
                                { name: 'System Administration', requests: 10, status: 'good' },
                                { name: 'One Center Tech', requests: 6, status: 'good' }
                            ].map(dept => (
                                <div key={dept.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-muted-foreground" />
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
                        <CardTitle className="text-base">System Health</CardTitle>
                        <CardDescription>Infrastructure status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { system: 'One-CIS Platform', status: 'operational', uptime: '99.9%' },
                                { system: 'Network Infrastructure', status: 'operational', uptime: '99.7%' },
                                { system: 'Cloud Services', status: 'operational', uptime: '99.8%' },
                                { system: 'Database Cluster', status: 'maintenance', uptime: '98.5%' },
                                { system: 'Backup Systems', status: 'operational', uptime: '100%' }
                            ].map(sys => (
                                <div key={sys.system} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Server className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{sys.system}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-mono">{sys.uptime}</span>
                                        {sys.status === 'operational' ? (
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
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Cpu className="w-5 h-5" />
                            <span className="text-xs">System Status</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-xs">Approve Requests</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <HardDrive className="w-5 h-5" />
                            <span className="text-xs">Asset Registry</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Wifi className="w-5 h-5" />
                            <span className="text-xs">Network Health</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
