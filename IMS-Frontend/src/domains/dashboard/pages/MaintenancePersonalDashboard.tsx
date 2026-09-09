import { useAuthStore } from "@/state/auth.store";
import { useIncidentStore } from "@/domains/maintenance/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function MaintenancePersonalDashboard() {
    const { user } = useAuthStore();
    const { incidents } = useIncidentStore();

    // Mock "My Assignments" - For demo, showing CRITICAL or explicitly assigned items
    const myTickets = incidents.filter(i =>
        (i.assignedTo === 'ME' || i.assignedTo === 'tech-1' || i.priority === 'CRITICAL') &&
        i.status !== 'RESOLVED'
    );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col gap-2 border-b pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-primary">My Active Workbench</h1>
                <p className="text-muted-foreground">Welcome back, {user?.fullName}. You have {myTickets.length} active tasks.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Priority Assignments
                    </h2>
                    {myTickets.length === 0 ? (
                        <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                            <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500" />
                            <span>Your queue is clear.</span>
                            <Link href="/maintenance">
                                <Button variant="link" className="text-gold">Go to Department Overview</Button>
                            </Link>
                        </div>
                    ) : (
                        myTickets.map(ticket => (
                            <Card key={ticket.id} className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant={ticket.priority === 'CRITICAL' ? 'destructive' : 'secondary'} className="text-[10px]">
                                            {ticket.priority}
                                        </Badge>
                                        <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                                    </div>
                                    <CardTitle className="text-base mt-1">{ticket.description}</CardTitle>
                                    <CardDescription>{ticket.assetName}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-muted-foreground">Reported by {ticket.reporterName}</span>
                                        <Link href="/maintenance">
                                            <Button size="sm" variant="ghost" className="h-8 gap-1">
                                                Process <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="font-semibold text-muted-foreground">Quick Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Tickets Closed (Today)</CardDescription>
                                <CardTitle className="text-4xl">2</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Avg Response Time</CardDescription>
                                <CardTitle className="text-4xl text-emerald-600">15m</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card className="bg-primary/5 border-none">
                        <CardContent className="pt-6">
                            <h3 className="font-bold mb-2">Need Spare Parts?</h3>
                            <p className="text-sm text-muted-foreground mb-4">Check the department inventory for screens, cables, and tools.</p>
                            <Link href="/maintenance">
                                <Button variant="outline" className="w-full bg-background">View Inventory</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
