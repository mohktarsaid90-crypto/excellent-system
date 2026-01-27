import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Filter, Download, Eye, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDateTime } from '@/lib/export';

interface SaleRecord {
  id: string;
  invoice_number: string;
  customer_name: string | null;
  agent_name: string | null;
  item_count: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

const paymentStatusConfig: Record<string, { label: { en: string; ar: string }; className: string }> = {
  paid: { label: { en: 'Paid', ar: 'مدفوع' }, className: 'bg-success/10 text-success border-success/20' },
  pending: { label: { en: 'Pending', ar: 'معلق' }, className: 'bg-warning/10 text-warning border-warning/20' },
  partial: { label: { en: 'Partial', ar: 'جزئي' }, className: 'bg-info/10 text-info border-info/20' },
  overdue: { label: { en: 'Overdue', ar: 'متأخر' }, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const Sales = () => {
  const { t, language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sales data from invoices
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-page-data'],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get item counts for each invoice
      const invoiceIds = invoices?.map((inv) => inv.id) || [];
      const { data: itemCounts, error: itemError } = await supabase
        .from('invoice_items')
        .select('invoice_id, quantity')
        .in('invoice_id', invoiceIds);

      if (itemError) throw itemError;

      // Aggregate item counts
      const countMap = new Map<string, number>();
      itemCounts?.forEach((item) => {
        const count = countMap.get(item.invoice_id) || 0;
        countMap.set(item.invoice_id, count + item.quantity);
      });

      return invoices?.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        customer_name: inv.customers?.name || null,
        agent_name: inv.agents?.name || null,
        item_count: countMap.get(inv.id) || 0,
        total_amount: Number(inv.total_amount) || 0,
        payment_status: inv.payment_status || 'pending',
        created_at: inv.created_at,
      })) as SaleRecord[];
    },
    refetchInterval: 30000,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!salesData) return { todaySales: 0, ordersToday: 0, pendingOrders: 0, avgOrderValue: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = salesData.filter((sale) => new Date(sale.created_at) >= today);
    const todaySales = todayOrders.reduce((sum, sale) => sum + sale.total_amount, 0);
    const pendingOrders = salesData.filter((sale) => sale.payment_status === 'pending').length;
    const avgOrderValue = salesData.length > 0
      ? salesData.reduce((sum, sale) => sum + sale.total_amount, 0) / salesData.length
      : 0;

    return {
      todaySales,
      ordersToday: todayOrders.length,
      pendingOrders,
      avgOrderValue: Math.round(avgOrderValue),
    };
  }, [salesData]);

  // Filter sales
  const filteredSales = useMemo(() => {
    return salesData?.filter((sale) => {
      const matchesSearch =
        sale.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.agent_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [salesData, searchQuery]);

  const hasNoData = !filteredSales || filteredSales.length === 0;

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
            <p className="text-2xl font-bold text-foreground mt-1">
              {stats.todaySales.toLocaleString()} {t('sar')}
            </p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Orders Today' : 'طلبات اليوم'}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.ordersToday}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Pending Orders' : 'طلبات معلقة'}</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats.pendingOrders}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Avg. Order Value' : 'متوسط قيمة الطلب'}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {stats.avgOrderValue.toLocaleString()} {t('sar')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : hasNoData ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">{t('noData')}</p>
            </div>
          ) : (
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
                      {language === 'en' ? 'Agent' : 'المندوب'}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('items')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {language === 'en' ? 'Total' : 'الإجمالي'}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {language === 'en' ? 'Payment' : 'الدفع'}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('date')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSales?.map((sale) => (
                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-medium text-primary">
                        {sale.invoice_number}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {sale.customer_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {sale.agent_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {sale.item_count} {t('items')}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        {sale.total_amount.toLocaleString()} {t('sar')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn("text-xs", paymentStatusConfig[sale.payment_status]?.className || paymentStatusConfig.pending.className)}>
                          {paymentStatusConfig[sale.payment_status]?.label[language] || paymentStatusConfig.pending.label[language]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDateTime(sale.created_at, language)}
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
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Sales;
