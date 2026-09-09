import { useState } from "react";
import { useDigitalStore } from "../store";
import { useInventoryStore } from "@/domains/inventory/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Shield, AlertTriangle, Server, RefreshCw, Activity, Lock, Globe, Plus } from "lucide-react";
import { toast } from "sonner";

const RegisterAssetDialog = () => {
    const { skus } = useInventoryStore();
    const { registerDigitalAsset } = useDigitalStore();
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [selectedAssetId, setSelectedAssetId] = useState("");
    const [os, setOs] = useState("");
    const [ram, setRam] = useState("");
    const [storage, setStorage] = useState("");
    const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
    const [newApp, setNewApp] = useState("");
    const [installedApps, setInstalledApps] = useState<Array<{ name: string; version: string }>>([]);

    // Filter for "Digital-capable" assets (e.g., Electronics)
    const digitalCandidates = skus.filter(s => s.category === 'SERIALIZED' || s.category === 'DIGITAL' || s.name.toLowerCase().includes('laptop') || s.name.toLowerCase().includes('screen') || s.name.toLowerCase().includes('computer'));

    const handleSystemToggle = (sys: string) => {
        if (selectedSystems.includes(sys)) {
            setSelectedSystems(selectedSystems.filter(s => s !== sys));
        } else {
            setSelectedSystems([...selectedSystems, sys]);
        }
    };

    const addApp = () => {
        if (newApp.trim()) {
            // Simple check to separate name and version if provided (e.g. "Office v16")
            const parts = newApp.split(' v');
            const name = parts[0];
            const version = parts.length > 1 ? `v${parts[1]}` : 'Latest';

            setInstalledApps([...installedApps, { name, version }]);
            setNewApp("");
        }
    };

    const handleSubmit = () => {
        const assetName = skus.find(s => s.id === selectedAssetId)?.name || 'Unknown Asset';

        registerDigitalAsset({
            id: `DIGI-${Math.floor(Math.random() * 10000)}`,
            type: 'HARDWARE',
            assetId: selectedAssetId,
            name: assetName,
            os,
            ram,
            storage,
            installedApps,
            connectedSystems: {}, // Not in type but maybe logic needed? Wait, type says connectedSystems not there?
            // checking Store type: connectedTo?: string. 
            // The form has 'connectedSystem' list. The interface doesn't seem to support string[] for systems.
            // Interface says: connectedTo?: string.
            // The form allows multiple. Maybe I should join them or fix type?  
            // store.ts has: connectedSystems: undefined in DigitalAsset interface. 
            // Let's check store.ts again.
            // line 78: connectedTo?: string;
            // No connectedSystems array.
            // I'll join them for now into 'connectedTo' or ignore.
            // Let's use connectedTo: selectedSystems.join(', ')
            connectedTo: selectedSystems.join(', '),
            registeredAt: new Date().toISOString()
        } as any); // using any temporarily to bypass strict check if I missed something or just fix properties.
        // Actually let's try to match strictly.
        /*
         id: string;
         type: DigitalAssetType;
         name: string;
         registeredAt: string;
         assetId?: string;
         os?: string;
         ram?: string;
         storage?: string;
         processor?: string;
         installedApps?: {name, version}[];
         connectedTo?: string;
         */

        registerDigitalAsset({
            id: `DIGI-${Math.floor(Math.random() * 10000)}`,
            type: 'HARDWARE',
            assetId: selectedAssetId,
            name: assetName,
            os,
            ram,
            storage,
            installedApps,
            connectedTo: selectedSystems.join(', '),
            registeredAt: new Date().toISOString()
        });

        toast.success(`Registered ${assetName} as Digital Asset`);
        setIsOpen(false);
        // Reset form
        setSelectedAssetId("");
        setOs("");
        setRam("");
        setStorage("");
        setSelectedSystems([]);
        setInstalledApps([]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="border-primary/20 hover:bg-primary/5 hover:border-primary/50">
                    <Plus className="w-4 h-4 mr-2" /> Register Digital Asset
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Register New Digital Asset</DialogTitle>
                    <DialogDescription>Enrich physical inventory with digital specifications and system connections.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Step 1: Select Physical Asset */}
                    <div className="space-y-2">
                        <Label>Select Physical Asset (From Inventory)</Label>
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedAssetId}
                            onChange={(e) => setSelectedAssetId(e.target.value)}
                        >
                            <option value="">-- Select Asset --</option>
                            {digitalCandidates.map(sku => (
                                <option key={sku.id} value={sku.id}>{sku.name} ({sku.currentStock} in stock)</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Operating System</Label>
                            <Input placeholder="e.g. Windows 11 Pro" value={os} onChange={(e) => setOs(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>RAM</Label>
                            <Input placeholder="e.g. 16GB DDR5" value={ram} onChange={(e) => setRam(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Storage</Label>
                            <Input placeholder="e.g. 512GB SSD" value={storage} onChange={(e) => setStorage(e.target.value)} />
                        </div>
                    </div>

                    {/* Step 3: Connected Systems */}
                    <div className="space-y-3">
                        <Label>Connected Organization Systems</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {['A-MESOB HRMS', 'Queue Management (QMS)', 'Inventory Management (IMS)', 'Fayda Identity', 'Revenue Service', 'Transport Grid'].map(sys => (
                                <div key={sys} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => handleSystemToggle(sys)}>
                                    <Checkbox checked={selectedSystems.includes(sys)} id={sys} />
                                    <label htmlFor={sys} className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                        {sys}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 4: Installed Apps */}
                    <div className="space-y-2">
                        <Label>Installed Applications & Versions</Label>
                        <div className="flex gap-2">
                            <Input placeholder="App Name & Version (e.g. Office 365 v16.0)" value={newApp} onChange={(e) => setNewApp(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addApp()} />
                            <Button variant="secondary" onClick={addApp} type="button">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {installedApps.map((app, idx) => (
                                <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                    {app.name} <span className="text-[10px] opacity-70">({app.version})</span>
                                    <span className="cursor-pointer hover:text-red-500 ml-1" onClick={() => setInstalledApps(installedApps.filter((_, i) => i !== idx))}>×</span>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!selectedAssetId}>Confirm Registration</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function DigitalDashboardPage() {
    const { systems, licenses, branchHealth, auditLogs, runDigitalPulse, resolveVulnerability } = useDigitalStore();

    // Aggregates
    const globalCompliance = Math.round(systems.reduce((acc, s) => acc + s.complianceRate, 0) / systems.length);
    const criticalVulnerabilities = systems.filter(s => s.status === 'VULNERABLE').length;
    const expiringLicenses = licenses.filter(l => l.riskScore > 50).length;

    const handlePulse = () => {
        toast.info("Initiating Digital Pulse Scan...");
        setTimeout(() => {
            runDigitalPulse();
            toast.success("Global Pulse Scan Completed");
        }, 1500);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header / High-Level Stats */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Shield className="w-8 h-8" /> Digital Governance Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Auditing System Integrity, Licensing, and Security Posture across 40+ branches.
                    </p>
                </div>
                <div className="flex gap-2">
                    <RegisterAssetDialog />
                    <Button onClick={handlePulse} size="lg" className="shadow-lg shadow-primary/25">
                        <Activity className="w-4 h-4 mr-2 animate-pulse" /> Run Digital Pulse
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Global Version Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-700 dark:text-green-400">{globalCompliance}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Target: 99%</p>
                    </CardContent>
                </Card>
                <Card className={criticalVulnerabilities > 0 ? "bg-red-50 dark:bg-red-950 border-red-200" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Critical Vulnerabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${criticalVulnerabilities > 0 ? 'text-red-600' : 'text-foreground'}`}>
                            {criticalVulnerabilities}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Immediate Action Required</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active SaaS Licenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{licenses.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">{expiringLicenses} High Risk / Expiring</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Last Global Audit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Today</div>
                        <p className="text-xs text-muted-foreground mt-1">Signed by AUTO-BOT</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUMN 1 & 2: Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. Global Systems Health Map */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-500" /> Global Branch Health Map
                            </CardTitle>
                            <CardDescription>Real-time version and security status of connected branches.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {branchHealth.map(branch => (
                                    <div key={branch.branchId} className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors flex flex-col items-center text-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${branch.versionStatus === 'GREEN' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse'}`} />
                                        <div>
                                            <p className="font-bold text-sm">{branch.branchName}</p>
                                            <p className="text-xs text-muted-foreground">Score: {branch.securityScore}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Software & Version Registry */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="w-5 h-5 text-indigo-500" /> Software Version Registry
                            </CardTitle>
                            <CardDescription>Official catalog of approved digital systems.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>System Name</TableHead>
                                        <TableHead>Current Version</TableHead>
                                        <TableHead>Compliance</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {systems.map(sys => (
                                        <TableRow key={sys.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{sys.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{sys.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{sys.version}</span>
                                                    {sys.version !== sys.targetVersion && (
                                                        <span className="text-xs text-red-500 flex items-center">
                                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                                            Target: {sys.targetVersion}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-primary h-full rounded-full" style={{ width: `${sys.complianceRate}%` }} />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{sys.complianceRate}% of devices</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={sys.status === 'COMPLIANT' ? 'default' : sys.status === 'VULNERABLE' ? 'destructive' : 'secondary'}>
                                                    {sys.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {sys.status === 'VULNERABLE' && (
                                                    <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => resolveVulnerability(sys.id)}>
                                                        <RefreshCw className="w-3 h-3 mr-1" /> Force Patch
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* 3. License Compliance Gauges */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-orange-500" /> License Compliance Radar
                            </CardTitle>
                            <CardDescription>Monitoring Over-licensing (Wait) and Under-licensing (Risk).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {licenses.map(lic => {
                                    const usagePercent = Math.round((lic.usedSeats / lic.totalSeats) * 100);
                                    const isRisk = usagePercent > 90 || lic.riskScore > 50;

                                    return (
                                        <div key={lic.id} className="border rounded-lg p-4 relative overflow-hidden">
                                            {isRisk && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full -mr-8 -mt-8" />}
                                            <div className="flex justify-between mb-2">
                                                <h3 className="font-bold text-sm">{lic.vendor}</h3>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isRisk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    Risk: {lic.riskScore}/100
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-3">{lic.name}</p>

                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Usage</span>
                                                <span>{lic.usedSeats} / {lic.totalSeats} seats</span>
                                            </div>
                                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-4">
                                                <div
                                                    className={`h-full rounded-full transition-all ${usagePercent > 100 ? 'bg-red-600' : usagePercent > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-2">
                                                <span>Exp: {new Date(lic.expiryDate).toLocaleDateString()}</span>
                                                <span className="font-mono">${lic.cost.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* COLUMN 3: Sidebar / Audit Log */}
                <div className="space-y-8">
                    <Card className="h-full max-h-[calc(100vh-200px)] flex flex-col">
                        <CardHeader>
                            <CardTitle>Digital Audit Log</CardTitle>
                            <CardDescription>Tamper-proof immutable ledger</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="relative pl-4 border-l-2 border-muted space-y-8">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="relative">
                                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-background ${log.severity === 'CRITICAL' ? 'bg-red-500' :
                                            log.severity === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`} />
                                        <p className="text-xs text-muted-foreground font-mono mb-0.5">{log.timestamp}</p>
                                        <p className="text-sm font-semibold">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">{log.target}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
