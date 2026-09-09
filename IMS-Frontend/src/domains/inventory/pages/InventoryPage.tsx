import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { Search, Package, AlertTriangle, ArrowUpDown, ShoppingCart } from "lucide-react";
import { useInventoryStore } from "@/domains/inventory/store";
import { useRequestStore } from "@/domains/requisitions/store";
import { useAuthStore } from "@/state/auth.store";
import { useState } from "react";
import { toast } from "@/shared/hooks/use-toast";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function InventoryPage() {
  const { user } = useAuthStore();
  const { skus, checkThreshold } = useInventoryStore();
  const { createRequest } = useRequestStore();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'status'>('name');
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<any>(null);
  const [restockQty, setRestockQty] = useState(50);
  const [adjustQty, setAdjustQty] = useState(0);

  // Filter and sort logic
  const filteredSkus = skus
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'stock') {
        return a.currentStock - b.currentStock;
      } else if (sortBy === 'status') {
        const aIsCritical = checkThreshold(a.id);
        const bIsCritical = checkThreshold(b.id);
        return (bIsCritical ? 1 : 0) - (aIsCritical ? 1 : 0);
      }
      return 0;
    });

  const criticalCount = skus.filter(s => checkThreshold(s.id)).length;

  const handleAskToBuy = (sku: any) => {
    setSelectedSku(sku);
    setRestockQty(sku.thresholdQty * 2); // Default suggestion
    setIsRestockOpen(true);
  };

  const submitRestock = () => {
    if (!user || !selectedSku) return;

    createRequest({
      requesterId: user.id,
      requesterName: user.fullName,
      type: 'ASK_TO_BUY',
      items: [{
        skuId: selectedSku.id,
        name: selectedSku.name,
        quantity: restockQty
      }],
      justification: `Critical Stock Alert Triggered. Current: ${selectedSku.currentStock}. Threshold: ${selectedSku.thresholdQty}.`
    });

    toast({ title: `Purchase Request Initiated for ${selectedSku.name}` });
    setIsRestockOpen(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{t('inventory.master_catalog')}</h1>
          <p className="text-muted-foreground">{t('inventory.subtitle')}</p>
        </div>
        {user?.branch === 'HQ' && (
          <Button onClick={() => setIsRegisterOpen(true)}>
            <Package className="w-4 h-4 mr-2" /> {t('inventory.register_sku')}
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('inventory.critical_stock')}</p>
                <h3 className="text-2xl font-bold">{criticalCount} {t('inventory.items')}</h3>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive opacity-20" />
            </div>
            <p className="text-xs text-destructive mt-2">{t('inventory.threshold_triggered')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('inventory.total_skus')}</p>
                <h3 className="text-2xl font-bold">{skus.length}</h3>
              </div>
              <Package className="w-8 h-8 text-primary opacity-20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('inventory.across_categories')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('inventory.filter_placeholder')}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('inventory.sort')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="stock">Sort by Stock Level</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('inventory.sku_id')}</TableHead>
                <TableHead>{t('inventory.item_name')}</TableHead>
                <TableHead>{t('inventory.category')}</TableHead>
                <TableHead>{t('inventory.current_stock')}</TableHead>
                <TableHead>{t('inventory.threshold')}</TableHead>
                <TableHead>{t('inventory.status')}</TableHead>
                <TableHead>{t('inventory.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSkus.map((item) => {
                const isCritical = checkThreshold(item.id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-bold text-xs">{item.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {item.productCategory && <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">{item.productCategory}</Badge>}
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${isCritical ? 'text-destructive' : ''}`}>
                        {item.currentStock}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.thresholdQty}</TableCell>
                    <TableCell>
                      {isCritical ? (
                        <Badge variant="destructive" className="text-[10px]">{t('inventory.critical')}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 hover:bg-green-100">{t('inventory.ok')}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isCritical ? (
                        <Button size="sm" variant="destructive" className="h-7 text-[10px] uppercase" onClick={() => handleAskToBuy(item)}>
                          {t('inventory.ask_to_buy')}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px] uppercase"
                          onClick={() => {
                            setSelectedSku(item);
                            setAdjustQty(0);
                            setIsAdjustOpen(true);
                          }}
                        >
                          {t('inventory.adjust')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              {t('inventory.initiate_request')}
            </DialogTitle>
            <DialogDescription>
              {t('inventory.request_desc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t('inventory.item')}</Label>
              <div className="col-span-3 font-bold">{selectedSku?.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t('inventory.current')}</Label>
              <div className="col-span-3 text-destructive font-mono">{selectedSku?.currentStock}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="qty" className="text-right">{t('inventory.order_qty')}</Label>
              <Input
                id="qty"
                type="number"
                className="col-span-3"
                value={restockQty}
                onChange={(e) => setRestockQty(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submitRestock}>{t('inventory.submit_request')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register New SKU Modal */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t('inventory.register_sku')}
            </DialogTitle>
            <DialogDescription>
              {t('inventory.register_desc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sku-id">{t('inventory.sku_id')}</Label>
              <Input id="sku-id" placeholder="e.g., SKU-LAPTOP-001" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-name">{t('inventory.item_name')}</Label>
              <Input id="item-name" placeholder="e.g., MacBook Pro M3" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-category">{t('inventory.product_category')}</Label>
              <Input id="product-category" placeholder="e.g., Electronics, Furniture, Office Supplies" />
              <p className="text-xs text-muted-foreground">{t('inventory.main_classification')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('inventory.asset_type')}</Label>
              <Select onValueChange={(v) => (document.getElementById('category') as any).value = v}>
                <SelectTrigger id="category-trigger">
                  <SelectValue placeholder={t('inventory.select_tracking')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERIALIZED">Serialized (Unique ID per item)</SelectItem>
                  <SelectItem value="SKU">SKU-Based (Counts only)</SelectItem>
                  <SelectItem value="CONSUMABLE">Consumable (Disposables)</SelectItem>
                  <SelectItem value="STATIONARY">Stationary (Office Equipment)</SelectItem>
                  <SelectItem value="DIGITAL">Digital (Licenses)</SelectItem>
                </SelectContent>
              </Select>
              {/* Hidden input to store value for easy retrieval in onSubmit, mimicking existing pattern */}
              <input type="hidden" id="category" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">{t('inventory.threshold_qty')}</Label>
              <Input id="threshold" type="number" placeholder="10" />
              <p className="text-xs text-muted-foreground">
                {t('inventory.min_stock_level')}
              </p>
            </div>
            {/* Serialized Item Section */}
            <div className="border-t pt-4 mt-2">
              <div className="flex items-start space-x-3 mb-4 p-3 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="is-serialized"
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <Label htmlFor="is-serialized" className="cursor-pointer font-medium text-base">
                    {t('inventory.enable_serial')}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('inventory.check_if_serial')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial-numbers" className="text-sm font-medium">
                  {t('inventory.serial_optional')}
                </Label>
                <textarea
                  id="serial-numbers"
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('inventory.serial_placeholder')}
                />
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded">
                  <span className="text-blue-600 dark:text-blue-400">💡</span>
                  <p>
                    <strong>{t('inventory.tip')}</strong> {t('inventory.tip_desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>
              {t('inventory.cancel')}
            </Button>
            <Button onClick={() => {
              const skuId = (document.getElementById('sku-id') as HTMLInputElement)?.value;
              const name = (document.getElementById('item-name') as HTMLInputElement)?.value;
              // Cast category to any to avoid strict literal checking for now, or ensure user types valid category
              const categoryInput = (document.getElementById('category') as HTMLInputElement)?.value;
              const productCategory = (document.getElementById('product-category') as HTMLInputElement)?.value;
              const threshold = parseInt((document.getElementById('threshold') as HTMLInputElement)?.value || '0');
              const isSerialized = (document.getElementById('is-serialized') as HTMLInputElement)?.checked;
              const serialNumbers = (document.getElementById('serial-numbers') as HTMLTextAreaElement)?.value;

              if (!skuId || !name || !categoryInput || !productCategory) {
                toast({ title: t('inventory.please_fill'), variant: "destructive" });
                return;
              }

              // Add SKU Definition
              useInventoryStore.getState().addSku({
                id: skuId,
                name: name,
                category: categoryInput as any, // Technical Type
                productCategory: productCategory, // New Grouping
                currentStock: 0, // Initial stock 0, will be updated by assets if serialized
                thresholdQty: threshold,
                unit: 'pcs',
                description: 'Newly registered item'
              });

              const serialList = serialNumbers?.split('\n').filter(s => s.trim()) || [];

              if (isSerialized && serialList.length > 0) {
                const newAssets = serialList.map(sn => ({
                  id: `A-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  name: name,
                  category: categoryInput as any,
                  productCategory: productCategory,
                  serialNumber: sn.trim(),
                  sku: skuId,
                  status: 'IN_STORE' as any,
                  condition: 'NEW' as any,
                  purchaseDate: new Date().toISOString(),
                  value: 0,
                  branch: user?.branch || 'HQ'
                }));

                useInventoryStore.getState().addAssets(newAssets);
                // Also update the stock count for the SKU
                useInventoryStore.getState().updateStock(skuId, serialList.length);

                toast({ title: t('inventory.sku_registered_serial').replace('{0}', serialList.length.toString()) });
              } else {
                toast({ title: t('inventory.sku_registered') });
              }
              setIsRegisterOpen(false);
            }}>
              {t('inventory.register_sku')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Modal */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              {t('inventory.adjust_stock')}
            </DialogTitle>
            <DialogDescription>
              {t('inventory.adjust_desc')} {selectedSku?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t('inventory.current')}</Label>
              <div className="col-span-3 font-mono font-bold">{selectedSku?.currentStock}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjust-qty" className="text-right">{t('inventory.adjustment')}</Label>
              <Input
                id="adjust-qty"
                type="number"
                className="col-span-3"
                value={adjustQty}
                onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                placeholder="Enter positive or negative number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t('inventory.new_total')}</Label>
              <div className="col-span-3 font-mono font-bold text-primary">
                {(selectedSku?.currentStock || 0) + adjustQty}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              toast({ title: `Stock adjusted for ${selectedSku?.name}` });
              setIsAdjustOpen(false);
            }}>
              {t('inventory.confirm_adjustment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
