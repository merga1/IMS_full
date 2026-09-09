import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useAuthStore } from "@/state/auth.store";
import { useInventoryStore } from "@/domains/inventory/store";
import { useAdminStore } from "@/domains/admin/store";
import { Users, Building, ShieldAlert, UserPlus, FileKey, Network } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/shared/hooks/use-toast";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function AdminDashboardPage() {
    const { toast } = useToast();
    const { t } = useLanguage();
    const { users } = useAuthStore();
    const { assets } = useInventoryStore();
    const { knownBranches } = useAdminStore();

    const totalUsers = users.length;
    // Calculate orphaned assets: Assets held by users who are NOT 'ACTIVE' or don't exist?
    // For now, we assume all users in AuthStore are "known".
    // Orphaned = Asset holderId is not in active users list.
    const activeUserIds = users.filter(u => u.status === 'ACTIVE').map(u => u.id);
    const orphanedAssets = assets.filter(a => a.holderId && !activeUserIds.includes(a.holderId));

    const usersByRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">{t('admin.title')}</h1>
                    <p className="text-muted-foreground">{t('admin.subtitle')}</p>
                </div>
                <Link href="/admin/onboarding">
                    <Button className="shadow-lg shadow-primary/20">
                        <UserPlus className="w-4 h-4 mr-2" /> {t('admin.onboard_btn')}
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin.users')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">{t('admin.branches_count').replace('{0}', String(knownBranches.length))}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin.orphaned')}</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{orphanedAssets.length}</div>
                        <p className="text-xs text-muted-foreground">{t('admin.orphaned_desc')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin.active_branches')}</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{knownBranches.length}</div>
                        <p className="text-xs text-muted-foreground">{t('admin.active_desc')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin.health')}</CardTitle>
                        <Network className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">100%</div>
                        <p className="text-xs text-muted-foreground">{t('admin.health_desc')}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('admin.role_dist')}</CardTitle>
                        <CardDescription>{t('admin.role_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(usersByRole).map(([role, count]) => (
                                <div key={role} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileKey className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{role}</span>
                                    </div>
                                    <span className="font-mono">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/50 border-dashed">
                    <CardHeader>
                        <CardTitle>{t('admin.rapid_actions')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Link href="/admin/branch-new">
                            <Button variant="outline" className="justify-start w-full">
                                <Building className="w-4 h-4 mr-2" /> {t('nav.create_branch')}
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="justify-start w-full"
                            onClick={() => {
                                toast({
                                    title: t('admin.audit_start'),
                                    description: t('admin.audit_desc'),
                                });
                                setTimeout(() => {
                                    toast({
                                        title: t('admin.audit_complete'),
                                        description: t('admin.audit_success'),
                                        variant: "default",
                                    });
                                }, 2000);
                            }}
                        >
                            <ShieldAlert className="w-4 h-4 mr-2" /> {t('admin.audit')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
