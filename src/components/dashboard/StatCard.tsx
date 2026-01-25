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

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
  success: 'bg-gradient-to-br from-success to-success/80 text-success-foreground',
  warning: 'bg-gradient-to-br from-warning to-warning/80 text-warning-foreground',
  info: 'bg-gradient-to-br from-info to-info/80 text-info-foreground',
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) => {
  const { isRTL } = useLanguage();
  const isGradient = variant !== 'default';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl p-6 shadow-sm transition-all duration-300 card-hover',
        variantStyles[variant],
        isGradient && 'shadow-lg'
      )}
    >
      {/* Background decoration */}
      <div className={cn(
        "absolute -top-12 opacity-10",
        isRTL ? "-left-12" : "-right-12"
      )}>
        <Icon className="h-32 w-32" />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            isGradient ? 'opacity-90' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className={cn(
            "mt-2 text-3xl font-bold tracking-tight",
            isGradient ? '' : 'text-foreground'
          )}>
            {value}
          </p>
          
          {(subtitle || trend) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && (
                <span className={cn(
                  "flex items-center gap-1 text-sm font-medium rounded-full px-2 py-0.5",
                  isGradient 
                    ? 'bg-white/20'
                    : trend.isPositive 
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
                <span className={cn(
                  "text-sm",
                  isGradient ? 'opacity-80' : 'text-muted-foreground'
                )}>
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          isGradient ? 'bg-white/20' : 'bg-primary/10'
        )}>
          <Icon className={cn(
            "h-6 w-6",
            isGradient ? '' : 'text-primary'
          )} />
        </div>
      </div>
    </div>
  );
};
