import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  trend: number;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Premium Coffee Beans', category: 'Beverages', sales: 1245, revenue: 24900, trend: 12 },
  { id: '2', name: 'Organic Olive Oil', category: 'Groceries', sales: 892, revenue: 22300, trend: 8 },
  { id: '3', name: 'Fresh Milk 1L', category: 'Dairy', sales: 2156, revenue: 17248, trend: 5 },
  { id: '4', name: 'Whole Wheat Bread', category: 'Bakery', sales: 1876, revenue: 15008, trend: -2 },
  { id: '5', name: 'Natural Honey 500g', category: 'Groceries', sales: 543, revenue: 13575, trend: 15 },
];

export const TopProducts = () => {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('topProducts')}</h3>
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          {t('viewAll')}
        </button>
      </div>

      <div className="space-y-4">
        {mockProducts.map((product, index) => (
          <div key={product.id} className="flex items-center gap-4 group hover:bg-muted/30 rounded-lg p-2 -mx-2 transition-colors">
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
              <p className="text-sm text-muted-foreground">{product.category}</p>
            </div>

            {/* Stats */}
            <div className={cn("text-right", isRTL && "text-left")}>
              <p className="font-semibold text-foreground">
                {product.revenue.toLocaleString()} {t('sar')}
              </p>
              <p className="text-sm text-muted-foreground">
                {product.sales.toLocaleString()} {t('units')}
              </p>
            </div>

            {/* Trend */}
            <div className={cn(
              "flex items-center justify-center w-14 text-sm font-medium rounded-full px-2 py-1",
              product.trend >= 0 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            )}>
              {product.trend >= 0 ? '+' : ''}{product.trend}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
