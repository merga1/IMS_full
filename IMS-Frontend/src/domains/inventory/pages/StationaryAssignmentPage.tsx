import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { MapPin, Armchair, Search, CheckCircle2, Layers } from "lucide-react";
import { useInventoryStore } from "../store";
import { useAuthStore } from "@/state/auth.store";
import { toast } from "sonner";
import { Asset } from "@/shared/types";

// Mock Location Data (Should be fetched from API/Store)
const FLOORS = ["Floor 1", "Floor 2", "Floor 3"];
const ROOMS: Record<string, string[]> = {
    "Floor 1": ["Room 101 (Reception)", "Room 102 (Waiting Area)", "Room 103 (Security)"],
    "Floor 2": ["Room 201 (Office)", "Room 202 (Meeting Room)", "Room 203 (Office)"],
    "Floor 3": ["Room 301 (Director Office)", "Room 302 (Server Room)"],
};

export default function StationaryAssignmentPage() {
    const { user } = useAuthStore();
    const { assets, placeAsset } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState("");

    // Bulk Assignment State
    const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
    const [assignQuantity, setAssignQuantity] = useState(1);
    const [placement, setPlacement] = useState({ floor: "", room: "" });

    // Filter assets: My Branch, Stationary, In Store (or unassigned room)
    const unplacedAssets = assets.filter(asset =>
        asset.branch === user?.branch &&
        asset.category === 'STATIONARY' &&
        (!asset.floor || !asset.room)
    ).filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group assets by Name
    const groupedAssets = unplacedAssets.reduce((acc, asset) => {
        if (!acc[asset.name]) {
            acc[asset.name] = [];
        }
        acc[asset.name].push(asset);
        return acc;
    }, {} as Record<string, Asset[]>);

    const selectedGroupAssets = selectedGroupName ? groupedAssets[selectedGroupName] || [] : [];
    const maxQuantity = selectedGroupAssets.length;

    const handleAssign = () => {
        if (!selectedGroupName || !placement.floor || !placement.room || assignQuantity <= 0) return;

        // Take the first N assets from the group
        const assetsToAssign = selectedGroupAssets.slice(0, assignQuantity);

        // Assign each one
        assetsToAssign.forEach(asset => {
            placeAsset(asset.id, placement.floor, placement.room);
        });

        toast.success(`Assigned ${assignQuantity} x ${selectedGroupName} to ${placement.room}`);

        // Reset
        setSelectedGroupName(null);
        setPlacement({ floor: "", room: "" });
        setAssignQuantity(1);
    };

    if (!user?.branch) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Stationary Assignment</h1>
                <p className="text-muted-foreground">
                    Place incoming furniture and equipment into specific rooms
                </p>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search assets..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(groupedAssets).length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                        <Armchair className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No unplaced stationary assets found.</p>
                    </div>
                ) : (
                    Object.entries(groupedAssets).map(([name, groupAssets]) => (
                        <Card key={name} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex justify-between items-start">
                                    <span>{name}</span>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                        {groupAssets.length} Available
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Stationary Item
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    <span>Bulk Assignment Available</span>
                                </div>
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() => {
                                        setSelectedGroupName(name);
                                        setAssignQuantity(1);
                                    }}
                                >
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Assign to Room
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={!!selectedGroupName} onOpenChange={(open) => !open && setSelectedGroupName(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Location</DialogTitle>
                        <DialogDescription>
                            Placing <strong>{selectedGroupName}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                            <Label>Quantity to Place</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="number"
                                    min={1}
                                    max={maxQuantity}
                                    value={assignQuantity}
                                    onChange={(e) => setAssignQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 0)))}
                                    className="w-24 font-bold text-center"
                                />
                                <span className="text-sm text-muted-foreground">
                                    / {maxQuantity} available
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Floor</Label>
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
                            <Label>Room</Label>
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
                        <Button variant="outline" onClick={() => setSelectedGroupName(null)}>Cancel</Button>
                        <Button onClick={handleAssign} disabled={!placement.floor || !placement.room || assignQuantity <= 0}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Placement ({assignQuantity})
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
