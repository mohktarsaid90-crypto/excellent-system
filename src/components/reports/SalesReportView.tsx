import { useLanguage } from '@/contexts/LanguageContext';
import { SalesReportData } from '@/hooks/useReportsData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/export';
import { cn } from '@/lib/utils';

interface SalesReportViewProps {
  data: SalesReportData[];
  totals: {
    totalRevenue: number;
    totalVat: number;
    totalDiscount: number;
    invoiceCount: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
  };
}

export function SalesReportView({ data, totals }: SalesReportViewProps) {
  const { language } = useLanguage();

  const statusColors: Record<string, string> = {
    paid: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    overdue: 'bg-destructive/10 text-destructive',
    partial: 'bg-info/10 text-info',
  };

  const statusLabels: Record<string, { en: string; ar: string }> = {
    paid: { en: 'Paid', ar: 'مدفوع' },
    pending: { en: 'Pending', ar: 'معلق' },
    overdue: { en: 'Overdue', ar: 'متأخر' },
    partial: { en: 'Partial', ar: 'جزئي' },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات'}</p>
          <p className="text-2xl font-bold text-primary">{totals.totalRevenue.toLocaleString()} ج.م</p>
        </div>
        <div className="rounded-xl bg-success/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'VAT Collected' : 'الضريبة المحصلة'}</p>
          <p className="text-2xl font-bold text-success">{totals.totalVat.toLocaleString()} ج.م</p>
        </div>
        <div className="rounded-xl bg-warning/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Discounts' : 'إجمالي الخصومات'}</p>
          <p className="text-2xl font-bold text-warning">{totals.totalDiscount.toLocaleString()} ج.م</p>
        </div>
        <div className="rounded-xl bg-muted p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Invoices' : 'الفواتير'}</p>
          <p className="text-2xl font-bold">{totals.invoiceCount}</p>
          <div className="flex gap-2 mt-1 text-xs">
            <span className="text-success">{totals.paidCount} {language === 'en' ? 'paid' : 'مدفوع'}</span>
            <span className="text-warning">{totals.pendingCount} {language === 'en' ? 'pending' : 'معلق'}</span>
            <span className="text-destructive">{totals.overdueCount} {language === 'en' ? 'overdue' : 'متأخر'}</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'en' ? 'Invoice #' : 'رقم الفاتورة'}</TableHead>
              <TableHead>{language === 'en' ? 'Customer' : 'العميل'}</TableHead>
              <TableHead>{language === 'en' ? 'Agent' : 'المندوب'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Amount' : 'المبلغ'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'VAT' : 'الضريبة'}</TableHead>
              <TableHead>{language === 'en' ? 'Status' : 'الحالة'}</TableHead>
              <TableHead>{language === 'en' ? 'Date' : 'التاريخ'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {language === 'en' ? 'No data for this period' : 'لا توجد بيانات لهذه الفترة'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{row.invoiceNumber}</TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{row.agentName}</TableCell>
                  <TableCell className="text-right font-medium">{row.amount.toLocaleString()} ج.م</TableCell>
                  <TableCell className="text-right">{row.vatAmount.toLocaleString()} ج.م</TableCell>
                  <TableCell>
                    <Badge className={cn("font-normal", statusColors[row.paymentStatus] || statusColors.pending)}>
                      {statusLabels[row.paymentStatus]?.[language] || row.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(row.createdAt, language)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
