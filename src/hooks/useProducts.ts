import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Product {
  id: string;
  sku: string;
  name_en: string;
  name_ar: string;
  category: string | null;
  unit_price: number;
  cost_price: number | null;
  carton_price: number | null;
  pieces_per_carton: number | null;
  stock_quantity: number;
  min_stock_level: number;
  vat_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateProductData {
  sku: string;
  name_en: string;
  name_ar: string;
  category?: string;
  unit_price: number;
  cost_price?: number;
  carton_price?: number;
  pieces_per_carton?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  vat_rate?: number;
}

export interface UpdateProductData {
  sku?: string;
  name_en?: string;
  name_ar?: string;
  category?: string;
  unit_price?: number;
  cost_price?: number;
  carton_price?: number;
  pieces_per_carton?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  vat_rate?: number;
  is_active?: boolean;
}

export const useProducts = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  const createProduct = useMutation({
    mutationFn: async (productData: CreateProductData) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          sku: productData.sku,
          name_en: productData.name_en,
          name_ar: productData.name_ar,
          category: productData.category || null,
          unit_price: productData.unit_price,
          cost_price: productData.cost_price || null,
          carton_price: productData.carton_price || null,
          pieces_per_carton: productData.pieces_per_carton || 1,
          stock_quantity: productData.stock_quantity || 0,
          min_stock_level: productData.min_stock_level || 10,
          vat_rate: productData.vat_rate || 15,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Product created successfully' 
          : 'تم إنشاء المنتج بنجاح',
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

  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductData }) => {
      const { data: updated, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Product updated successfully' 
          : 'تم تحديث المنتج بنجاح',
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

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: language === 'en' ? 'Success' : 'تم بنجاح',
        description: language === 'en' 
          ? 'Product deleted successfully' 
          : 'تم حذف المنتج بنجاح',
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
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
