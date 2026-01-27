import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface UserPermissions {
  id?: string;
  user_id: string;
  can_access_dashboard: boolean;
  can_access_inventory: boolean;
  can_access_products: boolean;
  can_access_sales: boolean;
  can_access_customers: boolean;
  can_access_representatives: boolean;
  can_access_reports: boolean;
  can_access_agents: boolean;
  can_access_load_management: boolean;
  can_access_live_map: boolean;
  can_access_reconciliation: boolean;
  can_access_invoices: boolean;
  can_access_settings: boolean;
  can_access_users: boolean;
  can_edit_products: boolean;
  can_edit_customers: boolean;
  can_edit_agents: boolean;
  can_delete_users: boolean;
}

export const defaultPermissions: Omit<UserPermissions, 'id' | 'user_id'> = {
  can_access_dashboard: true,
  can_access_inventory: true,
  can_access_products: true,
  can_access_sales: true,
  can_access_customers: true,
  can_access_representatives: true,
  can_access_reports: true,
  can_access_agents: false,
  can_access_load_management: false,
  can_access_live_map: false,
  can_access_reconciliation: false,
  can_access_invoices: false,
  can_access_settings: false,
  can_access_users: false,
  can_edit_products: false,
  can_edit_customers: false,
  can_edit_agents: false,
  can_delete_users: false,
};

// Permission categories for UI grouping
export const permissionCategories = {
  access: {
    label: { en: 'Page Access', ar: 'صلاحية الوصول' },
    permissions: [
      { key: 'can_access_dashboard', label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { key: 'can_access_inventory', label: { en: 'Inventory', ar: 'المخزون' } },
      { key: 'can_access_products', label: { en: 'Products', ar: 'المنتجات' } },
      { key: 'can_access_sales', label: { en: 'Sales', ar: 'المبيعات' } },
      { key: 'can_access_customers', label: { en: 'Customers', ar: 'العملاء' } },
      { key: 'can_access_representatives', label: { en: 'Representatives', ar: 'المندوبين' } },
      { key: 'can_access_reports', label: { en: 'Reports', ar: 'التقارير' } },
      { key: 'can_access_agents', label: { en: 'Agent Management', ar: 'إدارة الوكلاء' } },
      { key: 'can_access_load_management', label: { en: 'Load Management', ar: 'إدارة التحميل' } },
      { key: 'can_access_live_map', label: { en: 'Live Map', ar: 'الخريطة الحية' } },
      { key: 'can_access_reconciliation', label: { en: 'Reconciliation', ar: 'التسوية' } },
      { key: 'can_access_invoices', label: { en: 'Invoices', ar: 'الفواتير' } },
      { key: 'can_access_settings', label: { en: 'Settings', ar: 'الإعدادات' } },
      { key: 'can_access_users', label: { en: 'User Management', ar: 'إدارة المستخدمين' } },
    ],
  },
  actions: {
    label: { en: 'Actions', ar: 'الإجراءات' },
    permissions: [
      { key: 'can_edit_products', label: { en: 'Edit Products', ar: 'تعديل المنتجات' } },
      { key: 'can_edit_customers', label: { en: 'Edit Customers', ar: 'تعديل العملاء' } },
      { key: 'can_edit_agents', label: { en: 'Edit Agents', ar: 'تعديل الوكلاء' } },
      { key: 'can_delete_users', label: { en: 'Delete Users', ar: 'حذف المستخدمين' } },
    ],
  },
};

export const useUserPermissions = (userId?: string) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as UserPermissions | null;
    },
    enabled: !!userId,
  });
};

export const useAllUserPermissions = () => {
  return useQuery({
    queryKey: ['all-user-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*');

      if (error) throw error;
      return data as UserPermissions[];
    },
  });
};

export const useUpsertUserPermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (permissions: UserPermissions) => {
      // Check if permissions exist for this user
      const { data: existing } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('user_id', permissions.user_id)
        .maybeSingle();

      if (existing) {
        // Update existing permissions
        const { data, error } = await supabase
          .from('user_permissions')
          .update(permissions)
          .eq('user_id', permissions.user_id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new permissions
        const { data, error } = await supabase
          .from('user_permissions')
          .insert(permissions)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['all-user-permissions'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' ? 'Permissions updated' : 'تم تحديث الصلاحيات',
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
