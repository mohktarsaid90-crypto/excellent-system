import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

interface TopProduct {
  product_id: string;
  name: string;
  total_quantity: number;
  total_revenue: number;
}

export const TopProducts = () => {
  const { t, language, isRTL } = useLanguage();

  const { data: topProducts, isLoading } = useQuery({
    queryKey: ['top-products'],
    queryFn: async () => {
      // Fetch invoice items with product details
      const { data: invoiceItems, error } = await supabase
        .from('invoice_items')
        .select(`
          product_id,
          quantity,
          line_total,
          products (name_en, name_ar)
        `);

      if (error) throw error;

      // Aggregate by product
      const productMap = new Map<string, TopProduct>();

      invoiceItems?.forEach((item) => {
        const productId = item.product_id;
        const existing = productMap.get(productId);
        const productName = language === 'ar' && item.products?.name_ar 
          ? item.products.name_ar 
          : item.products?.name_en || 'Unknown';

        if (existing) {
          existing.total_quantity += item.quantity;
          existing.total_revenue += item.line_total || 0;
        } else {
          productMap.set(productId, {
            product_id: productId,
            name: productName,
            total_quantity: item.quantity,
            total_revenue: item.line_total || 0,
          });
        }
      });

      // Sort by revenue and take top 5
      return Array.from(productMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const hasNoData = !topProducts || topProducts.length === 0;

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('topProducts')}</h3>
        {!hasNoData && (
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            {t('viewAll')}
          </button>
        )}
      </div>

      {hasNoData ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={product.product_id} className="flex items-center gap-4 group hover:bg-muted/30 rounded-lg p-2 -mx-2 transition-colors">
              {/* Rank Badge */}
              <div className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                index === 0 && "bg-warning/20 text-warning",
                index === 1 && "bg-muted text-muted-foreground",
                index === 2 && "bg-accent/20 text-accent",
                index > 2 && "bg-muted/50 text-muted-foreground"
              )}>
                #{index + 1}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.total_quantity.toLocaleString()} {t('units')}
                </p>
              </div>

              {/* Revenue */}
              <div className={cn("text-right", isRTL && "text-left")}>
                <p className="font-semibold text-foreground">
                  {product.total_revenue.toLocaleString()} {t('sar')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
