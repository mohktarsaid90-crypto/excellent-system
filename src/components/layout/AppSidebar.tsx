import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Shield,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Truck,
  ClipboardCheck,
  FileText,
  Map,
  Route,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const AppSidebar = () => {
  const { t, isRTL } = useLanguage();
  const { hasPermission, signOut } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Main navigation items - accessible to all authenticated users
  const mainItems = [
    { key: 'dashboard', icon: LayoutDashboard, href: '/' },
    { key: 'inventory', icon: Warehouse, href: '/inventory' },
    { key: 'products', icon: Package, href: '/products' },
    { key: 'sales', icon: ShoppingCart, href: '/sales' },
    { key: 'customers', icon: Users, href: '/customers' },
    { key: 'representatives', icon: UserCheck, href: '/representatives' },
    { key: 'reports', icon: BarChart3, href: '/reports' },
  ];

  // Operations items - IT Admin & Sales Manager
  const operationsItems = [
    { key: 'agents', icon: UserCheck, href: '/agents', roles: ['it_admin', 'sales_manager'] },
    { key: 'loadManagement', icon: Truck, href: '/load-management', roles: ['it_admin', 'sales_manager'] },
  ];

  // Field Operations - IT Admin & Sales Manager
  const fieldOpsItems = [
    { key: 'liveMap', icon: Map, href: '/live-map', roles: ['it_admin', 'sales_manager'] },
  ];

  // Finance items - IT Admin & Accountant
  const financeItems = [
    { key: 'reconciliation', icon: ClipboardCheck, href: '/reconciliation', roles: ['it_admin', 'accountant'] },
    { key: 'invoices', icon: FileText, href: '/invoices', roles: ['it_admin', 'accountant'] },
  ];

  // Admin items - IT Admin only
  const adminItems = [
    { key: 'settings', icon: Settings, href: '/settings', roles: ['it_admin'] },
    { key: 'users', icon: Shield, href: '/users', roles: ['it_admin'] },
  ];

  const filterByRole = (items: typeof operationsItems) => {
    return items.filter(item => !item.roles || hasPermission(item.roles as any));
  };

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton asChild tooltip={t(item.key)}>
            <NavLink
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                "hover:bg-sidebar-accent"
              )}
              activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground shadow-md"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium truncate">{t(item.key)}</span>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  const filteredOperations = filterByRole(operationsItems);
  const filteredFieldOps = filterByRole(fieldOpsItems);
  const filteredFinance = filterByRole(financeItems);
  const filteredAdmin = filterByRole(adminItems);

  return (
    <Sidebar
      side={isRTL ? 'right' : 'left'}
      collapsible="icon"
      className="border-sidebar-border bg-sidebar transition-all duration-300 fixed"
    >
      {/* ============================================
          SIDEBAR HEADER - LOCKED FOR STABILITY
          Logo and branding always in English/LTR
          Last verified: 2026-01-27
          ============================================ */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3" dir="ltr">
          {/* Logo - Fixed English branding */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold text-lg shadow-md flex-shrink-0">
            M
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 text-left">
              {/* Mano ERP - Always English, Always LTR */}
              <span 
                className="font-bold text-lg text-sidebar-foreground truncate"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', direction: 'ltr' }}
              >
                Mano ERP
              </span>
              <span 
                className="text-xs text-sidebar-foreground/60 truncate"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {t('salesManagement')}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 overflow-y-auto">
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2",
            isRTL && "text-right"
          )}>
            {!isCollapsed && t('mainMenu')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations - IT Admin & Sales Manager */}
        {filteredOperations.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={cn(
              "text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2",
              isRTL && "text-right"
            )}>
              {!isCollapsed && t('operations')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(filteredOperations)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Field Operations - IT Admin & Sales Manager */}
        {filteredFieldOps.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={cn(
              "text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2",
              isRTL && "text-right"
            )}>
              {!isCollapsed && t('fieldOps')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(filteredFieldOps)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Finance - IT Admin & Accountant */}
        {filteredFinance.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={cn(
              "text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2",
              isRTL && "text-right"
            )}>
              {!isCollapsed && t('finance')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(filteredFinance)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administration - IT Admin */}
        {filteredAdmin.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={cn(
              "text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2",
              isRTL && "text-right"
            )}>
              {!isCollapsed && t('administration')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(filteredAdmin)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex flex-col gap-2">
          {!isCollapsed && <LanguageSwitcher />}
          
          {/* Logout Button */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className={cn(
                "w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
                isRTL && "flex-row-reverse"
              )}
            >
              <LogOut className="h-4 w-4" />
              <span>{t('logout')}</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? (
              isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
