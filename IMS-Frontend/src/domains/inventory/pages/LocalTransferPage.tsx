import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { MapPin, Search, Move, CheckCircle2 } from "lucide-react";
import { useInventoryStore } from "../store";
import { useAuthStore } from "@/state/auth.store";
import { toast } from "sonner";
import { Asset } from "@/shared/types";

// Mock Location Data (Duplicated for prototype speed)
const FLOORS = ["Floor 1", "Floor 2", "Floor 3"];
const ROOMS: Record<string, string[]> = {
    "Floor 1": ["Room 101 (Reception)", "Room 102 (Waiting Area)", "Room 103 (Security)"],
    "Floor 2": ["Room 201 (Office)", "Room 202 (Meeting Room)", "Room 203 (Office)"],
    "Floor 3": ["Room 301 (Director Office)", "Room 302 (Server Room)"],
};

export default function LocalTransferPage() {
    const { user } = useAuthStore();
    const { assets, placeAsset } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [placement, setPlacement] = useState({ floor: "", room: "" });

    // Filter assets: My Branch, Stationary, HAS location (already placed)
    const placedAssets = assets.filter(asset =>
        asset.branch === user?.branch &&
        asset.category === 'STATIONARY' &&
        asset.floor && asset.room
    ).filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRelocate = () => {
        if (!selectedAsset || !placement.floor || !placement.room) return;

        if (placement.floor === selectedAsset.floor && placement.room === selectedAsset.room) {
            toast.error("New location must be different from current location");
            return;
        }

        placeAsset(selectedAsset.id, placement.floor, placement.room);
        toast.success(`Moved ${selectedAsset.name} to ${placement.room}`);
        setSelectedAsset(null);
        setPlacement({ floor: "", room: "" });
    };

    if (!user?.branch) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Local Relocation</h1>
                <p className="text-muted-foreground">
                    Move assets between rooms (e.g., personnel office change)
                </p>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search placed assets..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {placedAssets.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                        <Move className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No placed stationary assets found matching your search.</p>
                    </div>
                ) : (
                    placedAssets.map(asset => (
                        <Card key={asset.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex justify-between items-start">
                                    <span>{asset.name}</span>
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                </CardTitle>
                                <CardDescription className="font-mono text-xs">
                                    {asset.id}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/30 p-2 rounded text-sm mb-4 border border-dashed">
                                    <span className="font-semibold">{asset.room}</span> <br />
                                    <span className="text-xs text-muted-foreground">{asset.floor}</span>
                                </div>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedAsset(asset);
                                        // Optional: pre-fill current location? No, force selection
                                    }}
                                >
                                    <Move className="w-4 h-4 mr-2" />
                                    Relocate
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Relocate Asset</DialogTitle>
                        <DialogDescription>
                            Move <strong>{selectedAsset?.name}</strong> from {selectedAsset?.room} to:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>New Floor</Label>
                            <Select
                                value={placement.floor}
                                onValueChange={(val) => setPlacement(prev => ({ ...prev, floor: val, room: "" }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Floor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FLOORS.map(floor => (
                                        <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>New Room</Label>
                            <Select
                                value={placement.room}
                                onValueChange={(val) => setPlacement(prev => ({ ...prev, room: val }))}
                                disabled={!placement.floor}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {placement.floor && ROOMS[placement.floor]?.map(room => (
                                        <SelectItem key={room} value={room}>{room}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedAsset(null)}>Cancel</Button>
                        <Button onClick={handleRelocate} disabled={!placement.floor || !placement.room}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Move
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
