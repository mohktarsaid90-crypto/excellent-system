import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { TrendingUp, Target } from 'lucide-react';

interface Rep {
  id: string;
  name: string;
  avatar: string;
  target: number;
  achieved: number;
  orders: number;
}

const mockReps: Rep[] = [
  { id: '1', name: 'Mohammed Salem', avatar: 'MS', target: 50000, achieved: 48500, orders: 34 },
  { id: '2', name: 'Ali Khalid', avatar: 'AK', target: 45000, achieved: 42000, orders: 28 },
  { id: '3', name: 'Omar Hassan', avatar: 'OH', target: 40000, achieved: 38750, orders: 25 },
  { id: '4', name: 'Yusuf Ahmed', avatar: 'YA', target: 35000, achieved: 31200, orders: 22 },
  { id: '5', name: 'Hamad Ibrahim', avatar: 'HI', target: 30000, achieved: 25800, orders: 18 },
];

export const RepPerformance = () => {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('repPerformance')}</h3>
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          {t('viewAll')}
        </button>
      </div>

      <div className="space-y-4">
        {mockReps.map((rep, index) => {
          const percentage = Math.round((rep.achieved / rep.target) * 100);
          const isTopPerformer = percentage >= 95;

          return (
            <div key={rep.id} className="group">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  index === 0 && "bg-warning/20 text-warning",
                  index === 1 && "bg-muted text-muted-foreground",
                  index === 2 && "bg-accent/20 text-accent",
                  index > 2 && "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>

                {/* Avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {rep.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground truncate">{rep.name}</span>
                    <div className="flex items-center gap-2">
                      {isTopPerformer && (
                        <TrendingUp className="h-4 w-4 text-success" />
                      )}
                      <span className={cn(
                        "text-sm font-semibold",
                        percentage >= 90 ? 'text-success' : percentage >= 70 ? 'text-warning' : 'text-destructive'
                      )}>
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute top-0 h-full rounded-full transition-all duration-500",
                        isRTL ? 'right-0' : 'left-0',
                        percentage >= 90 ? 'bg-success' : percentage >= 70 ? 'bg-warning' : 'bg-destructive'
                      )}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {rep.achieved.toLocaleString()} / {rep.target.toLocaleString()} {t('sar')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {rep.orders} {language === 'en' ? 'orders' : 'طلب'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
