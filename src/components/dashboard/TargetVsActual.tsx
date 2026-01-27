import { useLanguage } from '@/contexts/LanguageContext';
import { useTargetVsActual } from '@/hooks/useKPIStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Package, DollarSign, Scale } from 'lucide-react';

export const TargetVsActual = () => {
  const { language, isRTL } = useLanguage();
  const { data: targets, isLoading } = useTargetVsActual();

  const metrics = [
    {
      key: 'volume',
      title: language === 'en' ? 'Volume (Cartons)' : 'الحجم (كراتين)',
      target: targets?.volumeTarget || 0,
      actual: targets?.volumeActual || 0,
      percent: targets?.volumePercent || 0,
      icon: Package,
      format: (v: number) => v.toLocaleString(),
    },
    {
      key: 'value',
      title: language === 'en' ? 'Value (EGP)' : 'القيمة (ج.م)',
      target: targets?.valueTarget || 0,
      actual: targets?.valueActual || 0,
      percent: targets?.valuePercent || 0,
      icon: DollarSign,
      format: (v: number) => v.toLocaleString(),
    },
    {
      key: 'weight',
      title: language === 'en' ? 'Weight (Tons)' : 'الوزن (طن)',
      target: targets?.weightTarget || 0,
      actual: targets?.weightActual || 0,
      percent: targets?.weightPercent || 0,
      icon: Scale,
      format: (v: number) => v.toFixed(2),
    },
  ];

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className={cn(isRTL && "text-right")}>
          {language === 'en' ? 'Target vs Actual' : 'الهدف مقابل الفعلي'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => {
          const progressColor = metric.percent >= 100 
            ? 'bg-success' 
            : metric.percent >= 75 
              ? 'bg-primary' 
              : metric.percent >= 50 
                ? 'bg-warning' 
                : 'bg-destructive';

          return (
            <div key={metric.key} className="space-y-2">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{metric.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(metric.percent)}%
                </span>
              </div>
              <Progress 
                value={Math.min(metric.percent, 100)} 
                className="h-2"
              />
              <div className={cn("flex justify-between text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                <span>
                  {language === 'en' ? 'Actual: ' : 'الفعلي: '}
                  {metric.format(metric.actual)}
                </span>
                <span>
                  {language === 'en' ? 'Target: ' : 'الهدف: '}
                  {metric.format(metric.target)}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
