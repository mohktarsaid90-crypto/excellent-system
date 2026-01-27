import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface CompanySettings {
  id: string;
  company_name: string;
  tax_id: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCompanySettingsData {
  company_name?: string;
  tax_id?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
}

export const useCompanySettings = () => {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as CompanySettings | null;
    },
  });
};

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (data: UpdateCompanySettingsData) => {
      // Get existing settings or create new
      const { data: existing } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { data: updated, error } = await supabase
          .from('company_settings')
          .update(data)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        const { data: created, error } = await supabase
          .from('company_settings')
          .insert({
            company_name: data.company_name || 'Mano Sales',
            tax_id: data.tax_id || null,
            phone: data.phone || null,
            address: data.address || null,
            logo_url: data.logo_url || null,
          })
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Company settings updated' 
          : 'تم تحديث إعدادات الشركة',
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
