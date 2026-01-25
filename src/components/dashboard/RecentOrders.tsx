import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  rep: string;
}

const mockOrders: Order[] = [
  { id: 'ORD-001', customer: 'Ahmed Al-Rashid', amount: 2450, status: 'completed', date: '2024-01-25', rep: 'Mohammed S.' },
  { id: 'ORD-002', customer: 'Sara Hassan', amount: 1890, status: 'pending', date: '2024-01-25', rep: 'Ali K.' },
  { id: 'ORD-003', customer: 'Khalid Omar', amount: 3200, status: 'completed', date: '2024-01-24', rep: 'Yusuf A.' },
  { id: 'ORD-004', customer: 'Fatima Ali', amount: 950, status: 'cancelled', date: '2024-01-24', rep: 'Mohammed S.' },
  { id: 'ORD-005', customer: 'Nasser Ibrahim', amount: 4100, status: 'completed', date: '2024-01-24', rep: 'Omar H.' },
];

const statusConfig = {
  completed: { label: { en: 'Completed', ar: 'مكتمل' }, className: 'bg-success/10 text-success border-success/20' },
  pending: { label: { en: 'Pending', ar: 'قيد الانتظار' }, className: 'bg-warning/10 text-warning border-warning/20' },
  cancelled: { label: { en: 'Cancelled', ar: 'ملغي' }, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export const RecentOrders = () => {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('recentOrders')}</h3>
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          {t('viewAll')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={cn("pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                {language === 'en' ? 'Order ID' : 'رقم الطلب'}
              </th>
              <th className={cn("pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                {t('customerName')}
              </th>
              <th className={cn("pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                {language === 'en' ? 'Rep' : 'المندوب'}
              </th>
              <th className={cn("pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                {language === 'en' ? 'Amount' : 'المبلغ'}
              </th>
              <th className={cn("pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                {language === 'en' ? 'Status' : 'الحالة'}
              </th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-4 text-sm font-medium text-foreground">{order.id}</td>
                <td className="py-4 text-sm text-foreground">{order.customer}</td>
                <td className="py-4 text-sm text-muted-foreground">{order.rep}</td>
                <td className="py-4 text-sm font-semibold text-foreground">
                  {order.amount.toLocaleString()} {t('sar')}
                </td>
                <td className="py-4">
                  <Badge variant="outline" className={cn("text-xs font-medium", statusConfig[order.status].className)}>
                    {statusConfig[order.status].label[language]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
