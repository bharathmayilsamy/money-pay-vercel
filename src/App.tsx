import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { useSupabaseInit } from "@/hooks/useSupabaseInit";
import { isSupabaseEnabled } from "@/lib/supabase";
import LoginPage from "@/pages/LoginPage";
import AdminLayout from "@/components/admin/AdminLayout";
import DashboardPage from "@/pages/admin/DashboardPage";
import TenantDashboardPage from "@/pages/admin/TenantDashboardPage";
import PendingApprovalsPage from "@/pages/admin/PendingApprovalsPage";
import AllTenantsPage from "@/pages/admin/AllTenantsPage";
import MoneyPage from "@/pages/admin/MoneyPage";
import PropertiesPage from "@/pages/admin/PropertiesPage";
import MaintenancePage from "@/pages/admin/MaintenancePage";
import NoticesPage from "@/pages/admin/NoticesPage";
import AgreementsPage from "@/pages/admin/AgreementsPage";
import UtilityBillsPage from "@/pages/admin/UtilityBillsPage";
import VisitorLogPage from "@/pages/admin/VisitorLogPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import TenantPortalPage from "@/pages/tenant/TenantPortalPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AdminRouter() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin/dashboard" component={DashboardPage} />
        <Route path="/admin/tenants" component={TenantDashboardPage} />
        <Route path="/admin/pending" component={PendingApprovalsPage} />
        <Route path="/admin/all-tenants" component={AllTenantsPage} />
        <Route path="/admin/money" component={MoneyPage} />
        <Route path="/admin/properties" component={PropertiesPage} />
        <Route path="/admin/maintenance" component={MaintenancePage} />
        <Route path="/admin/notices" component={NoticesPage} />
        <Route path="/admin/agreements" component={AgreementsPage} />
        <Route path="/admin/utility-bills" component={UtilityBillsPage} />
        <Route path="/admin/visitors" component={VisitorLogPage} />
        <Route path="/admin/reports" component={ReportsPage} />
        <Route path="/admin">
          <Redirect to="/admin/dashboard" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function AppRouter() {
  const { userType } = useStore();
  useSupabaseInit();

  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/admin/:rest*">
        {userType === "Admin" ? <AdminRouter /> : <Redirect to="/" />}
      </Route>
      <Route path="/tenant">
        {userType === "Tenant" ? <TenantPortalPage /> : <Redirect to="/" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {isSupabaseEnabled && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white text-xs text-center py-0.5">
              Syncing with Supabase cloud database
            </div>
          )}
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
