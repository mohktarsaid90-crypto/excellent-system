import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Package, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { exportToExcel, exportToPDF } from '@/lib/export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

const statusConfig = {
  in_stock: { label: { en: 'In Stock', ar: 'متوفر' }, className: 'bg-success/10 text-success border-success/20' },
  low_stock: { label: { en: 'Low Stock', ar: 'مخزون منخفض' }, className: 'bg-warning/10 text-warning border-warning/20' },
  out_of_stock: { label: { en: 'Out of Stock', ar: 'نفد المخزون' }, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const Inventory = () => {
  const { t, language, isRTL } = useLanguage();
  const { products, isLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on search
  const filteredProducts = products?.filter(product =>
    product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name_ar.includes(searchQuery) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine stock status
  const getStockStatus = (stock: number | null, minStock: number | null) => {
    if (stock === null || stock === 0) return 'out_of_stock';
    if (minStock !== null && stock < minStock) return 'low_stock';
    return 'in_stock';
  };

  const handleExportExcel = () => {
    if (!filteredProducts) return;
    
    const data = {
      title: language === 'en' ? 'Inventory Report' : 'تقرير المخزون',
      headers: [
        language === 'en' ? 'SKU' : 'رمز المنتج',
        language === 'en' ? 'Product Name' : 'اسم المنتج',
        language === 'en' ? 'Category' : 'الفئة',
        language === 'en' ? 'Stock Qty' : 'الكمية',
        language === 'en' ? 'Carton Price' : 'سعر الكرتونة',
        language === 'en' ? 'Pieces/Carton' : 'قطع/كرتونة',
        language === 'en' ? 'Unit Price' : 'سعر الوحدة',
      ],
      rows: filteredProducts.map(p => [
        p.sku,
        language === 'en' ? p.name_en : p.name_ar,
        p.category || '-',
        p.stock_quantity || 0,
        `${p.carton_price || 0} EGP`,
        p.pieces_per_carton || 1,
        `${p.unit_price} EGP`,
      ]),
    };
    
    exportToExcel(data, `inventory_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    if (!filteredProducts) return;
    
    const data = {
      title: language === 'en' ? 'Inventory Report' : 'تقرير المخزون',
      headers: ['SKU', 'Product', 'Category', 'Qty', 'Carton Price', 'Pcs/Carton', 'Unit Price'],
      rows: filteredProducts.map(p => [
        p.sku,
        language === 'en' ? p.name_en : p.name_ar,
        p.category || '-',
        p.stock_quantity || 0,
        `${p.carton_price || 0}`,
        p.pieces_per_carton || 1,
        `${p.unit_price}`,
      ]),
    };
    
    exportToPDF(data, `inventory_${new Date().toISOString().split('T')[0]}`);
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('filter')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {t('export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportExcel}>
                {t('exportExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                {t('exportPdf')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Inventory Table */}
        {!isLoading && (
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
                      {language === 'en' ? 'Carton Price' : 'سعر الكرتونة'}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {language === 'en' ? 'Pcs/Carton' : 'قطع/كرتونة'}
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
                  {filteredProducts?.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                        {t('noData')}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts?.map((product) => {
                      const status = getStockStatus(product.stock_quantity, product.min_stock_level);
                      return (
                        <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-medium text-foreground">
                                {language === 'en' ? product.name_en : product.name_ar}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {product.category || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground">
                            {product.stock_quantity || 0} {t('units')}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-foreground">
                            {(product.carton_price || 0).toFixed(2)} {t('sar')}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {product.pieces_per_carton || 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-foreground">
                            {product.unit_price.toFixed(2)} {t('sar')}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={cn("text-xs", statusConfig[status].className)}>
                              {statusConfig[status].label[language]}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="ghost" size="sm">
                              {t('edit')}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Inventory;
