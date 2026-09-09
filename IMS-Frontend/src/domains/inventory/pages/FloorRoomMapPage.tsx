import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";
import { MapPin, Box, LayoutGrid, Move } from "lucide-react";
import { useInventoryStore } from "../store";
import { useAuthStore } from "@/state/auth.store";

// Mock Location Data (Shared constant in real app)
const FLOORS = ["Floor 1", "Floor 2", "Floor 3"];
const ROOMS: Record<string, string[]> = {
    "Floor 1": ["Room 101 (Reception)", "Room 102 (Waiting Area)", "Room 103 (Security)"],
    "Floor 2": ["Room 201 (Office)", "Room 202 (Meeting Room)", "Room 203 (Office)"],
    "Floor 3": ["Room 301 (Director Office)", "Room 302 (Server Room)"],
};

export default function FloorRoomMapPage() {
    const { user } = useAuthStore();
    const { assets } = useInventoryStore();

    // Filter assets: My Branch, Stationary, has location
    const placedAssets = assets.filter(asset =>
        asset.branch === user?.branch &&
        asset.category === 'STATIONARY' &&
        asset.floor && asset.room
    );

    const getAssetsInRoom = (floor: string, room: string) => {
        return placedAssets.filter(a => a.floor === floor && a.room === room);
    };

    if (!user?.branch) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Location Map</h1>
                <p className="text-muted-foreground">
                    Visual overview of stationary assets by Floor and Room
                </p>
            </div>

            <div className="grid gap-6">
                {FLOORS.map(floor => (
                    <Card key={floor} className="border-l-4 border-l-gold/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                                {floor}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" className="w-full">
                                {ROOMS[floor]?.map(room => {
                                    const roomAssets = getAssetsInRoom(floor, room);
                                    return (
                                        <AccordionItem key={room} value={room}>
                                            <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-4 rounded-lg">
                                                <div className="flex items-center gap-4 w-full">
                                                    <div className="flex items-center gap-2 text-left">
                                                        <Box className="w-4 h-4 text-muted-foreground opacity-70" />
                                                        <span className="font-semibold">{room}</span>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-2 mr-4">
                                                        <Badge variant={roomAssets.length > 0 ? "secondary" : "outline"}>
                                                            {roomAssets.length} Assets
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 py-4 bg-muted/10 rounded-b-lg">
                                                {roomAssets.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground italic pl-6">No assets assigned to this room.</p>
                                                ) : (
                                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                        {roomAssets.map(asset => (
                                                            <div key={asset.id} className="flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        <MapPin className="w-4 h-4 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-sm">{asset.name}</div>
                                                                        <div className="text-xs text-muted-foreground font-mono">{asset.id}</div>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                    <Move className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
