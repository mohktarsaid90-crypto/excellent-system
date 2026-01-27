import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
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

// New ERP Pages
import AgentManagement from "./pages/AgentManagement";
import AgentDetail from "./pages/AgentDetail";
import LoadManagement from "./pages/LoadManagement";
import Reconciliation from "./pages/Reconciliation";
import InvoiceCenter from "./pages/InvoiceCenter";
import LiveMap from "./pages/LiveMap";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes - All Admins */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/representatives" element={<ProtectedRoute><Representatives /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

              {/* IT Admin & Sales Manager Routes */}
              <Route path="/agents" element={
                <ProtectedRoute allowedRoles={['it_admin', 'sales_manager']}>
                  <AgentManagement />
                </ProtectedRoute>
              } />
              <Route path="/agents/:id" element={
                <ProtectedRoute allowedRoles={['it_admin', 'sales_manager']}>
                  <AgentDetail />
                </ProtectedRoute>
              } />
              <Route path="/load-management" element={
                <ProtectedRoute allowedRoles={['it_admin', 'sales_manager']}>
                  <LoadManagement />
                </ProtectedRoute>
              } />
              <Route path="/live-map" element={
                <ProtectedRoute allowedRoles={['it_admin', 'sales_manager']}>
                  <LiveMap />
                </ProtectedRoute>
              } />

              {/* IT Admin & Accountant Routes */}
              <Route path="/reconciliation" element={
                <ProtectedRoute allowedRoles={['it_admin', 'accountant']}>
                  <Reconciliation />
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute allowedRoles={['it_admin', 'accountant']}>
                  <InvoiceCenter />
                </ProtectedRoute>
              } />

              {/* Company Owner & IT Admin Only Routes */}
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['company_owner', 'it_admin']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['company_owner', 'it_admin']}>
                  <Users />
                </ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
