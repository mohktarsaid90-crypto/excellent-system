import { useLanguage } from '@/contexts/LanguageContext';
import { useKPIStats } from '@/hooks/useKPIStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export const KPIMetrics = () => {
  const { language, isRTL } = useLanguage();
  const { data: stats, isLoading } = useKPIStats();

  const kpis = [
    {
      key: 'productivity',
      title: language === 'en' ? 'Productivity' : 'الإنتاجية',
      subtitle: language === 'en' ? 'Invoices per Visit' : 'فواتير لكل زيارة',
      value: stats?.productivity || 0,
      format: (v: number) => v.toFixed(2),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      key: 'strikeRate',
      title: language === 'en' ? 'Strike Rate' : 'معدل النجاح',
      subtitle: language === 'en' ? 'Successful Visits' : 'الزيارات الناجحة',
      value: stats?.strikeRate || 0,
      format: (v: number) => `${v.toFixed(1)}%`,
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      key: 'dropSize',
      title: language === 'en' ? 'Drop Size' : 'متوسط البيع',
      subtitle: language === 'en' ? 'Avg. Sale Value' : 'متوسط قيمة البيع',
      value: stats?.dropSize || 0,
      format: (v: number) => `${v.toLocaleString()} ${language === 'en' ? 'EGP' : 'ج.م'}`,
      icon: ShoppingBag,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.key} className="card-hover border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={cn("p-2 rounded-lg", kpi.bgColor)}>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", isRTL && "text-right")}>
              {kpi.format(kpi.value)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
