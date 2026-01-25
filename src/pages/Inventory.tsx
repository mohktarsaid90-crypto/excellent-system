import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockInventory = [
  { id: 1, sku: 'SKU-001', name: 'Premium Coffee Beans 1kg', category: 'Beverages', stock: 245, minStock: 50, price: 89.99, status: 'in_stock' },
  { id: 2, sku: 'SKU-002', name: 'Organic Olive Oil 750ml', category: 'Groceries', stock: 12, minStock: 30, price: 45.50, status: 'low_stock' },
  { id: 3, sku: 'SKU-003', name: 'Fresh Whole Milk 1L', category: 'Dairy', stock: 0, minStock: 100, price: 8.99, status: 'out_of_stock' },
  { id: 4, sku: 'SKU-004', name: 'Whole Wheat Bread', category: 'Bakery', stock: 156, minStock: 40, price: 5.99, status: 'in_stock' },
  { id: 5, sku: 'SKU-005', name: 'Natural Honey 500g', category: 'Groceries', stock: 89, minStock: 25, price: 32.00, status: 'in_stock' },
  { id: 6, sku: 'SKU-006', name: 'Fresh Orange Juice 1L', category: 'Beverages', stock: 23, minStock: 50, price: 12.99, status: 'low_stock' },
];

const statusConfig = {
  in_stock: { label: { en: 'In Stock', ar: 'متوفر' }, className: 'bg-success/10 text-success border-success/20' },
  low_stock: { label: { en: 'Low Stock', ar: 'مخزون منخفض' }, className: 'bg-warning/10 text-warning border-warning/20' },
  out_of_stock: { label: { en: 'Out of Stock', ar: 'نفد المخزون' }, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const Inventory = () => {
  const { t, language, isRTL } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {t('inventory')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Manage your product inventory and stock levels'
                : 'إدارة مخزون المنتجات ومستويات المخزون'
              }
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'Add Product' : 'إضافة منتج'}
          </Button>
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
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('filter')}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t('export')}
          </Button>
        </div>

        {/* Inventory Table */}
        <div className="rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('sku')}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('productName')}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('category')}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('quantity')}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('price')}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Status' : 'الحالة'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {item.stock} {t('units')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {item.price.toFixed(2)} {t('sar')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn("text-xs", statusConfig[item.status as keyof typeof statusConfig].className)}>
                        {statusConfig[item.status as keyof typeof statusConfig].label[language]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">
                        {t('edit')}
                      </Button>
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

export default Inventory;
