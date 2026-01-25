import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Eye, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockSales = [
  { id: 'INV-001', customer: 'Ahmed Al-Rashid', rep: 'Mohammed Salem', items: 5, total: 2450, date: '2024-01-25', status: 'completed', paymentStatus: 'paid' },
  { id: 'INV-002', customer: 'Sara Hassan', rep: 'Ali Khalid', items: 3, total: 1890, date: '2024-01-25', status: 'pending', paymentStatus: 'pending' },
  { id: 'INV-003', customer: 'Khalid Omar', rep: 'Yusuf Ahmed', items: 8, total: 3200, date: '2024-01-24', status: 'completed', paymentStatus: 'paid' },
  { id: 'INV-004', customer: 'Fatima Ali', rep: 'Mohammed Salem', items: 2, total: 950, date: '2024-01-24', status: 'cancelled', paymentStatus: 'refunded' },
  { id: 'INV-005', customer: 'Nasser Ibrahim', rep: 'Omar Hassan', items: 12, total: 4100, date: '2024-01-24', status: 'completed', paymentStatus: 'paid' },
  { id: 'INV-006', customer: 'Layla Mohammed', rep: 'Hamad Ibrahim', items: 4, total: 1560, date: '2024-01-23', status: 'completed', paymentStatus: 'partial' },
  { id: 'INV-007', customer: 'Yousef Ali', rep: 'Ali Khalid', items: 6, total: 2780, date: '2024-01-23', status: 'pending', paymentStatus: 'pending' },
];

const orderStatusConfig = {
  completed: { label: { en: 'Completed', ar: 'مكتمل' }, className: 'bg-success/10 text-success border-success/20' },
  pending: { label: { en: 'Pending', ar: 'قيد الانتظار' }, className: 'bg-warning/10 text-warning border-warning/20' },
  cancelled: { label: { en: 'Cancelled', ar: 'ملغي' }, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const paymentStatusConfig = {
  paid: { label: { en: 'Paid', ar: 'مدفوع' }, className: 'bg-success/10 text-success border-success/20' },
  pending: { label: { en: 'Pending', ar: 'معلق' }, className: 'bg-warning/10 text-warning border-warning/20' },
  partial: { label: { en: 'Partial', ar: 'جزئي' }, className: 'bg-info/10 text-info border-info/20' },
  refunded: { label: { en: 'Refunded', ar: 'مسترد' }, className: 'bg-muted text-muted-foreground border-muted' },
};

const Sales = () => {
  const { t, language, isRTL } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {t('sales')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Track and manage all sales transactions'
                : 'تتبع وإدارة جميع معاملات المبيعات'
              }
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'New Sale' : 'عملية بيع جديدة'}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{t('todaySales')}</p>
            <p className="text-2xl font-bold text-foreground mt-1">4,340 {t('sar')}</p>
            <p className="text-xs text-success mt-1">+12.5% {language === 'en' ? 'from yesterday' : 'من الأمس'}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Orders Today' : 'طلبات اليوم'}</p>
            <p className="text-2xl font-bold text-foreground mt-1">23</p>
            <p className="text-xs text-success mt-1">+8 {language === 'en' ? 'from yesterday' : 'من الأمس'}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Pending Orders' : 'طلبات معلقة'}</p>
            <p className="text-2xl font-bold text-warning mt-1">5</p>
            <p className="text-xs text-muted-foreground mt-1">{language === 'en' ? 'Needs attention' : 'تحتاج انتباه'}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Avg. Order Value' : 'متوسط قيمة الطلب'}</p>
            <p className="text-2xl font-bold text-foreground mt-1">188 {t('sar')}</p>
            <p className="text-xs text-success mt-1">+5.2% {language === 'en' ? 'this week' : 'هذا الأسبوع'}</p>
          </div>
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
            <Calendar className="h-4 w-4" />
            {language === 'en' ? 'Date Range' : 'نطاق التاريخ'}
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('filter')}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t('export')}
          </Button>
        </div>

        {/* Sales Table */}
        <div className="rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Invoice #' : 'رقم الفاتورة'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('customerName')}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Rep' : 'المندوب'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('items')}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Total' : 'الإجمالي'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Order Status' : 'حالة الطلب'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Payment' : 'الدفع'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-primary">
                      {sale.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {sale.customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {sale.rep}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {sale.items} {t('items')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {sale.total.toLocaleString()} {t('sar')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn("text-xs", orderStatusConfig[sale.status as keyof typeof orderStatusConfig].className)}>
                        {orderStatusConfig[sale.status as keyof typeof orderStatusConfig].label[language]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn("text-xs", paymentStatusConfig[sale.paymentStatus as keyof typeof paymentStatusConfig].className)}>
                        {paymentStatusConfig[sale.paymentStatus as keyof typeof paymentStatusConfig].label[language]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
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

export default Sales;
