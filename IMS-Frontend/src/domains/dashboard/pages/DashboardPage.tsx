
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useAuthStore } from "@/state/auth.store";
import { useInventoryStore } from "@/domains/inventory/store";
import { useRequestStore } from "@/domains/requisitions/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/shared/ui/dialog";
import {
  Laptop,
  Clock,
  AlertTriangle,
  ArrowRight,
  Package,
  ShieldCheck,
  Zap
} from "lucide-react";

import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getAssetsByHolder, skus } = useInventoryStore();
  const { requisitions } = useRequestStore();
  const { t } = useLanguage();

  const isStorekeeper = user?.role === 'STOREKEEPER';


  // Calculate Stats
  const myAssets = user ? getAssetsByHolder(user.id) : [];
  const activeTokens = user ? requisitions.filter(r => r.requesterId === user.id && r.status === 'APPROVED').length : 0;

  // Storekeeper Stats
  const lowStockCount = skus.filter(s => s.currentStock <= s.thresholdQty).length;

  // Recent Activity (Mocked from requests)
  const myRequests = user ? requisitions.filter(r => r.requesterId === user.id) : [];

  return (
    <div className="space-y-8 pb-20">
      {/* Universal User Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-primary/5 border border-primary/10 rounded-xl relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-3xl font-bold tracking-tight text-primary">{t('dashboard.greeting')} {user?.fullName}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Rank {
              user?.role === 'GD' ? 1 :
                (user?.role === 'DGD_SERVICE' || user?.role === 'DGD_DIGITALIZATION') ? 2 :
                  user?.role === 'DIRECTOR' ? 3 :
                    user?.role === 'TEAM_LEADER' ? 4 : 5
            } • {user?.branch} Operational Area
          </p>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">{t('dashboard.my_custody')}</CardTitle>
            <Laptop className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myAssets.length} {t('dashboard.total_items')}</div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> {t('dashboard.custody_subtitle')}
            </p>
          </CardContent>
        </Card>

        {isStorekeeper && (
          <Card className="hover:shadow-lg transition-all border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Stock Thresholds</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{lowStockCount} Alerts</div>
              <p className="text-[10px] text-muted-foreground mt-1">Consumables below 10% limit</p>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Auth Tokens</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeTokens} Active</div>
            <p className="text-[10px] text-muted-foreground mt-1">Ready for collection at Store</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-60">Lifespan Replacement</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">In 2m</div>
            <p className="text-[10px] text-muted-foreground mt-1">Uniform eligibility approaching</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-assets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="my-assets">{t('dashboard.my_custody')}</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>
        <TabsContent value="my-assets" className="space-y-4">
          {myAssets.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed rounded-xl">
              <Package className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
              <p className="mt-2 text-muted-foreground font-medium">No assets currently assigned.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myAssets.map((asset, i) => {
                const lifespan = asset.lifespanMonths || 36;
                const purchaseDate = new Date(asset.purchaseDate || '2024-01-01');
                const now = new Date();
                const monthsUsed = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth());
                const healthPercent = Math.max(0, 100 - (monthsUsed / lifespan) * 100);

                return (
                  <Card key={i} className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden relative">
                    {/* Health Bar Overlay */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                      <div
                        className={`h-full transition-all duration-1000 ${healthPercent > 50 ? 'bg-emerald-500' : healthPercent > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${healthPercent}%` }}
                      />
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px]">{asset.category}</Badge>
                        <p className="text-[10px] text-muted-foreground">Assigned: {asset.purchaseDate ? format(new Date(asset.purchaseDate), 'MMM yyyy') : 'N/A'}</p>
                      </div>
                      <CardTitle className="text-sm mt-2">{asset.name}</CardTitle>
                      <CardDescription className="font-mono text-[10px]">{asset.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-[10px] font-medium uppercase text-muted-foreground">
                          <span>Health Cycle</span>
                          <span>{Math.round(healthPercent)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${asset.status === 'ISSUED' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                          <span className="text-[10px] font-medium uppercase">{asset.status.replace('_', ' ')}</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] group-hover:text-primary transition-colors">
                              {t('dashboard.details')} <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Laptop className="w-5 h-5 text-primary" />
                                {asset.name}
                              </DialogTitle>
                              <DialogDescription>{t('dashboard.specifications')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">Asset ID</p>
                                  <p className="font-mono font-medium">{asset.id}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">{t('dashboard.model')}</p>
                                  <p className="font-medium">{asset.model || 'Standard Model'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">{t('dashboard.serial')}</p>
                                  <p className="font-mono">{asset.serialNumber || 'SN-UNKNOWN'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">{t('dashboard.condition')}</p>
                                  <Badge variant={asset.condition === 'NEW' ? 'default' : 'secondary'}>{asset.condition}</Badge>
                                </div>
                              </div>
                              <div className="pt-4 border-t">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Custody Timeline</h4>
                                <div className="space-y-2">
                                  <div className="flex gap-3 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
                                    <div>
                                      <p className="font-medium">Issuance Confirmed</p>
                                      <p className="text-muted-foreground">Jan 12, 2024 by Storekeeper</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {myRequests.map((req) => (
              <Card key={req.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">{req.items.map(i => i.name).join(', ')}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{req.id} • {req.type}</p>
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
                  <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'}>{req.status.replace('_', ' ')}</Badge>
                </div>
              </Card>
            ))}
            {myRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No recent requests found.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
