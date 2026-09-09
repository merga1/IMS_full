import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { useAuthStore } from "@/state/auth.store";
import { useInventoryStore } from "@/domains/inventory/store";
import { useRequestStore } from "@/domains/requisitions/store";
import { useLanguage } from "@/app/providers/LanguageProvider";
import {
    Package,
    AlertTriangle,
    TrendingUp,
    Truck,
    ArrowUpRight,
    Clock,
    Box
} from "lucide-react";

export default function StorekeeperDashboardPage() {
    const { user } = useAuthStore();
    const { skus, assets, movements } = useInventoryStore();
    const { requisitions } = useRequestStore();
    const { t } = useLanguage();

    const isHQ = user?.branch === 'HQ';

    // Calculate Inventory Stats
    const branchAssets = assets.filter(a => a.branch === user?.branch);
    const totalAssetValue = branchAssets.reduce((sum, a) => sum + a.value, 0);
    const lowStockItems = skus.filter(s => s.currentStock <= s.thresholdQty);
    const activeSKUs = skus.length;

    // Pending Dispatches (Approved requests waiting for fulfillment)
    const pendingDispatches = requisitions.filter(
        r => r.status === 'APPROVED' && !r.dispatchedAt
    ).length;

    // Recent Stock Movements (last 5)
    const recentMovements = movements.slice(0, 5);

    // Assets by Status
    const inStoreCount = branchAssets.filter(a => a.status === 'IN_STORE').length;
    const issuedCount = branchAssets.filter(a => a.status === 'ISSUED').length;
    const maintenanceCount = branchAssets.filter(a => a.status === 'MAINTENANCE').length;

    return (
        <div className="space-y-8 pb-20">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-primary/5 border border-primary/10 rounded-xl relative overflow-hidden">
                <div className="z-10">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">
                        {isHQ ? t('dashboard.hq_inventory_control') : t('dashboard.branch_inventory').replace('{0}', user?.branch || '')}
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Package className="w-4 h-4 text-emerald-500" />
                        {t('dashboard.storekeeper_title')} • {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* KPI Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">
                            {t('dashboard.total_asset_value')}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {totalAssetValue.toLocaleString()} {t('currency.birr')}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {t('dashboard.items_in_branch').replace('{0}', branchAssets.length.toString()).replace('{1}', user?.branch || '')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">
                            {t('dashboard.low_stock_alerts')}
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">
                            {lowStockItems.length}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {t('dashboard.items_below_threshold')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">
                            {t('dashboard.active_skus')}
                        </CardTitle>
                        <Box className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{activeSKUs}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {t('dashboard.registered_item_types')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">
                            {t('dashboard.pending_dispatches')}
                        </CardTitle>
                        <Truck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pendingDispatches}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {t('dashboard.awaiting_fulfillment')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Status Breakdown */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            {t('inventory.status.in_store')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inStoreCount}</div>
                        <p className="text-xs text-muted-foreground">{t('dashboard.available_for_issue')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            {t('inventory.status.issued')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{issuedCount}</div>
                        <p className="text-xs text-muted-foreground">{t('dashboard.in_employee_custody')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            {t('inventory.status.maintenance')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maintenanceCount}</div>
                        <p className="text-xs text-muted-foreground">{t('dashboard.under_repair')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {t('dashboard.recent_stock_movements')}
                    </CardTitle>
                    <CardDescription>{t('dashboard.latest_inventory_transactions')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentMovements.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t('dashboard.no_recent_movements')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentMovements.map((movement) => {
                                const sku = skus.find(s => s.id === movement.skuId);
                                return (
                                    <div
                                        key={movement.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${movement.type === 'INTAKE' ? 'bg-emerald-100 text-emerald-600' :
                                                movement.type === 'DISPATCH' ? 'bg-blue-100 text-blue-600' :
                                                    movement.type === 'TRANSFER' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-amber-100 text-amber-600'
                                                }`}>
                                                {movement.type === 'INTAKE' && <ArrowUpRight className="w-4 h-4" />}
                                                {movement.type === 'DISPATCH' && <Truck className="w-4 h-4" />}
                                                {movement.type === 'TRANSFER' && <Truck className="w-4 h-4" />}
                                                {movement.type === 'ADJUSTMENT' && <Package className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{sku?.name || t('dashboard.unknown_item')}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {movement.type} • {movement.quantity} units
                                                    {movement.toLocation && ` → ${movement.toLocation}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="text-xs">
                                                {new Date(movement.timestamp).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Critical Stock Alerts */}
            {lowStockItems.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="w-5 h-5" />
                            {t('dashboard.critical_stock_alerts')}
                        </CardTitle>
                        <CardDescription>{t('dashboard.items_requiring_attention')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {lowStockItems.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-background border border-amber-200 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{item.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-amber-600">
                                            {item.currentStock} / {item.thresholdQty}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{item.unit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
