import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Grid3X3, List, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const mockProducts = [
  { id: 1, name: 'Premium Coffee Beans 1kg', category: 'Beverages', price: 89.99, discount: 10, stock: 245, status: 'active' },
  { id: 2, name: 'Organic Olive Oil 750ml', category: 'Groceries', price: 45.50, discount: 0, stock: 12, status: 'active' },
  { id: 3, name: 'Fresh Whole Milk 1L', category: 'Dairy', price: 8.99, discount: 5, stock: 0, status: 'inactive' },
  { id: 4, name: 'Whole Wheat Bread', category: 'Bakery', price: 5.99, discount: 0, stock: 156, status: 'active' },
  { id: 5, name: 'Natural Honey 500g', category: 'Groceries', price: 32.00, discount: 15, stock: 89, status: 'active' },
  { id: 6, name: 'Fresh Orange Juice 1L', category: 'Beverages', price: 12.99, discount: 0, stock: 23, status: 'active' },
  { id: 7, name: 'Greek Yogurt 500g', category: 'Dairy', price: 15.50, discount: 0, stock: 67, status: 'active' },
  { id: 8, name: 'Almond Butter 350g', category: 'Groceries', price: 28.00, discount: 20, stock: 34, status: 'active' },
];

const Products = () => {
  const { t, language, isRTL } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {t('products')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Manage your product catalog and pricing'
                : 'إدارة كتالوج المنتجات والأسعار'
              }
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'Add Product' : 'إضافة منتج'}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row flex-1">
            <div className="relative flex-1 max-w-md">
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
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockProducts.map((product) => (
              <div key={product.id} className="group rounded-xl bg-card p-4 shadow-sm card-hover">
                <div className="relative aspect-square rounded-lg bg-muted mb-4 flex items-center justify-center overflow-hidden">
                  <Package className="h-16 w-16 text-muted-foreground/50" />
                  {product.discount > 0 && (
                    <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                      -{product.discount}%
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <h3 className="font-medium text-foreground line-clamp-2">{product.name}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {product.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            {(product.price * (1 - product.discount / 100)).toFixed(2)} {t('sar')}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground">
                          {product.price.toFixed(2)} {t('sar')}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      product.stock > 0 ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'
                    )}>
                      {product.stock > 0 ? `${product.stock} ${t('units')}` : (language === 'en' ? 'Out of stock' : 'نفد المخزون')}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="flex-1">
                    {t('view')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    {t('edit')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('productName')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('category')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('price')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('discount')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('quantity')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{product.price.toFixed(2)} {t('sar')}</td>
                      <td className="px-6 py-4">
                        {product.discount > 0 ? (
                          <Badge className="bg-accent text-accent-foreground">-{product.discount}%</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{product.stock} {t('units')}</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">{t('edit')}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Products;
