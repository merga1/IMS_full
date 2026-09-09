import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useInventoryStore } from "../store";
import {
    Building2,
    ArrowRightLeft,
    AlertTriangle,
    Package,
    TrendingUp,
    Truck
} from "lucide-react";

export default function HQInventoryPage() {
    const { skus, assets, movements, checkThreshold } = useInventoryStore();
    const [_, setLocation] = useLocation();


    // Calculate real-time stats per branch from Assets
    const branches = ['HQ', 'ARADA', 'BOLE', 'LIDETA', 'KIRKOS'];
    const branchStockOverview = branches.map(branchName => {
        const branchAssets = assets.filter(a => a.branch === branchName);
        // For SKUs (which are currently global in this prototype), we'll attribute them to HQ 
        // or spread them if we had branch-level SKU tracking. 
        // For now, let's count Assets + arbitrary SKU volume if HQ.

        let totalItems = branchAssets.length;
        if (branchName === 'HQ') {
            // Add bulk SKUs to HQ count for visualization
            totalItems += skus.reduce((acc, s) => acc + s.currentStock, 0);
        }

        // Mock critical logic for branches (since we don't track SKU thresholds per branch yet)
        const critical = branchName === 'HQ'
            ? skus.filter(s => checkThreshold(s.id)).length
            : 0;

        return {
            branch: branchName,
            totalItems,
            critical
        };
    });

    const criticalItems = skus.filter(s => checkThreshold(s.id));

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-slate-700" />
                        HQ Central Warehouse
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Organization-wide inventory control and distribution hub.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="lg" onClick={() => setLocation('/inventory/map')}>
                        Manage HQ Assets
                    </Button>
                    <Button size="lg" onClick={() => setLocation('/inventory/branch-dispatch')}>
                        <Truck className="w-5 h-5 mr-2" />
                        Go to Dispatch Console
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Asset Value
                        </CardTitle>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2M Birr</div>
                        <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Low Stock Alerts
                        </CardTitle>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{criticalItems.length}</div>
                        <p className="text-xs text-muted-foreground">Items below threshold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active SKUs
                        </CardTitle>
                        <Package className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{skus.length}</div>
                        <p className="text-xs text-muted-foreground">Across all categories</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending Transfers
                        </CardTitle>
                        <ArrowRightLeft className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {movements.filter(m => m.type === 'TRANSFER' && m.status === 'IN_TRANSIT').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Awaiting branch receipt</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Branch Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Stock Levels</CardTitle>
                        <CardDescription>Real-time view of inventory distribution.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Branch</TableHead>
                                    <TableHead className="text-right">Total Items</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {branchStockOverview.map((branch) => (
                                    <TableRow key={branch.branch}>
                                        <TableCell className="font-medium">{branch.branch}</TableCell>
                                        <TableCell className="text-right font-mono">{branch.totalItems}</TableCell>
                                        <TableCell className="text-right">
                                            {branch.critical > 0 ? (
                                                <Badge variant="destructive" className="text-[10px]">
                                                    {branch.critical} ALERTS
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                                    HEALTHY
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Critical Stock List */}
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Critical Low Stock
                        </CardTitle>
                        <CardDescription>
                            Immediate replenishment required for these items.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {criticalItems.length === 0 ? (
                            <div className="flex items-center justify-center p-8 text-muted-foreground">
                                All stock levels are healthy.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Current</TableHead>
                                        <TableHead className="text-right">Min</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {criticalItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium text-sm">{item.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{item.id}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-red-600">
                                                {item.currentStock}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {item.thresholdQty}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
