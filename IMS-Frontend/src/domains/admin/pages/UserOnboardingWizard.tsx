import { useState } from "react";
import { useAuthStore } from "@/state/auth.store";
import { useAdminStore } from "@/domains/admin/store";
import { usersApi } from "@/shared/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Role, Branch } from "@/shared/types";
import { Loader2, UserPlus, Upload, FileUp } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Badge } from "@/shared/ui/badge";
import { useLocation } from "wouter";

export default function UserOnboardingWizard() {
    const { registerUser, users } = useAuthStore();
    const { knownBranches } = useAdminStore();
    const [, setLocation] = useLocation();
    const [previewUsers, setPreviewUsers] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [importStats, setImportStats] = useState({ total: 0, valid: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // Form Data for Manual Entry
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '' as Role,
        rank: 5,
        branch: '' as Branch,
        supervisorId: '',
        userType: 'EMPLOYEE' as const
    });

    const handleCreate = async () => {
        if (!formData.email || !formData.fullName || !formData.role) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsLoading(true);

        const pseudoFaydaId = `FIN-${Date.now().toString().slice(-4)}`;
        const pseudoAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random`;

        const roleMapping: Record<string, number> = {
            'SYSTEM_ADMIN': 1,
            'GD': 3,
            'DGD_SERVICE': 3,
            'DGD_DIGITALIZATION': 3,
            'DIRECTOR': 5,
            'TEAM_LEADER': 5,
            'STOREKEEPER': 7,
            'MAINTENANCE': 9,
            'EMPLOYEE': 9,
            'THIRD_PARTY': 9
        };
        const branchMapping: Record<string, number> = {
            'HQ': 1,
            'ARADA': 2,
        };

        try {
            await usersApi.create({
                fayda_id: pseudoFaydaId,
                full_name: formData.fullName,
                email: formData.email,
                password: 'Password@123',
                roleId: roleMapping[formData.role] || 9,
                branch_id: branchMapping[formData.branch] || 1,
                user_type: formData.userType || 'EMPLOYEE',
            });
        } catch (e) {
            console.warn('[UserOnboarding] Backend user creation fallback to local:', e);
        }

        registerUser({
            id: `u-${Date.now()}`,
            faydaId: pseudoFaydaId,
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role,
            rank: formData.rank,
            branch: formData.branch || 'HQ',
            userType: formData.userType,
            supervisorId: formData.supervisorId,
            status: 'ACTIVE',
            avatar: pseudoAvatar
        });

        toast.success("User Account Created Successfully", {
            description: `Assigned ID: ${pseudoFaydaId} | Default Password: Password@123`
        });

        setIsLoading(false);
        setLocation("/admin");
    };

    const parseCSV = (text: string) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const parsed: any[] = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',').map(v => v.trim());
            const userObj: any = {};

            headers.forEach((header, index) => {
                if (values[index]) {
                    // Map CSV headers to internal keys
                    if (header.includes('name')) userObj.fullName = values[index];
                    else if (header.includes('email') && !header.includes('supervisor')) userObj.email = values[index];
                    else if (header.includes('role')) userObj.role = values[index].toUpperCase(); // Basic normalization
                    else if (header.includes('branch')) userObj.branch = values[index].toUpperCase();
                    else if (header.includes('supervisor')) userObj.supervisorEmail = values[index];
                }
            });

            // Basic Validation
            if (userObj.fullName && userObj.email && userObj.role) {
                // Generate defaults
                userObj.rank = 5;
                userObj.userType = 'EMPLOYEE';
                userObj.status = 'ACTIVE';
                userObj.faydaId = `BULK-${Math.floor(Math.random() * 10000)}`;
                userObj.id = `u-bulk-${Date.now()}-${i}`;

                parsed.push(userObj);
            }
        }
        return parsed;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const parsed = parseCSV(text);
            setPreviewUsers(parsed);
            setImportStats({ total: parsed.length, valid: parsed.length }); // Assuming simple validation for now
            setShowPreview(true);
        };
        reader.readAsText(file);
    };

    const confirmImport = async () => {
        setIsLoading(true);

        // Register all valid users
        for (const user of previewUsers) {
            registerUser({
                ...user,
                // Ensure required fields if missing from basic CSV
                branch: user.branch || 'HQ',
                role: user.role || 'EMPLOYEE'
            });
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // UX delay

        setIsLoading(false);
        setShowPreview(false);
        toast.success("Bulk Import Processed", {
            description: `Successfully imported ${previewUsers.length} users.`
        });
        setLocation("/admin");
    };

    // Supervisors for the selected branch
    const potentialSupervisors = users.filter(u =>
        (u.branch === formData.branch || u.branch === 'HQ') &&
        u.status === 'ACTIVE'
    );

    return (
        <div className="max-w-3xl mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Add new users manually or import from CSV.</p>
            </div>

            <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Manual Registration
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Bulk Import
                    </TabsTrigger>
                </TabsList>

                {/* MANUAL ENTRY */}
                <TabsContent value="manual">
                    <Card>
                        <CardHeader>
                            <CardTitle>New User Details</CardTitle>
                            <CardDescription>
                                Enter the user's information directly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="e.g. Abebe Bikila"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="email"
                                        placeholder="e.g. abebe@mesob.gov.et"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Role <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(v: Role) => setFormData({ ...formData, role: v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GD">General Director</SelectItem>
                                            <SelectItem value="DGD_SERVICE">Deputy GD - Service Sector</SelectItem>
                                            <SelectItem value="DGD_DIGITALIZATION">Deputy GD - Digitalization</SelectItem>
                                            <SelectItem value="DIRECTOR">Director</SelectItem>
                                            <SelectItem value="TEAM_LEADER">Team Leader</SelectItem>
                                            <SelectItem value="STOREKEEPER">Storekeeper</SelectItem>
                                            <SelectItem value="MAINTENANCE">Maintenance Tech</SelectItem>
                                            <SelectItem value="EMPLOYEE">Staff Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Authority Rank (1-5)</Label>
                                    <Input
                                        type="number"
                                        value={formData.rank}
                                        onChange={e => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                                        min={1} max={5}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Branch</Label>
                                    <Select
                                        value={formData.branch}
                                        onValueChange={(v: Branch) => setFormData({ ...formData, branch: v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                        <SelectContent>
                                            {knownBranches.map(b => (
                                                <SelectItem key={b} value={b}>{b}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Supervisor</Label>
                                    <Select
                                        value={formData.supervisorId}
                                        onValueChange={(v) => setFormData({ ...formData, supervisorId: v })}
                                        disabled={!formData.branch}
                                    >
                                        <SelectTrigger><SelectValue placeholder={formData.branch ? "Select Supervisor" : "Select Branch First"} /></SelectTrigger>
                                        <SelectContent>
                                            {potentialSupervisors.map(u => (
                                                <SelectItem key={u.id} value={u.id}>
                                                    {u.fullName} ({u.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t pt-6 bg-muted/20">
                            <Button onClick={handleCreate} disabled={isLoading || !formData.fullName || !formData.role}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create User"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* BULK IMPORT */}
                <TabsContent value="bulk">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Import</CardTitle>
                            <CardDescription>
                                Upload a CSV file to import multiple users at once.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-10">
                            <div className="border-2 border-dashed border-input rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="p-4 bg-primary/10 rounded-full mb-4">
                                    <FileUp className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-1">Click to Upload CSV</h3>
                                <p className="text-sm text-muted-foreground mb-4">or drag and drop file here</p>
                                <Button variant="outline" size="sm" className="pointer-events-none">Select File</Button>
                                <p className="text-xs text-muted-foreground mt-4">Supported formats: .CSV</p>
                            </div>

                            <div className="mt-8 space-y-2">
                                <h4 className="text-sm font-semibold">CSV Template Format</h4>
                                <div className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto text-nowrap">
                                    Full Name, Email, Role, Branch, Supervisor Email (Optional)
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* PREVIEW DIALOG */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Import Preview</DialogTitle>
                        <DialogDescription>
                            Review the users to be imported. Found {importStats.total} valid entries.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 border rounded-md p-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewUsers.map((user, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{user.fullName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>{user.branch}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-500/15 text-green-600 border-green-200">Ready</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setShowPreview(false)}>Cancel</Button>
                        <Button onClick={confirmImport} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Import ${previewUsers.length} Users`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
