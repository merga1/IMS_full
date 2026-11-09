import { useState, useEffect } from "react";
import { useAuthStore } from "@/state/auth.store";
import { useAdminStore } from "@/domains/admin/store";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/shared/ui/accordion";
import { Building2, User, ShieldCheck, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { User as UserType } from "@/shared/types";

const USERS_PER_PAGE = 5;

function BranchUserList({ users }: { users: UserType[] }) {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(users.length / USERS_PER_PAGE);

    const paginatedUsers = users.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

    if (users.length === 0) {
        return (
            <div className="text-center py-6 text-muted-foreground text-xs italic border-2 border-dashed rounded-lg">
                No personnel assigned
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {paginatedUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-white">
                                {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : u.fullName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-bold leading-none">{u.fullName}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{u.role} • Rank {u.rank}</p>
                            </div>
                        </div>
                        {u.role === 'SYSTEM_ADMIN' && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <span className="text-muted-foreground">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SystemHierarchyPage() {
    const { users, fetchUsers } = useAuthStore();
    const { knownBranches, branchStructure } = useAdminStore();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">System Hierarchy Map</h1>
                    <p className="text-muted-foreground">Active organizational structure and personnel assignment.</p>
                </div>
                <div className="flex gap-4">
                    <Card className="px-4 py-2 flex items-center gap-2 bg-blue-50 border-blue-100">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-blue-800">{knownBranches.length} Branches</span>
                    </Card>
                    <Card className="px-4 py-2 flex items-center gap-2 bg-green-50 border-green-100">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-green-800">{users.length} Active Users</span>
                    </Card>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                        {knownBranches.map((branch, idx) => {
                            const branchUsers = users.filter(u => u.branch === branch);
                            const structure = branchStructure[branch];

                            return (
                                <AccordionItem key={branch} value={branch} className={`px-6 ${idx === knownBranches.length - 1 ? 'border-b-0' : ''}`}>
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-bold text-sm tracking-tight">{branch}</h3>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                                                        {branchUsers.length} Personnel • {structure ? structure.floors.length : 0} Floors
                                                    </p>
                                                </div>
                                            </div>

                                            {structure && (
                                                <div className="flex gap-1 hidden md:flex">
                                                    {structure.floors.slice(0, 3).map(f => (
                                                        <Badge key={f.id} variant="secondary" className="text-[9px]">
                                                            {f.name}
                                                        </Badge>
                                                    ))}
                                                    {structure.floors.length > 3 && (
                                                        <Badge variant="secondary" className="text-[9px]">+{structure.floors.length - 3}</Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6">
                                        <div className="pl-14 space-y-6">
                                            {structure && (
                                                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <MapPin className="w-3 h-3" /> Location Structure
                                                    </h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {structure.floors.map(f => (
                                                            <div key={f.id} className="text-xs p-2 bg-background rounded border">
                                                                <span className="font-bold">{f.name}</span>
                                                                <br />
                                                                <span className="text-muted-foreground">{f.rooms.length} Rooms</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <User className="w-3 h-3" /> Assigned Personnel
                                                </h4>
                                                <BranchUserList users={branchUsers} />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
