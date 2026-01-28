import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) => {
  const { isRTL } = useLanguage();

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl p-6 transition-all duration-300 card-outline-orange card-hover'
      )}
    >
      {/* Background decoration */}
      <div className={cn(
        "absolute -top-12 opacity-5",
        isRTL ? "-left-12" : "-right-12"
      )}>
        <Icon className="h-32 w-32 text-primary" />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          {/* Title - Muted grey */}
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          {/* Value - Pure white */}
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          
          {(subtitle || trend) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && (
                <span className={cn(
                  "flex items-center gap-1 text-sm font-medium rounded-full px-2 py-0.5",
                  trend.isPositive 
                    ? 'text-success bg-success/10' 
                    : 'text-destructive bg-destructive/10'
                )}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value}%
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon container - Orange icon with subtle background */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 group-hover:shadow-glow">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
};
