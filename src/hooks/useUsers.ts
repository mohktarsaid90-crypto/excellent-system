import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export type AdminRole = 'company_owner' | 'it_admin' | 'sales_manager' | 'accountant';

export interface UserWithRole {
  id: string;
  user_id: string;
  role: AdminRole;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Combine the data
      const users: UserWithRole[] = userRoles.map((role) => {
        const profile = profiles.find((p) => p.user_id === role.user_id);
        return {
          id: role.id,
          user_id: role.user_id,
          role: role.role as AdminRole,
          email: profile?.email || '',
          full_name: profile?.full_name || '',
          avatar_url: profile?.avatar_url || null,
          created_at: role.created_at,
        };
      });

      return users;
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AdminRole }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' ? 'User role updated' : 'تم تحديث دور المستخدم',
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (user_id: string) => {
      // Delete the role first (profile will be deleted by cascade or separately)
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' ? 'User removed' : 'تم حذف المستخدم',
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
