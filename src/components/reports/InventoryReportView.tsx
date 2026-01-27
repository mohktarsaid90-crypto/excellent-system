import { useLanguage } from '@/contexts/LanguageContext';
import { InventoryReportData } from '@/hooks/useReportsData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface InventoryReportViewProps {
  data: InventoryReportData[];
  totals: {
    totalProducts: number;
    totalStockValue: number;
    totalDamaged: number;
    totalReturned: number;
    lowStockCount: number;
  };
}

export function InventoryReportView({ data, totals }: InventoryReportViewProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Products' : 'إجمالي المنتجات'}</p>
          <p className="text-2xl font-bold text-primary">{totals.totalProducts}</p>
        </div>
        <div className="rounded-xl bg-success/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Stock Value' : 'قيمة المخزون'}</p>
          <p className="text-2xl font-bold text-success">{totals.totalStockValue.toLocaleString()} ج.م</p>
        </div>
        <div className="rounded-xl bg-warning/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Low Stock Items' : 'منتجات منخفضة'}</p>
          <p className="text-2xl font-bold text-warning">{totals.lowStockCount}</p>
        </div>
        <div className="rounded-xl bg-destructive/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Damaged Items' : 'التالف'}</p>
          <p className="text-2xl font-bold text-destructive">{totals.totalDamaged}</p>
        </div>
        <div className="rounded-xl bg-info/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Returns' : 'المرتجعات'}</p>
          <p className="text-2xl font-bold text-info">{totals.totalReturned}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>{language === 'en' ? 'Product' : 'المنتج'}</TableHead>
              <TableHead>{language === 'en' ? 'Category' : 'الفئة'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Stock' : 'المخزون'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Min Level' : 'الحد الأدنى'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Unit Price' : 'سعر الوحدة'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Value' : 'القيمة'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Damaged' : 'التالف'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Returns' : 'المرتجع'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {language === 'en' ? 'No products found' : 'لا يوجد منتجات'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} className={cn(row.isLowStock && 'bg-warning/5')}>
                  <TableCell className="font-mono text-sm">{row.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {row.isLowStock && <AlertTriangle className="h-4 w-4 text-warning" />}
                      <span className="font-medium">{language === 'en' ? row.nameEn : row.nameAr || row.nameEn}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.category}</Badge>
                  </TableCell>
                  <TableCell className={cn(
                    "text-center font-medium",
                    row.isLowStock ? 'text-warning' : ''
                  )}>
                    {row.stockQuantity}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{row.minStockLevel}</TableCell>
                  <TableCell className="text-right">{row.unitPrice.toLocaleString()} ج.م</TableCell>
                  <TableCell className="text-right font-medium">{row.stockValue.toLocaleString()} ج.م</TableCell>
                  <TableCell className={cn(
                    "text-center",
                    row.damagedQuantity > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'
                  )}>
                    {row.damagedQuantity}
                  </TableCell>
                  <TableCell className={cn(
                    "text-center",
                    row.returnedQuantity > 0 ? 'text-info font-medium' : 'text-muted-foreground'
                  )}>
                    {row.returnedQuantity}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
