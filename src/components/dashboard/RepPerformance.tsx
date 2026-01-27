import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { TrendingUp, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface AgentPerformance {
  id: string;
  name: string;
  avatar: string;
  target: number;
  achieved: number;
  orders: number;
}

export const RepPerformance = () => {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['rep-performance'],
    queryFn: async () => {
      // Fetch agents with their targets
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('id, name, monthly_target, current_sales, is_active')
        .eq('is_active', true)
        .order('current_sales', { ascending: false })
        .limit(5);

      if (agentsError) throw agentsError;

      // Fetch invoice counts per agent for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('agent_id')
        .gte('created_at', startOfMonth.toISOString());

      if (invoicesError) throw invoicesError;

      // Count invoices per agent
      const invoiceCounts = new Map<string, number>();
      invoices?.forEach((inv) => {
        const count = invoiceCounts.get(inv.agent_id) || 0;
        invoiceCounts.set(inv.agent_id, count + 1);
      });

      return agentsData?.map((agent) => ({
        id: agent.id,
        name: agent.name,
        avatar: agent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        target: Number(agent.monthly_target) || 0,
        achieved: Number(agent.current_sales) || 0,
        orders: invoiceCounts.get(agent.id) || 0,
      })) as AgentPerformance[];
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const hasNoData = !agents || agents.length === 0;

  const handleViewAll = () => {
    navigate('/agents');
  };

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('repPerformance')}</h3>
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
          <Users className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agents.map((rep, index) => {
            const percentage = rep.target > 0 ? Math.round((rep.achieved / rep.target) * 100) : 0;
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
      )}
    </div>
  );
};
