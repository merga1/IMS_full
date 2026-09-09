import { useAuthStore } from "@/state/auth.store";
import { useRequestStore } from "@/domains/requisitions/store";
import { useInventoryStore } from "@/domains/inventory/store";
import { useDigitalStore } from "@/domains/digital/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Check, X, FileText, Users, Box, TrendingUp, AlertTriangle, Laptop } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { RegisterDigitalAssetDialog } from "../components/RegisterDigitalAssetDialog";

const DigitalAssetsView = () => {
    const { digitalAssets } = useDigitalStore();

    if (digitalAssets.length === 0) {
        return (
            <Card className="p-12 text-center border-dashed">
                <Laptop className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No Digital Assets Registered</h3>
                <p className="text-muted-foreground">Click "Register Digital Asset" to add your first digital asset.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Hardware Assets */}
            {digitalAssets.filter(a => a.type === 'HARDWARE').length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Hardware Assets</CardTitle>
                        <CardDescription>Laptops, computers, and computing devices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset Name</TableHead>
                                    <TableHead>OS</TableHead>
                                    <TableHead>Processor</TableHead>
                                    <TableHead>RAM</TableHead>
                                    <TableHead>Storage</TableHead>
                                    <TableHead>Installed Apps</TableHead>
                                    <TableHead>Registered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {digitalAssets.filter(a => a.type === 'HARDWARE').map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">{asset.name}</TableCell>
                                        <TableCell>{asset.os || '-'}</TableCell>
                                        <TableCell className="text-xs">{asset.processor || '-'}</TableCell>
                                        <TableCell>{asset.ram || '-'}</TableCell>
                                        <TableCell>{asset.storage || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {asset.installedApps && asset.installedApps.length > 0 ? (
                                                    asset.installedApps.slice(0, 2).map((app, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-[10px]">
                                                            {app.name} v{app.version}
                                                        </Badge>
                                                    ))
                                                ) : '-'}
                                                {asset.installedApps && asset.installedApps.length > 2 && (
                                                    <Badge variant="secondary" className="text-[10px]">+{asset.installedApps.length - 2}</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(asset.registeredAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Display Systems */}
            {digitalAssets.filter(a => a.type === 'DISPLAY').length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Display Systems</CardTitle>
                        <CardDescription>Queue management screens, digital signage, and information displays</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Display Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Resolution</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Connected To</TableHead>
                                    <TableHead>Registered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {digitalAssets.filter(a => a.type === 'DISPLAY').map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">{asset.name}</TableCell>
                                        <TableCell><Badge variant="outline">{asset.displayType}</Badge></TableCell>
                                        <TableCell>{asset.resolution || '-'}</TableCell>
                                        <TableCell>{asset.location || '-'}</TableCell>
                                        <TableCell>{asset.connectedTo || '-'}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(asset.registeredAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Software Systems */}
            {digitalAssets.filter(a => a.type === 'SOFTWARE').length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Software Systems</CardTitle>
                        <CardDescription>Organizational applications and server systems</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>System Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Server</TableHead>
                                    <TableHead>Database</TableHead>
                                    <TableHead>Deployment</TableHead>
                                    <TableHead>Registered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {digitalAssets.filter(a => a.type === 'SOFTWARE').map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">{asset.name}</TableCell>
                                        <TableCell><Badge>{asset.systemType}</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">{asset.version || '-'}</TableCell>
                                        <TableCell className="font-mono text-xs">{asset.ipAddress || '-'}</TableCell>
                                        <TableCell className="text-xs">{asset.serverName || '-'}</TableCell>
                                        <TableCell className="text-xs">{asset.database || '-'}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-[10px]">{asset.deploymentType}</Badge></TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(asset.registeredAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};




export default function DirectorDashboardPage() {
    const { user, users } = useAuthStore();
    const { getPendingForUser, approveRequest, rejectRequest, requisitions } = useRequestStore();
    const { assets } = useInventoryStore();

    if (!user || user.role !== 'DIRECTOR') return <div className="p-10">Access Denied. Director Role Required.</div>;

    const pendingRequests = getPendingForUser(user);

    const myDepartmentRequests = requisitions.filter(r => r.requesterDepartment === user.department);
    const approvedCount = myDepartmentRequests.filter(r => r.status === 'APPROVED' || r.status === 'PENDING_DGD' || r.status === 'DISPATCHED').length;
    const rejectedCount = myDepartmentRequests.filter(r => r.status === 'REJECTED').length;

    const myStaffIds = users.filter(u => u.department === user.department).map(u => u.id);
    const myDeptAssets = assets.filter(a => a.holderId && myStaffIds.includes(a.holderId));
    const totalAssetValue = myDeptAssets.reduce((sum, a) => sum + a.value, 0);

    const handleApprove = (reqId: string) => {
        approveRequest(reqId, user.id, user.role);
        toast.success(`Request ${reqId} Approved & Forwarded to DGD`);
    };

    const handleReject = (reqId: string) => {
        rejectRequest(reqId, user.id, "Rejected by Director");
        toast.error(`Request ${reqId} Rejected`);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Director Command Center</h1>
                        <Badge variant="outline" className="text-lg py-1 border-primary/20 bg-primary/5">
                            {user.department?.replace('_', ' ')}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Operational oversight for {user.department ? user.department.toLowerCase().replace(/_/g, ' ') : 'department'} resources.
                    </p>
                </div>
                <div className="flex gap-2">
                    {user.department === 'IT' && <RegisterDigitalAssetDialog />}
                    <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" /> Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approval Queue</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRequests.length}</div>
                        <p className="text-xs text-muted-foreground">Pending your action</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Department Assets</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myDeptAssets.length}</div>
                        <p className="text-xs text-muted-foreground">{totalAssetValue.toLocaleString()} Birr Value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Staff Headcount</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myStaffIds.length}</div>
                        <p className="text-xs text-muted-foreground">Active personnel</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Request Velocity</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{approvedCount}</div>
                        <p className="text-xs text-muted-foreground">Approved / {rejectedCount} Rejected</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="approvals" className="w-full">
                <TabsList>
                    <TabsTrigger value="approvals">Approvals ({pendingRequests.length})</TabsTrigger>
                    <TabsTrigger value="inventory">Asset Inventory</TabsTrigger>
                    {user.department === 'IT' && <TabsTrigger value="digital">Digital Assets</TabsTrigger>}
                    <TabsTrigger value="analytics">Resource Gaps</TabsTrigger>
                </TabsList>

                {/* APPROVALS TAB */}
                <TabsContent value="approvals" className="mt-6 space-y-4">
                    {pendingRequests.length === 0 ? (
                        <Card className="p-12 text-center border-dashed">
                            <Check className="w-12 h-12 text-green-500 opacity-20 mx-auto mb-4" />
                            <h3 className="text-lg font-bold">All Clear</h3>
                            <p className="text-muted-foreground">No pending requests for {user.department}.</p>
                        </Card>
                    ) : (
                        pendingRequests.map(req => (
                            <Card key={req.id}>
                                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded">{req.id}</span>
                                            <span className="text-sm text-muted-foreground">• {req.createdAt}</span>
                                        </div>
                                        <h3 className="text-lg font-bold">{req.requesterName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {req.items.map((i, idx) => (
                                                <span key={idx} className="font-medium text-foreground">{i.quantity}x {i.name}</span>
                                            ))}
                                        </div>
                                        <p className="text-sm italic bg-muted/50 p-2 rounded border-l-2 border-primary">"{req.justification}"</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleApprove(req.id)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                            <Check className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="text-destructive border-destructive/20 hover:bg-destructive/10">
                                            <X className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* INVENTORY TAB */}
                <TabsContent value="inventory" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Asset Registry</CardTitle>
                            <CardDescription>Items currently assigned to {user.department} staff.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground font-medium">
                                        <tr>
                                            <th className="p-3">Asset Tag</th>
                                            <th className="p-3">Item Name</th>
                                            <th className="p-3">Holder</th>
                                            <th className="p-3">Condition</th>
                                            <th className="p-3">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myDeptAssets.length > 0 ? myDeptAssets.map(asset => {
                                            const holder = users.find(u => u.id === asset.holderId);
                                            return (
                                                <tr key={asset.id} className="border-t hover:bg-muted/50">
                                                    <td className="p-3 font-mono">{asset.id}</td>
                                                    <td className="p-3 font-medium">{asset.name}</td>
                                                    <td className="p-3">{holder?.fullName || 'Unknown'}</td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className={
                                                            asset.condition === 'NEW' ? 'text-emerald-600 border-emerald-200' :
                                                                asset.condition === 'POOR' ? 'text-destructive border-destructive/20' : ''
                                                        }>{asset.condition}</Badge>
                                                    </td>
                                                    <td className="p-3 text-muted-foreground">{asset.value.toLocaleString()} Birr</td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                    No assets currently assigned to this department.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ANALYTICS TAB */}
                <TabsContent value="analytics" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resource Gap Analysis</CardTitle>
                                <CardDescription>Critical tools below 10% threshold.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border rounded-lg border-l-4 border-l-amber-500 bg-amber-50/50">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="text-amber-600 w-5 h-5" />
                                            <div>
                                                <p className="font-bold text-sm">Printer Toner (Black)</p>
                                                <p className="text-xs text-muted-foreground">Consumable • 2 units left</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary" className="text-xs h-7">Restock</Button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg border-l-4 border-l-emerald-500">
                                        <div className="flex items-center gap-3">
                                            <Check className="text-emerald-600 w-5 h-5" />
                                            <div>
                                                <p className="font-bold text-sm">A4 Paper</p>
                                                <p className="text-xs text-muted-foreground">Healthy • 150 reams</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Processing Speed</CardTitle>
                                <CardDescription>Average time to approve.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-[200px]">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-primary mb-2">4.2h</div>
                                    <p className="text-muted-foreground">Average Approval Time</p>
                                    <p className="text-xs text-emerald-500 font-bold mt-2">▼ 15% vs last week</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* DIGITAL ASSETS TAB */}
                {user.department === 'IT' && (
                    <TabsContent value="digital" className="mt-6">
                        <DigitalAssetsView />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
