import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  monthly_target: number;
  current_sales: number;
  is_active: boolean;
  is_online: boolean;
  can_give_discounts: boolean;
  can_add_clients: boolean;
  can_process_returns: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export interface CreateRepresentativeData {
  name: string;
  email: string;
  phone?: string;
  monthly_target: number;
}

export interface UpdateRepresentativeData {
  name?: string;
  email?: string;
  phone?: string;
  monthly_target?: number;
  is_active?: boolean;
  can_give_discounts?: boolean;
  can_add_clients?: boolean;
  can_process_returns?: boolean;
}

export const useRepresentatives = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const { data: representatives = [], isLoading, error } = useQuery({
    queryKey: ['representatives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Representative[];
    },
  });

  const createRepresentative = useMutation({
    mutationFn: async (repData: CreateRepresentativeData) => {
      // SECURITY: Do not store passwords in the agents table
      // Agent authentication should be handled via Supabase Auth if needed
      const { data, error } = await supabase
        .from('agents')
        .insert({
          name: repData.name,
          email: repData.email,
          phone: repData.phone || null,
          monthly_target: repData.monthly_target,
          // password_hash is intentionally NOT set - passwords should never be stored in plaintext
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Representative created successfully' 
          : 'تم إنشاء المندوب بنجاح',
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

  const updateRepresentative = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRepresentativeData }) => {
      const { data: updated, error } = await supabase
        .from('agents')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Representative updated successfully' 
          : 'تم تحديث المندوب بنجاح',
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

  const deleteRepresentative = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Representative deleted successfully' 
          : 'تم حذف المندوب بنجاح',
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

  const togglePermission = useMutation({
    mutationFn: async ({ id, permission, value }: { id: string; permission: string; value: boolean }) => {
      const { error } = await supabase
        .from('agents')
        .update({ [permission]: value })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    representatives,
    isLoading,
    error,
    createRepresentative,
    updateRepresentative,
    deleteRepresentative,
    togglePermission,
  };
};