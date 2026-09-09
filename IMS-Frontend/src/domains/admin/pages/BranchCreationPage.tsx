import { useState } from "react";
import { useAdminStore } from "@/domains/admin/store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Building2, Layers, MapPin, Plus, Trash2, Save, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Floor {
    id: string;
    name: string;
    rooms: string[];
}

export default function BranchCreationPage() {
    const { addBranch, knownBranches } = useAdminStore();
    const [, setLocation] = useLocation();

    const [step, setStep] = useState(1);
    const [branchName, setBranchName] = useState("");
    const [floors, setFloors] = useState<Floor[]>([
        { id: 'f-1', name: 'Ground Floor', rooms: ['Reception'] }
    ]);

    const addFloor = () => {
        setFloors([...floors, { id: `f-${Date.now()}`, name: `Floor ${floors.length}`, rooms: [] }]);
    };

    const removeFloor = (idx: number) => {
        setFloors(floors.filter((_, i) => i !== idx));
    };

    const updateFloorName = (idx: number, name: string) => {
        const newFloors = [...floors];
        newFloors[idx].name = name;
        setFloors(newFloors);
    };

    const addRoom = (floorIdx: number) => {
        const newFloors = [...floors];
        newFloors[floorIdx].rooms.push(`Room ${newFloors[floorIdx].rooms.length + 1}`);
        setFloors(newFloors);
    };

    const updateRoom = (floorIdx: number, roomIdx: number, val: string) => {
        const newFloors = [...floors];
        newFloors[floorIdx].rooms[roomIdx] = val;
        setFloors(newFloors);
    };

    const removeRoom = (floorIdx: number, roomIdx: number) => {
        const newFloors = [...floors];
        newFloors[floorIdx].rooms = newFloors[floorIdx].rooms.filter((_, i) => i !== roomIdx);
        setFloors(newFloors);
    };

    const handleCreate = () => {
        if (knownBranches.includes(branchName.toUpperCase())) {
            toast.error("Branch already exists!");
            return;
        }

        // Save to store
        addBranch(branchName.toUpperCase(), { floors });
        toast.success(`Branch ${branchName} Established!`);
        setLocation("/admin");
    };

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Establish New Branch</h1>
                    <p className="text-muted-foreground">Define physical structure for asset tracking.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Steps Sidebar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Configuration Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            variant={step === 1 ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setStep(1)}
                        >
                            <Building2 className="w-4 h-4 mr-2" /> Basic Info
                        </Button>
                        <Button
                            variant={step === 2 ? "default" : "ghost"}
                            className="w-full justify-start"
                            disabled={!branchName}
                            onClick={() => setStep(2)}
                        >
                            <Layers className="w-4 h-4 mr-2" /> Structure Map
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="space-y-6">
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Branch Identity</CardTitle>
                                <CardDescription>Enter the official designation for the new location.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Branch Name / Code</Label>
                                    <Input
                                        placeholder="e.g., Kality, Akaki"
                                        value={branchName}
                                        onChange={e => setBranchName(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end border-t pt-6">
                                <Button onClick={() => setStep(2)} disabled={!branchName}>
                                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Structure Map: {branchName}</CardTitle>
                                        <CardDescription>Define floors/zones and specific rooms.</CardDescription>
                                    </div>
                                    <Button size="sm" onClick={addFloor} variant="outline">
                                        <Plus className="w-4 h-4 mr-2" /> Add Floor
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {floors.map((floor, fIdx) => (
                                    <div key={floor.id} className="border rounded-lg p-4 bg-muted/20 relative group">
                                        <div className="flex gap-4 items-center mb-4">
                                            <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <Input
                                                value={floor.name}
                                                onChange={e => updateFloorName(fIdx, e.target.value)}
                                                className="font-bold border-transparent hover:border-input focus:border-input transition-colors max-w-[200px]"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                                                onClick={() => removeFloor(fIdx)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="pl-14 space-y-2">
                                            {floor.rooms.map((room, rIdx) => (
                                                <div key={rIdx} className="flex gap-2 items-center">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        value={room}
                                                        onChange={e => updateRoom(fIdx, rIdx, e.target.value)}
                                                        className="h-8 max-w-[300px]"
                                                        placeholder="Room Name/Number"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => removeRoom(fIdx, rIdx)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button variant="ghost" size="sm" className="h-8 text-xs ml-6" onClick={() => addRoom(fIdx)}>
                                                <Plus className="w-3 h-3 mr-1" /> Add Room
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="justify-end border-t pt-6 gap-2">
                                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={handleCreate} disabled={floors.length === 0}>
                                    <Save className="w-4 h-4 mr-2" /> Establish Branch
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
