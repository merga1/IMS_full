import { useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/ui/toaster";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { AppLayout } from "@/shared/layout/AppLayout";
import { useAuthStore } from "@/state/auth.store";
import "./i18n";

// Domain Pages
import LoginPage from "@/domains/auth/pages/LoginPage";
import DashboardPage from "@/domains/dashboard/pages/DashboardPage";
import StorekeeperDashboardPage from "@/domains/dashboard/pages/StorekeeperDashboardPage";
import InventoryPage from "@/domains/inventory/pages/InventoryPage";
import StockInPage from "@/domains/inventory/pages/StockInPage";
import HQInventoryPage from "@/domains/inventory/pages/HQInventoryPage";

import InterBranchDispatchPage from "@/domains/inventory/pages/InterBranchDispatchPage";
import StationaryAssignmentPage from "@/domains/inventory/pages/StationaryAssignmentPage";
import FloorRoomMapPage from "@/domains/inventory/pages/FloorRoomMapPage";
import LocalTransferPage from "@/domains/inventory/pages/LocalTransferPage";
import RequestsPage from "@/domains/requisitions/pages/RequestsPage";
import ApprovalsPage from "@/domains/approvals/pages/ApprovalsPage";
import DispatchPage from "@/domains/dispatch/pages/DispatchPage";
import IncidentsPage from "@/domains/maintenance/pages/IncidentsPage";
import GDDashboardPage from "@/domains/dashboard/pages/GDDashboardPage";
import DGDServiceDashboard from "@/domains/dashboard/pages/DGDServiceDashboard";
import DigitalDashboardPage from "@/domains/digital/pages/DigitalDashboardPage";
import DirectorDashboardPage from "@/domains/dashboard/pages/DirectorDashboardPage";
import TeamLeaderDashboardPage from "@/domains/dashboard/pages/TeamLeaderDashboardPage";
import TeamLeaderPersonalDashboard from "@/domains/dashboard/pages/TeamLeaderPersonalDashboard";
import EmployeeDashboardPage from "@/domains/dashboard/pages/EmployeeDashboardPage";
import MaintenanceDashboardPage from "@/domains/dashboard/pages/MaintenanceDashboardPage";
import MaintenancePersonalDashboard from "@/domains/dashboard/pages/MaintenancePersonalDashboard";
import GDProcurementPage from "@/domains/procurement/pages/GDProcurementPage";
import GDThresholdAlertsPage from "@/domains/alerts/pages/GDThresholdAlertsPage";
import GDTransfersPage from "@/domains/transfers/pages/GDTransfersPage";
import GDAuditPage from "@/domains/audit/pages/GDAuditPage";
import AdminDashboardPage from "@/domains/admin/pages/AdminDashboardPage";
import UserOnboardingWizard from "@/domains/admin/pages/UserOnboardingWizard";
import BranchCreationPage from "@/domains/admin/pages/BranchCreationPage";
import SystemHierarchyPage from "@/domains/admin/pages/SystemHierarchyPage";
import NotFound from "@/shared/ui/not-found"; // Assumed location or create it in shared/ui if I moved it there.

function ProtectedRoute({ component: Component, roles }: { component: React.ComponentType<any>, roles?: string[] }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  if (roles && user && !roles.includes(user.role)) return <Redirect to="/" />;

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <Switch>
      <Route path="/auth/login">
        {isAuthenticated ? <Redirect to="/" /> : <LoginPage />}
      </Route>

      <Route path="/">
        <ProtectedRoute component={() => {
          if (user?.role === 'STOREKEEPER') return <StorekeeperDashboardPage />;
          if (user?.role === 'EMPLOYEE' || user?.role === 'THIRD_PARTY') return <EmployeeDashboardPage />;
          if (user?.role === 'MAINTENANCE') return <MaintenancePersonalDashboard />;
          if (user?.role === 'TEAM_LEADER') return <TeamLeaderPersonalDashboard />;
          return <DashboardPage />;
        }} />
      </Route>

      <Route path="/inventory">
        <ProtectedRoute component={InventoryPage} roles={['STOREKEEPER', 'GD']} />
      </Route>

      <Route path="/inventory/stock-in">
        <ProtectedRoute component={StockInPage} roles={['STOREKEEPER']} />
      </Route>

      <Route path="/hq-inventory">
        <ProtectedRoute
          component={HQInventoryPage}
          roles={['STOREKEEPER']}
        />
      </Route>




      <Route path="/inventory/branch-dispatch">
        <ProtectedRoute component={InterBranchDispatchPage} roles={['STOREKEEPER']} />
      </Route>

      <Route path="/inventory/placement">
        <ProtectedRoute component={StationaryAssignmentPage} roles={['STOREKEEPER']} />
      </Route>

      <Route path="/inventory/map">
        <ProtectedRoute component={FloorRoomMapPage} roles={['STOREKEEPER']} />
      </Route>

      <Route path="/inventory/transfer">
        <ProtectedRoute component={LocalTransferPage} roles={['STOREKEEPER']} />
      </Route>

      <Route path="/requests">
        <ProtectedRoute component={RequestsPage} roles={['GD', 'DGD_SERVICE', 'DGD_DIGITALIZATION', 'DIRECTOR', 'TEAM_LEADER', 'MAINTENANCE', 'EMPLOYEE', 'THIRD_PARTY']} />
      </Route>

      <Route path="/approvals">
        <ProtectedRoute component={ApprovalsPage} roles={['DGD_SERVICE', 'DGD_DIGITALIZATION', 'DIRECTOR', 'TEAM_LEADER']} />
      </Route>

      <Route path="/dispatch">
        <ProtectedRoute component={DispatchPage} roles={['STOREKEEPER', 'GD']} />
      </Route>

      <Route path="/incidents">
        <ProtectedRoute component={IncidentsPage} />
      </Route>

      <Route path="/maintenance">
        <ProtectedRoute component={MaintenanceDashboardPage} roles={['MAINTENANCE', 'GD', 'DIRECTOR']} />
      </Route>

      <Route path="/admin">
        <ProtectedRoute component={AdminDashboardPage} roles={['SYSTEM_ADMIN']} />
      </Route>

      <Route path="/admin/onboarding">
        <ProtectedRoute component={UserOnboardingWizard} roles={['SYSTEM_ADMIN']} />
      </Route>

      <Route path="/admin/branch-new">
        <ProtectedRoute component={BranchCreationPage} roles={['SYSTEM_ADMIN']} />
      </Route>

      <Route path="/admin/hierarchy">
        <ProtectedRoute component={SystemHierarchyPage} roles={['SYSTEM_ADMIN']} />
      </Route>

      <Route path="/hq-dashboard">
        <ProtectedRoute component={GDDashboardPage} roles={['GD', 'DGD_SERVICE', 'DGD_DIGITALIZATION']} />
      </Route>

      <Route path="/dgd/service">
        <ProtectedRoute component={DGDServiceDashboard} roles={['DGD_SERVICE', 'GD']} />
      </Route>

      <Route path="/dgd/digital">
        <ProtectedRoute component={DigitalDashboardPage} roles={['DGD_DIGITALIZATION', 'GD']} />
      </Route>

      <Route path="/director">
        <ProtectedRoute component={DirectorDashboardPage} roles={['DIRECTOR', 'GD']} />
      </Route>

      <Route path="/team-lead">
        <ProtectedRoute component={TeamLeaderDashboardPage} roles={['TEAM_LEADER', 'GD']} />
      </Route>

      <Route path="/gd/procurement">
        <ProtectedRoute component={GDProcurementPage} roles={['GD']} />
      </Route>

      <Route path="/gd/alerts">
        <ProtectedRoute component={GDThresholdAlertsPage} roles={['GD']} />
      </Route>

      <Route path="/gd/transfers">
        <ProtectedRoute component={GDTransfersPage} roles={['GD']} />
      </Route>

      <Route path="/gd/audit">
        <ProtectedRoute component={GDAuditPage} roles={['GD']} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
