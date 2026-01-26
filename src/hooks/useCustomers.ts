import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  credit_limit: number;
  current_balance: number;
  assigned_agent_id: string | null;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  credit_limit?: number;
  assigned_agent_id?: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  credit_limit?: number;
  assigned_agent_id?: string;
}

export const useCustomers = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Customer[];
    },
  });

  const createCustomer = useMutation({
    mutationFn: async (customerData: CreateCustomerData) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          email: customerData.email || null,
          phone: customerData.phone || null,
          address: customerData.address || null,
          city: customerData.city || null,
          credit_limit: customerData.credit_limit || 0,
          assigned_agent_id: customerData.assigned_agent_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Customer created successfully' 
          : 'تم إنشاء العميل بنجاح',
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

  const updateCustomer = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerData }) => {
      const { data: updated, error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Customer updated successfully' 
          : 'تم تحديث العميل بنجاح',
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

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Customer deleted successfully' 
          : 'تم حذف العميل بنجاح',
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

  return {
    customers,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
