import { useState, useEffect } from 'react';
import { AgentMobileLayout } from '@/components/agent/AgentMobileLayout';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, CheckCircle, DollarSign, Package, Weight, Loader2 } from 'lucide-react';

interface KPIData {
  totalVisits: number;
  successfulVisits: number;
  totalInvoices: number;
  totalSales: number;
  productivity: number;
  strikeRate: number;
  dropSize: number;
}

const AgentTargets = () => {
  const { agent } = useAgentAuth();
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (agent) {
      fetchKPIs();
    }
  }, [agent]);

  const fetchKPIs = async () => {
    if (!agent) return;

    try {
      // Fetch visits for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [visitsRes, invoicesRes] = await Promise.all([
        supabase
          .from('agent_visits')
          .select('id, outcome')
          .eq('agent_id', agent.id)
          .gte('visit_date', startOfMonth.toISOString().split('T')[0]),
        supabase
          .from('invoices')
          .select('id, total_amount')
          .eq('agent_id', agent.id)
          .gte('created_at', startOfMonth.toISOString()),
      ]);

      const visits = visitsRes.data || [];
      const invoices = invoicesRes.data || [];

      const totalVisits = visits.length;
      const successfulVisits = visits.filter(v => v.outcome === 'sale').length;
      const totalInvoices = invoices.length;
      const totalSales = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      // Calculate KPIs
      const productivity = totalVisits > 0 ? (totalInvoices / totalVisits) * 100 : 0;
      const strikeRate = totalVisits > 0 ? (successfulVisits / totalVisits) * 100 : 0;
      const dropSize = totalInvoices > 0 ? totalSales / totalInvoices : 0;

      setKpis({
        totalVisits,
        successfulVisits,
        totalInvoices,
        totalSales,
        productivity,
        strikeRate,
        dropSize,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching KPIs:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-emerald-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <AgentMobileLayout title="أدائي" showBack>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AgentMobileLayout>
    );
  }

  const valueProgress = agent?.monthly_target ? ((agent.current_sales || 0) / agent.monthly_target) * 100 : 0;
  const cartonsProgress = agent?.cartons_target ? 0 : 0; // Would need cartons sold data
  const tonsProgress = agent?.tons_target ? 0 : 0; // Would need tons sold data

  return (
    <AgentMobileLayout title="أدائي" showBack>
      <div className="p-4 space-y-4">
        {/* Target vs Actual Cards */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            المستهدفات
          </h2>

          {/* Value Target */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">القيمة (ج.م)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {((agent?.current_sales || 0)).toLocaleString()} / {(agent?.monthly_target || 0).toLocaleString()}
                </span>
              </div>
              <Progress value={Math.min(valueProgress, 100)} className="h-3" />
              <p className="text-left text-sm font-bold mt-1 text-primary">
                {valueProgress.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          {/* Cartons Target */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">الكراتين</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  0 / {agent?.cartons_target || 0}
                </span>
              </div>
              <Progress value={cartonsProgress} className="h-3" />
              <p className="text-left text-sm font-bold mt-1 text-primary">
                {cartonsProgress.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          {/* Tons Target */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Weight className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">الأطنان</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  0 / {agent?.tons_target || 0}
                </span>
              </div>
              <Progress value={tonsProgress} className="h-3" />
              <p className="text-left text-sm font-bold mt-1 text-primary">
                {tonsProgress.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards */}
        <div className="space-y-3 pt-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            مؤشرات الأداء
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Productivity */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-blue-600 font-medium">الإنتاجية</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {kpis?.productivity.toFixed(0) || 0}%
                </p>
                <p className="text-xs text-blue-500 mt-1">فواتير / زيارات</p>
              </CardContent>
            </Card>

            {/* Strike Rate */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium">معدل النجاح</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">
                  {kpis?.strikeRate.toFixed(0) || 0}%
                </p>
                <p className="text-xs text-emerald-500 mt-1">مبيعات / زيارات</p>
              </CardContent>
            </Card>

            {/* Drop Size */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-amber-600 font-medium">متوسط الفاتورة</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {(kpis?.dropSize || 0).toFixed(0)}
                </p>
                <p className="text-xs text-amber-500 mt-1">ج.م</p>
              </CardContent>
            </Card>

            {/* Total Visits */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-purple-600 font-medium">زيارات الشهر</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">
                  {kpis?.totalVisits || 0}
                </p>
                <p className="text-xs text-purple-500 mt-1">زيارة</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">إجمالي المبيعات هذا الشهر</p>
                <p className="text-2xl font-bold mt-1">
                  {(kpis?.totalSales || 0).toLocaleString()} ج.م
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AgentMobileLayout>
  );
};

export default AgentTargets;
