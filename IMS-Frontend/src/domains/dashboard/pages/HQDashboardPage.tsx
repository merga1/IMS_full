import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Alert, AlertTitle, AlertDescription } from "@/shared/ui/alert";
import { AlertTriangle, TrendingUp, Package } from "lucide-react";
import { useInventoryStore } from "@/domains/inventory/store";


// Helper to deduce mock branch from logic if needed, or we just randomly assign for mock viz
// But ideally we trace holder -> branch.
// Since we don't have easy access to ALL users list in inventoryStore (it's in authStore as MOCK_USERS but not exported as a list usually, actually it is MOCK_USERS constant in authStore file).
// We will just define a static map for the specialized chart for now, or use the dynamic totals.

export default function HQDashboardPage() {
  const { assets, skus } = useInventoryStore(); // We can count totals

  // Calculate Totals
  const totalSerialized = assets.length;
  const totalSKUStock = skus.reduce((acc, sku) => acc + sku.currentStock, 0);
  const totalItems = totalSerialized + totalSKUStock;

  // Calculate Value (Mock: each item avg 5000 ETB for serialized, 500 for SKU)
  const totalValue = (totalSerialized * 5000) + (totalSKUStock * 500);

  // Critical Stock
  const criticalStockItems = skus.filter(s => s.currentStock <= s.thresholdQty);

  // Status Breakdown
  const statusCounts = assets.reduce((acc: Record<string, number>, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {});

  const DATA_STATUS = [
    { name: 'Active', value: (statusCounts['ASSIGNED'] || 0) + (statusCounts['IN_USE'] || 0), color: '#16a34a' },
    { name: 'In Store', value: (statusCounts['IN_STORE'] || 0) + (statusCounts['AVAILABLE'] || 0), color: '#2563eb' },
    { name: 'Maintenance', value: statusCounts['MAINTENANCE'] || 0, color: '#d97706' },
    { name: 'Retired', value: statusCounts['RETIRED'] || 0, color: '#dc2626' },
  ].filter(d => d.value > 0);

  // Mock Branch Data (Dynamic based on total to look realistic)
  const DATA_BRANCHES = [
    { name: 'HQ', assets: Math.floor(totalItems * 0.4), value: 2400 },
    { name: 'Arada', assets: Math.floor(totalItems * 0.25), value: 1398 },
    { name: 'Bole', assets: Math.floor(totalItems * 0.2), value: 9800 },
    { name: 'Lideta', assets: Math.floor(totalItems * 0.1), value: 3908 },
    { name: 'Kirkos', assets: Math.floor(totalItems * 0.05), value: 4800 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Executive Overview</h1>
        <p className="text-muted-foreground">High-level metrics across all branches.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2"><CardTitle className="text-sm opacity-80">Total Asset Value</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{(totalValue / 1000000).toFixed(1)}M Birr</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Items</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" /><div className="text-2xl font-bold">{totalItems.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Critical Stock Alerts</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><div className="text-2xl font-bold">{criticalStockItems.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Utilization Rate</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><div className="text-2xl font-bold">94%</div></CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {criticalStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Stock Alert</AlertTitle>
          <AlertDescription>
            There are {criticalStockItems.length} items below the 10% threshold. Immediate procurement action required.
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution by Branch</CardTitle>
            <CardDescription>Volume of assets held at each location</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA_BRANCHES}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="assets" fill="hsl(215 100% 30%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Status Breakdown</CardTitle>
            <CardDescription>Current lifecycle state of all inventory</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DATA_STATUS}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DATA_STATUS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-sm mt-4">
              {DATA_STATUS.map(s => (
                <div key={s.name} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
