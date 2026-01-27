import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Shield, User, Settings, Loader2, Pencil, Trash2, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUsers, useUpdateUserRole, useDeleteUser, AdminRole } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useUserPermissions, 
  useUpsertUserPermissions, 
  useAllUserPermissions,
  permissionCategories, 
  defaultPermissions,
  UserPermissions
} from '@/hooks/useUserPermissions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const roleConfig = {
  company_owner: { label: { en: 'Company Owner', ar: 'إدارة الشركة' }, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Crown },
  it_admin: { label: { en: 'IT Admin', ar: 'مدير النظام' }, className: 'bg-destructive/10 text-destructive border-destructive/20', icon: Shield },
  sales_manager: { label: { en: 'Sales Manager', ar: 'مدير المبيعات' }, className: 'bg-primary/10 text-primary border-primary/20', icon: Settings },
  accountant: { label: { en: 'Accountant', ar: 'محاسب' }, className: 'bg-success/10 text-success border-success/20', icon: User },
};

const Users = () => {
  const { t, language, isRTL } = useLanguage();
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsers();
  const { data: allPermissions } = useAllUserPermissions();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const upsertPermissions = useUpsertUserPermissions();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('accountant');
  const [isCreating, setIsCreating] = useState(false);
  const [editPermissions, setEditPermissions] = useState<Partial<UserPermissions>>({});
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'accountant' as AdminRole,
  });

  // Load user permissions when editing
  useEffect(() => {
    if (selectedUser && allPermissions) {
      const userPerms = allPermissions.find(p => p.user_id === selectedUser.user_id);
      if (userPerms) {
        setEditPermissions(userPerms);
      } else {
        // Default permissions based on role
        setEditPermissions({
          ...defaultPermissions,
          user_id: selectedUser.user_id,
        });
      }
    }
  }, [selectedUser, allPermissions]);

  // System admin email to hide from the list
  const SYSTEM_ADMIN_EMAIL = 'admin@mano.com';
  
  const filteredUsers = users?.filter(user =>
    // Hide system admin from all users
    user.email.toLowerCase() !== SYSTEM_ADMIN_EMAIL.toLowerCase() &&
    (user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handlePermissionChange = (key: string, checked: boolean) => {
    setEditPermissions(prev => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleUpdateRoleAndPermissions = async () => {
    if (!selectedUser) return;
    
    try {
      // Update role
      await updateRole.mutateAsync({ user_id: selectedUser.user_id, role: selectedRole });
      
      // Update permissions
      await upsertPermissions.mutateAsync({
        ...defaultPermissions,
        ...editPermissions,
        user_id: selectedUser.user_id,
      } as UserPermissions);
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    await deleteUser.mutateAsync(selectedUser.user_id);
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleCreateUser = async () => {
    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.full_name.trim()) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        description: language === 'en' ? 'Full name is required' : 'الاسم الكامل مطلوب',
        variant: 'destructive',
      });
      return;
    }
    if (!emailRegex.test(newUser.email.trim())) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        description: language === 'en' ? 'Please enter a valid email address' : 'يرجى إدخال بريد إلكتروني صحيح',
        variant: 'destructive',
      });
      return;
    }
    if (newUser.password.length < 8) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        description: language === 'en' ? 'Password must be at least 8 characters' : 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: newUser.email.trim(),
          password: newUser.password,
          full_name: newUser.full_name.trim(),
          role: newUser.role,
        },
      });

      if (response.error) throw response.error;
      
      // Check for error in response data
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' ? 'User created successfully' : 'تم إنشاء المستخدم بنجاح',
      });

      setIsCreateDialogOpen(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'accountant' });
      
      // Refresh the users list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

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
                ? 'Manage admin user accounts, roles, and permissions'
                : 'إدارة حسابات المستخدمين والأدوار والصلاحيات'
            }
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'Add Admin User' : 'إضافة مستخدم'}
          </Button>
        </div>

        {/* Role Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(roleConfig).map(([key, config]) => (
            <Badge key={key} variant="outline" className={cn("gap-1", config.className)}>
              <config.icon className="h-3 w-3" />
              {config.label[language as 'en' | 'ar']}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Users Table */}
        {!isLoading && filteredUsers && (
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
                      {language === 'en' ? 'Created' : 'تاريخ الإنشاء'}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const role = roleConfig[user.role as keyof typeof roleConfig];
                    const RoleIcon = role?.icon || User;
                    const isSelf = user.user_id === currentUser?.id;
                    
                    return (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                              {user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={cn("gap-1", role?.className)}>
                            <RoleIcon className="h-3 w-3" />
                            {role?.label[language as 'en' | 'ar'] || user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openEditDialog(user)}
                              disabled={isSelf}
                            >
                              <Pencil className="h-4 w-4 me-1" />
                              {t('edit')}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openDeleteDialog(user)}
                              disabled={isSelf}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 me-1" />
                              {t('delete')}
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
        )}
      </div>

      {/* Edit Role & Permissions Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'} className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Edit User Role & Permissions' : 'تعديل دور وصلاحيات المستخدم'}</DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? `Modify role and permissions for ${selectedUser?.full_name}`
                : `تعديل دور وصلاحيات ${selectedUser?.full_name}`}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Role' : 'الدور'}</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AdminRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="company_owner">{language === 'en' ? 'Company Owner' : 'إدارة الشركة'}</SelectItem>
                    <SelectItem value="it_admin">{language === 'en' ? 'IT Admin' : 'مدير النظام'}</SelectItem>
                    <SelectItem value="sales_manager">{language === 'en' ? 'Sales Manager' : 'مدير المبيعات'}</SelectItem>
                    <SelectItem value="accountant">{language === 'en' ? 'Accountant' : 'محاسب'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Permissions Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">
                  {language === 'en' ? 'Custom Permissions' : 'الصلاحيات المخصصة'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Override default role permissions by checking/unchecking specific features'
                    : 'تجاوز صلاحيات الدور الافتراضية عن طريق تحديد/إلغاء تحديد ميزات معينة'}
                </p>

                {/* Page Access Permissions */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-muted-foreground">
                    {permissionCategories.access.label[language as 'en' | 'ar']}
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {permissionCategories.access.permissions.map((perm) => (
                      <div key={perm.key} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                          id={perm.key}
                          checked={editPermissions[perm.key as keyof UserPermissions] as boolean || false}
                          onCheckedChange={(checked) => handlePermissionChange(perm.key, checked as boolean)}
                        />
                        <label
                          htmlFor={perm.key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {perm.label[language as 'en' | 'ar']}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Action Permissions */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-muted-foreground">
                    {permissionCategories.actions.label[language as 'en' | 'ar']}
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {permissionCategories.actions.permissions.map((perm) => (
                      <div key={perm.key} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                          id={perm.key}
                          checked={editPermissions[perm.key as keyof UserPermissions] as boolean || false}
                          onCheckedChange={(checked) => handlePermissionChange(perm.key, checked as boolean)}
                        />
                        <label
                          htmlFor={perm.key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {perm.label[language as 'en' | 'ar']}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleUpdateRoleAndPermissions} disabled={updateRole.isPending || upsertPermissions.isPending}>
              {(updateRole.isPending || upsertPermissions.isPending) && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Create Admin User' : 'إنشاء مستخدم مسؤول'}</DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Add a new admin user to the system'
                : 'إضافة مستخدم مسؤول جديد للنظام'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{language === 'en' ? 'Full Name' : 'الاسم الكامل'}</Label>
              <Input 
                value={newUser.full_name} 
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('email')}</Label>
              <Input 
                type="email"
                value={newUser.email} 
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{language === 'en' ? 'Password' : 'كلمة المرور'}</Label>
              <Input 
                type="password"
                value={newUser.password} 
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{language === 'en' ? 'Role' : 'الدور'}</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as AdminRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="company_owner">{language === 'en' ? 'Company Owner' : 'إدارة الشركة'}</SelectItem>
                  <SelectItem value="it_admin">{language === 'en' ? 'IT Admin' : 'مدير النظام'}</SelectItem>
                  <SelectItem value="sales_manager">{language === 'en' ? 'Sales Manager' : 'مدير المبيعات'}</SelectItem>
                  <SelectItem value="accountant">{language === 'en' ? 'Accountant' : 'محاسب'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleCreateUser} disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'en' ? 'Are you sure?' : 'هل أنت متأكد؟'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? `This will remove admin access for ${selectedUser?.full_name}. This action cannot be undone.`
                : `سيؤدي هذا إلى إزالة صلاحيات المسؤول لـ ${selectedUser?.full_name}. لا يمكن التراجع عن هذا الإجراء.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Users;
