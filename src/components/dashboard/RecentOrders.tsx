import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentOrder {
  id: string;
  invoice_number: string;
  customer_name: string | null;
  agent_name: string | null;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: { en: string; ar: string }; className: string }> = {
  paid: { label: { en: 'Paid', ar: 'مدفوع' }, className: 'bg-success/10 text-success border-success/20' },
  pending: { label: { en: 'Pending', ar: 'قيد الانتظار' }, className: 'bg-warning/10 text-warning border-warning/20' },
  overdue: { label: { en: 'Overdue', ar: 'متأخر' }, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  partial: { label: { en: 'Partial', ar: 'جزئي' }, className: 'bg-info/10 text-info border-info/20' },
};

export const RecentOrders = () => {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          payment_status,
          created_at,
          customers (name),
          agents (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data.map((invoice) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer_name: invoice.customers?.name || null,
        agent_name: invoice.agents?.name || null,
        total_amount: invoice.total_amount,
        payment_status: invoice.payment_status || 'pending',
        created_at: invoice.created_at,
      })) as RecentOrder[];
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

  const hasNoData = !orders || orders.length === 0;

  const handleViewAll = () => {
    navigate('/sales');
  };

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('recentOrders')}</h3>
        {!hasNoData && (
          <button 
            onClick={handleViewAll}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t('viewAll')}
          </button>
        )}
      </div>

      {hasNoData ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">{t('noData')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className={cn("pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                  {language === 'en' ? 'Invoice #' : 'رقم الفاتورة'}
                </th>
                <th className={cn("pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                  {t('customerName')}
                </th>
                <th className={cn("pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                  {language === 'en' ? 'Agent' : 'المندوب'}
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
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-4 text-sm font-medium text-foreground font-mono">{order.invoice_number}</td>
                  <td className="py-4 text-sm text-foreground">{order.customer_name || '-'}</td>
                  <td className="py-4 text-sm text-muted-foreground">{order.agent_name || '-'}</td>
                  <td className="py-4 text-sm font-semibold text-foreground">
                    {order.total_amount.toLocaleString()} {t('sar')}
                  </td>
                  <td className="py-4">
                    <Badge variant="outline" className={cn("text-xs font-medium", statusConfig[order.payment_status]?.className || statusConfig.pending.className)}>
                      {statusConfig[order.payment_status]?.label[language] || statusConfig.pending.label[language]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
