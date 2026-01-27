import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AgentAuthProvider } from "@/contexts/AgentAuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AgentProtectedRoute } from "@/components/agent/AgentProtectedRoute";

// Admin Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Representatives from "./pages/Representatives";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

// ERP Pages
import AgentManagement from "./pages/AgentManagement";
import AgentDetail from "./pages/AgentDetail";
import LoadManagement from "./pages/LoadManagement";
import Reconciliation from "./pages/Reconciliation";
import InvoiceCenter from "./pages/InvoiceCenter";
import LiveMap from "./pages/LiveMap";

// Agent Mobile Pages
import AgentLogin from "./pages/agent/AgentLogin";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentVisit from "./pages/agent/AgentVisit";
import AgentSale from "./pages/agent/AgentSale";
import AgentTargets from "./pages/agent/AgentTargets";
import AgentInventory from "./pages/agent/AgentInventory";
import AgentSettlement from "./pages/agent/AgentSettlement";
import AgentTodayRoute from "./pages/agent/AgentTodayRoute";
import AgentAddCustomer from "./pages/agent/AgentAddCustomer";

// Journey Planning
import JourneyPlanning from "./pages/JourneyPlanning";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* ===== AGENT MOBILE ROUTES ===== */}
            <Route path="/agent-login" element={
              <AgentAuthProvider>
                <AgentLogin />
              </AgentAuthProvider>
            } />
            <Route path="/agent" element={
              <AgentAuthProvider>
                <AgentProtectedRoute>
                  <AgentDashboard />
                </AgentProtectedRoute>
              </AgentAuthProvider>
            } />
            <Route path="/agent/visit" element={
              <AgentAuthProvider>
                <AgentProtectedRoute>
                  <AgentVisit />
                </AgentProtectedRoute>
              </AgentAuthProvider>
            } />
            <Route path="/agent/sale" element={
              <AgentAuthProvider>
                <AgentProtectedRoute>
                  <AgentSale />
                </AgentProtectedRoute>
              </AgentAuthProvider>
            } />
            <Route path="/agent/targets" element={
              <AgentAuthProvider>
                <AgentProtectedRoute>
                  <AgentTargets />
                </AgentProtectedRoute>
              </AgentAuthProvider>
            } />
            <Route path="/agent/inventory" element={
              <AgentAuthProvider>
                <AgentProtectedRoute>
                  <AgentInventory />
                </AgentProtectedRoute>
              </AgentAuthProvider>
            } />
            <Route path="/agent/settlement" element={
              <AgentAuthProvider>
                <AgentProtectedRoute>
                  <AgentSettlement />
                </AgentProtectedRoute>
              </AgentAuthProvider>
            } />
            <Route path="/agent/today-route" element={
              <AgentAuthProvider>
                <AgentProtectedRoute>
                  <AgentTodayRoute />
                </AgentProtectedRoute>
              </AgentAuthProvider>
            } />
            <Route path="/agent/add-customer" element={
              <AgentAuthProvider>
                <AgentProtectedRoute>
                  <AgentAddCustomer />
                </AgentProtectedRoute>
              </AgentAuthProvider>
            } />

            {/* ===== ADMIN ROUTES ===== */}
            <Route path="/login" element={
              <AuthProvider>
                <Login />
              </AuthProvider>
            } />
            <Route path="/unauthorized" element={
              <AuthProvider>
                <Unauthorized />
              </AuthProvider>
            } />

            {/* Protected Admin Routes - All Admins */}
            <Route path="/" element={<AuthProvider><ProtectedRoute><Index /></ProtectedRoute></AuthProvider>} />
            <Route path="/inventory" element={<AuthProvider><ProtectedRoute><Inventory /></ProtectedRoute></AuthProvider>} />
            <Route path="/products" element={<AuthProvider><ProtectedRoute><Products /></ProtectedRoute></AuthProvider>} />
            <Route path="/sales" element={<AuthProvider><ProtectedRoute><Sales /></ProtectedRoute></AuthProvider>} />
            <Route path="/customers" element={<AuthProvider><ProtectedRoute><Customers /></ProtectedRoute></AuthProvider>} />
            <Route path="/representatives" element={<AuthProvider><ProtectedRoute><Representatives /></ProtectedRoute></AuthProvider>} />
            <Route path="/reports" element={<AuthProvider><ProtectedRoute><Reports /></ProtectedRoute></AuthProvider>} />

            {/* IT Admin & Sales Manager Routes */}
            <Route path="/agents" element={
              <AuthProvider>
                <ProtectedRoute allowedRoles={['it_admin', 'sales_manager']}>
                  <AgentManagement />
                </ProtectedRoute>
              </AuthProvider>
            } />
            <Route path="/agents/:id" element={
              <AuthProvider>
                <ProtectedRoute allowedRoles={['it_admin', 'sales_manager']}>
                  <AgentDetail />
                </ProtectedRoute>
              </AuthProvider>
            } />
            <Route path="/journey-planning" element={
              <AuthProvider>
                <ProtectedRoute allowedRoles={['it_admin', 'sales_manager']}>
                  <JourneyPlanning />
                </ProtectedRoute>
              </AuthProvider>
            } />
            <Route path="/load-management" element={
              <AuthProvider>
                <ProtectedRoute allowedRoles={['it_admin', 'sales_manager']}>
                  <LoadManagement />
                </ProtectedRoute>
              </AuthProvider>
            } />
            <Route path="/live-map" element={
              <AuthProvider>
                <ProtectedRoute allowedRoles={['it_admin', 'sales_manager']}>
                  <LiveMap />
                </ProtectedRoute>
              </AuthProvider>
            } />

            {/* IT Admin & Accountant Routes */}
            <Route path="/reconciliation" element={
              <AuthProvider>
                <ProtectedRoute allowedRoles={['it_admin', 'accountant']}>
                  <Reconciliation />
                </ProtectedRoute>
              </AuthProvider>
            } />
            <Route path="/invoices" element={
              <AuthProvider>
                <ProtectedRoute allowedRoles={['it_admin', 'accountant']}>
                  <InvoiceCenter />
                </ProtectedRoute>
              </AuthProvider>
            } />

            {/* Company Owner & IT Admin Only Routes */}
            <Route path="/settings" element={
              <AuthProvider>
                <ProtectedRoute allowedRoles={['company_owner', 'it_admin']}>
                  <Settings />
                </ProtectedRoute>
              </AuthProvider>
            } />
            <Route path="/users" element={
              <AuthProvider>
                <ProtectedRoute allowedRoles={['company_owner', 'it_admin']}>
                  <Users />
                </ProtectedRoute>
              </AuthProvider>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
