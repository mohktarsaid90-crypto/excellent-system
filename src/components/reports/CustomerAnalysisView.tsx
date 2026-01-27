import { useLanguage } from '@/contexts/LanguageContext';
import { CustomerAnalysisData } from '@/hooks/useReportsData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CustomerAnalysisViewProps {
  data: CustomerAnalysisData[];
  totals: {
    totalCustomers: number;
    totalPurchases: number;
    totalInvoices: number;
    totalCreditLimit: number;
    totalBalance: number;
    classificationStats: {
      retail: number;
      key_retail: number;
      modern_trade: number;
    };
  };
}

export function CustomerAnalysisView({ data, totals }: CustomerAnalysisViewProps) {
  const { language } = useLanguage();

  const classificationColors: Record<string, string> = {
    retail: 'bg-blue-100 text-blue-700',
    key_retail: 'bg-purple-100 text-purple-700',
    modern_trade: 'bg-green-100 text-green-700',
  };

  const classificationLabels: Record<string, { en: string; ar: string }> = {
    retail: { en: 'Retail', ar: 'تجزئة' },
    key_retail: { en: 'Key Retail', ar: 'تجزئة رئيسية' },
    modern_trade: { en: 'Modern Trade', ar: 'تجارة حديثة' },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Customers' : 'إجمالي العملاء'}</p>
          <p className="text-2xl font-bold text-primary">{totals.totalCustomers}</p>
        </div>
        <div className="rounded-xl bg-success/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Purchases' : 'إجمالي المشتريات'}</p>
          <p className="text-2xl font-bold text-success">{totals.totalPurchases.toLocaleString()} ج.م</p>
        </div>
        <div className="rounded-xl bg-info/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Invoices' : 'إجمالي الفواتير'}</p>
          <p className="text-2xl font-bold text-info">{totals.totalInvoices}</p>
        </div>
        <div className="rounded-xl bg-warning/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Credit Limit' : 'حد الائتمان'}</p>
          <p className="text-2xl font-bold text-warning">{totals.totalCreditLimit.toLocaleString()} ج.م</p>
        </div>
        <div className="rounded-xl bg-destructive/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Outstanding Balance' : 'الرصيد المستحق'}</p>
          <p className="text-2xl font-bold text-destructive">{totals.totalBalance.toLocaleString()} ج.م</p>
        </div>
      </div>

      {/* Classification Breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {totals.classificationStats.retail}
          </div>
          <div>
            <p className="font-medium">{language === 'en' ? 'Retail' : 'تجزئة'}</p>
            <p className="text-sm text-muted-foreground">
              {((totals.classificationStats.retail / totals.totalCustomers) * 100 || 0).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
            {totals.classificationStats.key_retail}
          </div>
          <div>
            <p className="font-medium">{language === 'en' ? 'Key Retail' : 'تجزئة رئيسية'}</p>
            <p className="text-sm text-muted-foreground">
              {((totals.classificationStats.key_retail / totals.totalCustomers) * 100 || 0).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
            {totals.classificationStats.modern_trade}
          </div>
          <div>
            <p className="font-medium">{language === 'en' ? 'Modern Trade' : 'تجارة حديثة'}</p>
            <p className="text-sm text-muted-foreground">
              {((totals.classificationStats.modern_trade / totals.totalCustomers) * 100 || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'en' ? 'Customer' : 'العميل'}</TableHead>
              <TableHead>{language === 'en' ? 'Classification' : 'التصنيف'}</TableHead>
              <TableHead>{language === 'en' ? 'City' : 'المدينة'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Credit Limit' : 'حد الائتمان'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Balance' : 'الرصيد'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Purchases' : 'المشتريات'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Invoices' : 'الفواتير'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {language === 'en' ? 'No customers found' : 'لا يوجد عملاء'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <Badge className={cn("font-normal", classificationColors[row.classification])}>
                      {classificationLabels[row.classification]?.[language] || row.classification}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.city}</TableCell>
                  <TableCell className="text-right">{row.creditLimit.toLocaleString()} ج.م</TableCell>
                  <TableCell className={`text-right ${row.currentBalance > 0 ? 'text-destructive' : ''}`}>
                    {row.currentBalance.toLocaleString()} ج.م
                  </TableCell>
                  <TableCell className="text-right font-medium">{row.totalPurchases.toLocaleString()} ج.م</TableCell>
                  <TableCell className="text-center">{row.invoiceCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
