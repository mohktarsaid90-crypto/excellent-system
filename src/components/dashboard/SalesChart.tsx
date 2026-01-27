import { useLanguage } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const arabicMonths: { [key: string]: string } = {
  Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل',
  May: 'مايو', Jun: 'يونيو', Jul: 'يوليو', Aug: 'أغسطس',
  Sep: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر',
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type ViewType = 'revenue' | 'orders';

export const SalesChart = () => {
  const { t, language, isRTL } = useLanguage();
  const [view, setView] = useState<ViewType>('revenue');

  // Fetch real sales data from invoices table
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-chart-data'],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('created_at, total_amount')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData: { [key: string]: { sales: number; orders: number } } = {};
      
      // Initialize all months
      monthNames.forEach(month => {
        monthlyData[month] = { sales: 0, orders: 0 };
      });

      // Aggregate invoice data by month
      invoices?.forEach(invoice => {
        const date = new Date(invoice.created_at);
        const monthName = monthNames[date.getMonth()];
        monthlyData[monthName].sales += invoice.total_amount || 0;
        monthlyData[monthName].orders += 1;
      });

      return monthNames.map(month => ({
        name: month,
        sales: Math.round(monthlyData[month].sales),
        orders: monthlyData[month].orders,
      }));
    },
    refetchInterval: 30000,
  });

  const chartData = salesData?.map(item => ({
    ...item,
    name: language === 'ar' ? arabicMonths[item.name] : item.name,
  })) || [];

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('salesOverview')}</h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setView('revenue')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              view === 'revenue'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {language === 'en' ? 'Revenue' : 'الإيرادات'}
          </button>
          <button
            onClick={() => setView('orders')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              view === 'orders'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {language === 'en' ? 'Orders' : 'الطلبات'}
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'revenue' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                reversed={isRTL}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                orientation={isRTL ? 'right' : 'left'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value.toLocaleString()} ${t('sar')}`, language === 'en' ? 'Revenue' : 'الإيرادات']}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(168, 76%, 36%)"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                reversed={isRTL}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                orientation={isRTL ? 'right' : 'left'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [value, language === 'en' ? 'Orders' : 'الطلبات']}
              />
              <Bar 
                dataKey="orders" 
                fill="hsl(38, 92%, 50%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
