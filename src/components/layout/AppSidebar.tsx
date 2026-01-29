import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Package, ShoppingCart, Users, UserCheck, BarChart3, Settings, Shield, Warehouse, ChevronLeft, ChevronRight, LogOut, Truck, ClipboardCheck, FileText, Map, Route } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const AppSidebar = () => {
  const { t, isRTL } = useLanguage();
  const { hasPermission, signOut } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Main navigation items
  const mainItems = [
    { key: 'dashboard', icon: LayoutDashboard, href: '/' },
    { key: 'inventory', icon: Warehouse, href: '/inventory' },
    { key: 'products', icon: Package, href: '/products' },
    { key: 'sales', icon: ShoppingCart, href: '/sales' },
    { key: 'customers', icon: Users, href: '/customers' },
    { key: 'representatives', icon: UserCheck, href: '/representatives' },
    // Keep Agents in main menu only (not duplicated under Operations)
    { key: 'agents', icon: UserCheck, href: '/agents', roles: ['it_admin', 'sales_manager'] },
    { key: 'reports', icon: BarChart3, href: '/reports' },
  ];

  // Operations items
  const operationsItems = [
    { key: 'loadManagement', icon: Truck, href: '/load-management', roles: ['it_admin', 'sales_manager'] },
  ];

  // Field Operations
  const fieldOpsItems = [
    { key: 'liveMap', icon: Map, href: '/live-map', roles: ['it_admin', 'sales_manager'] },
  ];

  // Finance items
  const financeItems = [
    { key: 'reconciliation', icon: ClipboardCheck, href: '/reconciliation', roles: ['it_admin', 'accountant'] },
    { key: 'invoices', icon: FileText, href: '/invoices', roles: ['it_admin', 'accountant'] },
  ];

  // Admin items
  const adminItems = [
    { key: 'settings', icon: Settings, href: '/settings', roles: ['it_admin'] },
    { key: 'users', icon: Shield, href: '/users', roles: ['it_admin'] },
  ];

  const filterByRole = (items: typeof operationsItems) => {
    return items.filter(item => !item.roles || hasPermission(item.roles as any));
  };

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map(item => (
        (!item.roles || hasPermission(item.roles as any)) ? (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton asChild tooltip={t(item.key)}>
            <NavLink 
              to={item.href} 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-secondary"
              )} 
              activeClassName="sidebar-active-indicator bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium truncate">{t(item.key)}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
        ) : null
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
      className="border-sidebar-border bg-sidebar-background transition-all duration-300 fixed"
    >
      {/* Header - Logo */}
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar-background">
        <div className="flex items-center gap-3" dir="ltr">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg btn-glow flex-shrink-0">
            M
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 text-left">
              <span 
                className="font-bold text-lg text-foreground truncate" 
                style={{ fontFamily: 'Inter, system-ui, sans-serif', direction: 'ltr' }}
              >
                Mano ERP
              </span>
              <span className="text-xs text-muted-foreground truncate" dir={isRTL ? 'rtl' : 'ltr'}>
                {t('salesManagement')}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 overflow-y-auto bg-sidebar-background">
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-muted-foreground text-xs uppercase tracking-wider mb-2",
            isRTL && "text-right"
          )}>
            {!isCollapsed && t('mainMenu')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations */}
        {filteredOperations.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={cn(
              "text-muted-foreground text-xs uppercase tracking-wider mb-2",
              isRTL && "text-right"
            )}>
              {!isCollapsed && t('operations')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(filteredOperations)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Field Operations */}
        {filteredFieldOps.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={cn(
              "text-muted-foreground text-xs uppercase tracking-wider mb-2",
              isRTL && "text-right"
            )}>
              {!isCollapsed && t('fieldOps')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(filteredFieldOps)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Finance */}
        {filteredFinance.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={cn(
              "text-muted-foreground text-xs uppercase tracking-wider mb-2",
              isRTL && "text-right"
            )}>
              {!isCollapsed && t('finance')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(filteredFinance)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administration */}
        {filteredAdmin.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className={cn(
              "text-muted-foreground text-xs uppercase tracking-wider mb-2",
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

      <SidebarFooter className="border-t border-sidebar-border p-3 bg-sidebar-background">
        <div className="flex flex-col gap-2">
          {!isCollapsed && <LanguageSwitcher />}
          
          {/* Logout Button */}
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut} 
              className={cn(
                "w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
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
            className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            {isCollapsed 
              ? (isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) 
              : (isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)
            }
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
