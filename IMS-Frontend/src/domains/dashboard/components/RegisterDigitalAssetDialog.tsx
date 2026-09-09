import { useState } from "react";
import { useInventoryStore } from "@/domains/inventory/store";
import { useDigitalStore, DigitalAssetType } from "@/domains/digital/store";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Plus, Laptop, Monitor, Server } from "lucide-react";
import { toast } from "sonner";

export const RegisterDigitalAssetDialog = () => {
    const { skus } = useInventoryStore();
    const { registerDigitalAsset } = useDigitalStore();
    const [isOpen, setIsOpen] = useState(false);
    const [assetType, setAssetType] = useState<DigitalAssetType | null>(null);

    // Hardware fields
    const [selectedAssetId, setSelectedAssetId] = useState("");
    const [os, setOs] = useState("");
    const [ram, setRam] = useState("");
    const [storage, setStorage] = useState("");
    const [processor, setProcessor] = useState("");
    const [appName, setAppName] = useState("");
    const [appVersion, setAppVersion] = useState("");
    const [installedApps, setInstalledApps] = useState<Array<{ name: string; version: string }>>([]);

    // Display fields
    const [displayName, setDisplayName] = useState("");
    const [displayType, setDisplayType] = useState("");
    const [resolution, setResolution] = useState("");
    const [location, setLocation] = useState("");
    const [connectedTo, setConnectedTo] = useState("");

    // Software fields
    const [softwareName, setSoftwareName] = useState("");
    const [systemType, setSystemType] = useState("");
    const [version, setVersion] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [serverName, setServerName] = useState("");
    const [port, setPort] = useState("");
    const [database, setDatabase] = useState("");
    const [deploymentType, setDeploymentType] = useState("On-Premise");

    const hardwareCandidates = skus.filter(s =>
        s.category === 'SERIALIZED' ||
        s.name.toLowerCase().includes('laptop') ||
        s.name.toLowerCase().includes('computer') ||
        s.name.toLowerCase().includes('desktop')
    );

    const displayCandidates = skus.filter(s =>
        s.name.toLowerCase().includes('screen') ||
        s.name.toLowerCase().includes('monitor') ||
        s.name.toLowerCase().includes('display')
    );

    const addApp = () => {
        if (appName.trim() && appVersion.trim()) {
            setInstalledApps([...installedApps, { name: appName, version: appVersion }]);
            setAppName("");
            setAppVersion("");
        }
    };

    const handleSubmit = () => {
        if (assetType === 'HARDWARE') {
            const assetName = skus.find(s => s.id === selectedAssetId)?.name || 'Unknown Asset';
            registerDigitalAsset({
                id: `DIGI-HW-${Math.floor(Math.random() * 10000)}`,
                type: 'HARDWARE',
                name: assetName,
                assetId: selectedAssetId,
                os,
                ram,
                storage,
                processor,
                installedApps,
                registeredAt: new Date().toISOString()
            });
            toast.success(`Registered ${assetName} as Digital Hardware Asset`);
        } else if (assetType === 'DISPLAY') {
            const assetName = selectedAssetId ? skus.find(s => s.id === selectedAssetId)?.name : displayName;
            registerDigitalAsset({
                id: `DIGI-DISP-${Math.floor(Math.random() * 10000)}`,
                type: 'DISPLAY',
                name: assetName || displayName,
                assetId: selectedAssetId || undefined,
                displayType,
                resolution,
                location,
                connectedTo,
                registeredAt: new Date().toISOString()
            });
            toast.success(`Registered ${assetName || displayName} as Display System`);
        } else if (assetType === 'SOFTWARE') {
            registerDigitalAsset({
                id: `DIGI-SW-${Math.floor(Math.random() * 10000)}`,
                type: 'SOFTWARE',
                name: softwareName,
                systemType,
                version,
                ipAddress,
                serverName,
                port,
                database,
                deploymentType,
                registeredAt: new Date().toISOString()
            });
            toast.success(`Registered ${softwareName} Software System`);
        }

        resetForm();
        setIsOpen(false);
    };

    const resetForm = () => {
        setAssetType(null);
        setSelectedAssetId("");
        setOs("");
        setRam("");
        setStorage("");
        setProcessor("");
        setInstalledApps([]);
        setDisplayName("");
        setDisplayType("");
        setResolution("");
        setLocation("");
        setConnectedTo("");
        setSoftwareName("");
        setSystemType("");
        setVersion("");
        setIpAddress("");
        setServerName("");
        setPort("");
        setDatabase("");
        setDeploymentType("On-Premise");
    };

    const canSubmit = () => {
        if (assetType === 'HARDWARE') return selectedAssetId;
        if (assetType === 'DISPLAY') return (selectedAssetId || displayName) && displayType;
        if (assetType === 'SOFTWARE') return softwareName && systemType;
        return false;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
                <Button variant="default" className="shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" /> Register Digital Asset
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Register Digital Asset</DialogTitle>
                    <DialogDescription>
                        Register hardware, display systems, or software applications with digital specifications
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Step 1: Select Asset Type */}
                    {!assetType && (
                        <div className="space-y-3">
                            <Label>Select Asset Type</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setAssetType('HARDWARE')}
                                    className="p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3 group"
                                >
                                    <Laptop className="w-12 h-12 text-muted-foreground group-hover:text-primary" />
                                    <div className="text-center">
                                        <p className="font-bold">Hardware</p>
                                        <p className="text-xs text-muted-foreground">Laptops, Computers</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setAssetType('DISPLAY')}
                                    className="p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3 group"
                                >
                                    <Monitor className="w-12 h-12 text-muted-foreground group-hover:text-primary" />
                                    <div className="text-center">
                                        <p className="font-bold">Display System</p>
                                        <p className="text-xs text-muted-foreground">Queue Screens, Signage</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setAssetType('SOFTWARE')}
                                    className="p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3 group"
                                >
                                    <Server className="w-12 h-12 text-muted-foreground group-hover:text-primary" />
                                    <div className="text-center">
                                        <p className="font-bold">Software System</p>
                                        <p className="text-xs text-muted-foreground">HRMS, IMS, QMS</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hardware Form */}
                    {assetType === 'HARDWARE' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline">Hardware Asset</Badge>
                                <Button variant="ghost" size="sm" onClick={() => setAssetType(null)}>Change Type</Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Hardware from Inventory *</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={selectedAssetId}
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                >
                                    <option value="">-- Select Hardware --</option>
                                    {hardwareCandidates.map(sku => (
                                        <option key={sku.id} value={sku.id}>{sku.name} ({sku.currentStock} in stock)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Operating System</Label>
                                    <Input placeholder="e.g. Windows 11 Pro" value={os} onChange={(e) => setOs(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Processor</Label>
                                    <Input placeholder="e.g. Intel i7-12700H" value={processor} onChange={(e) => setProcessor(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>RAM</Label>
                                    <Input placeholder="e.g. 16GB DDR5" value={ram} onChange={(e) => setRam(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Storage</Label>
                                    <Input placeholder="e.g. 512GB NVMe SSD" value={storage} onChange={(e) => setStorage(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Installed Applications</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="App Name" value={appName} onChange={(e) => setAppName(e.target.value)} className="flex-1" />
                                    <Input placeholder="Version" value={appVersion} onChange={(e) => setAppVersion(e.target.value)} className="w-32" />
                                    <Button variant="secondary" onClick={addApp} type="button">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {installedApps.map((app, idx) => (
                                        <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1">
                                            {app.name} v{app.version}
                                            <span className="cursor-pointer hover:text-red-500 ml-2" onClick={() => setInstalledApps(installedApps.filter((_, i) => i !== idx))}>×</span>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Display Form */}
                    {assetType === 'DISPLAY' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline">Display System</Badge>
                                <Button variant="ghost" size="sm" onClick={() => setAssetType(null)}>Change Type</Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Select from Inventory (Optional)</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={selectedAssetId}
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                >
                                    <option value="">-- Or enter custom name below --</option>
                                    {displayCandidates.map(sku => (
                                        <option key={sku.id} value={sku.id}>{sku.name}</option>
                                    ))}
                                </select>
                            </div>

                            {!selectedAssetId && (
                                <div className="space-y-2">
                                    <Label>Display Name *</Label>
                                    <Input placeholder="e.g. Queue Screen - Main Hall" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Display Type *</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={displayType}
                                        onChange={(e) => setDisplayType(e.target.value)}
                                    >
                                        <option value="">-- Select Type --</option>
                                        <option value="Queue Management">Queue Management</option>
                                        <option value="Digital Signage">Digital Signage</option>
                                        <option value="Information Display">Information Display</option>
                                        <option value="Counter Screen">Counter Screen</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Resolution</Label>
                                    <Input placeholder="e.g. 1920x1080" value={resolution} onChange={(e) => setResolution(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input placeholder="e.g. Main Hall, Counter 3" value={location} onChange={(e) => setLocation(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Connected To</Label>
                                    <Input placeholder="e.g. Queue Management System" value={connectedTo} onChange={(e) => setConnectedTo(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Software Form */}
                    {assetType === 'SOFTWARE' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline">Software System</Badge>
                                <Button variant="ghost" size="sm" onClick={() => setAssetType(null)}>Change Type</Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>System Name *</Label>
                                    <Input placeholder="e.g. A-MESOB HRMS" value={softwareName} onChange={(e) => setSoftwareName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>System Type *</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={systemType}
                                        onChange={(e) => setSystemType(e.target.value)}
                                    >
                                        <option value="">-- Select Type --</option>
                                        <option value="HRMS">HRMS (Human Resource)</option>
                                        <option value="IMS">IMS (Inventory Management)</option>
                                        <option value="QMS">QMS (Queue Management)</option>
                                        <option value="Finance">Finance System</option>
                                        <option value="CRM">CRM (Customer Relationship)</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Version</Label>
                                    <Input placeholder="e.g. 2.5.1" value={version} onChange={(e) => setVersion(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deployment Type</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={deploymentType}
                                        onChange={(e) => setDeploymentType(e.target.value)}
                                    >
                                        <option value="On-Premise">On-Premise</option>
                                        <option value="Cloud">Cloud</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>IP Address</Label>
                                    <Input placeholder="e.g. 192.168.1.100" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Port</Label>
                                    <Input placeholder="e.g. 8080" value={port} onChange={(e) => setPort(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Server Name</Label>
                                    <Input placeholder="e.g. AMESOB-SRV-01" value={serverName} onChange={(e) => setServerName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Database</Label>
                                    <Input placeholder="e.g. PostgreSQL, MySQL" value={database} onChange={(e) => setDatabase(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {assetType && (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssetType(null)}>Back</Button>
                        <Button onClick={handleSubmit} disabled={!canSubmit()}>Confirm Registration</Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};
