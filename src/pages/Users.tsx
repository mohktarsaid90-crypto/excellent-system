import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Shield, User, Settings, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'admin', status: 'active', lastLogin: '2024-01-25 10:30 AM' },
  { id: 2, name: 'Mohammed Salem', email: 'mohammed.s@company.com', role: 'representative', status: 'active', lastLogin: '2024-01-25 09:15 AM' },
  { id: 3, name: 'Sara Manager', email: 'sara.m@company.com', role: 'manager', status: 'active', lastLogin: '2024-01-24 04:45 PM' },
  { id: 4, name: 'Ali Khalid', email: 'ali.k@company.com', role: 'representative', status: 'active', lastLogin: '2024-01-25 08:00 AM' },
  { id: 5, name: 'Omar Hassan', email: 'omar.h@company.com', role: 'representative', status: 'inactive', lastLogin: '2024-01-20 02:30 PM' },
  { id: 6, name: 'Inventory Manager', email: 'inventory@company.com', role: 'inventory', status: 'active', lastLogin: '2024-01-25 11:00 AM' },
];

const roleConfig = {
  admin: { label: { en: 'Administrator', ar: 'مدير النظام' }, className: 'bg-destructive/10 text-destructive border-destructive/20', icon: Shield },
  manager: { label: { en: 'Manager', ar: 'مدير' }, className: 'bg-primary/10 text-primary border-primary/20', icon: Settings },
  representative: { label: { en: 'Representative', ar: 'مندوب' }, className: 'bg-success/10 text-success border-success/20', icon: User },
  inventory: { label: { en: 'Inventory', ar: 'مخزون' }, className: 'bg-warning/10 text-warning border-warning/20', icon: User },
};

const permissions = [
  { key: 'dashboard', en: 'Dashboard', ar: 'لوحة التحكم' },
  { key: 'inventory', en: 'Inventory', ar: 'المخزون' },
  { key: 'products', en: 'Products', ar: 'المنتجات' },
  { key: 'sales', en: 'Sales', ar: 'المبيعات' },
  { key: 'customers', en: 'Customers', ar: 'العملاء' },
  { key: 'representatives', en: 'Representatives', ar: 'المندوبين' },
  { key: 'reports', en: 'Reports', ar: 'التقارير' },
  { key: 'settings', en: 'Settings', ar: 'الإعدادات' },
  { key: 'users', en: 'User Management', ar: 'إدارة المستخدمين' },
];

const Users = () => {
  const { t, language, isRTL } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {language === 'en' ? 'User Management' : 'إدارة المستخدمين'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Manage user accounts and permissions'
                : 'إدارة حسابات المستخدمين والصلاحيات'
            }
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'Add User' : 'إضافة مستخدم'}
          </Button>
        </div>

        {/* Role Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(roleConfig).map(([key, config]) => (
            <Badge key={key} variant="outline" className={cn("gap-1", config.className)}>
              <config.icon className="h-3 w-3" />
              {config.label[language]}
            </Badge>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
            <Input
              placeholder={t('search')}
              className={cn("bg-card", isRTL ? 'pr-10' : 'pl-10')}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'User' : 'المستخدم'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Role' : 'الدور'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Status' : 'الحالة'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Last Login' : 'آخر تسجيل دخول'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockUsers.map((user) => {
                  const role = roleConfig[user.role as keyof typeof roleConfig];
                  const RoleIcon = role.icon;
                  
                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn("gap-1", role.className)}>
                          <RoleIcon className="h-3 w-3" />
                          {role.label[language]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          user.status === 'active' 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-muted text-muted-foreground border-muted'
                        )}>
                          {user.status === 'active' 
                            ? (language === 'en' ? 'Active' : 'نشط')
                            : (language === 'en' ? 'Inactive' : 'غير نشط')
                          }
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            {t('edit')}
                          </Button>
                          <Button variant="ghost" size="sm">
                            {t('permissions')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Overview */}
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {language === 'en' ? 'Permissions Overview' : 'نظرة عامة على الصلاحيات'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {language === 'en' 
              ? 'Configure what each role can access in the system'
              : 'تكوين ما يمكن لكل دور الوصول إليه في النظام'
            }
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className={cn("py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Permission' : 'الصلاحية'}
                  </th>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <th key={key} className="py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                      {config.label[language]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.key} className="border-b border-border/50">
                    <td className="py-3 text-sm font-medium text-foreground">
                      {perm[language]}
                    </td>
                    <td className="py-3 text-center"><Eye className="h-4 w-4 text-success mx-auto" /></td>
                    <td className="py-3 text-center">
                      {['dashboard', 'inventory', 'products', 'sales', 'customers', 'representatives', 'reports'].includes(perm.key) 
                        ? <Eye className="h-4 w-4 text-success mx-auto" />
                        : <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />
                      }
                    </td>
                    <td className="py-3 text-center">
                      {['dashboard', 'sales', 'customers'].includes(perm.key) 
                        ? <Eye className="h-4 w-4 text-success mx-auto" />
                        : <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />
                      }
                    </td>
                    <td className="py-3 text-center">
                      {['dashboard', 'inventory', 'products'].includes(perm.key) 
                        ? <Eye className="h-4 w-4 text-success mx-auto" />
                        : <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Users;
