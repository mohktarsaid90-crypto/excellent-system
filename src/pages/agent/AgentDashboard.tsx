import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentMobileLayout } from '@/components/agent/AgentMobileLayout';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Receipt, TrendingUp, Package, Truck, Route, UserPlus } from 'lucide-react';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { agent } = useAgentAuth();
  const [todayStats, setTodayStats] = useState({ visits: 0, sales: 0 });

  useEffect(() => {
    if (agent) {
      fetchTodayStats();
    }
  }, [agent]);

  const fetchTodayStats = async () => {
    if (!agent) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [visitsRes, salesRes] = await Promise.all([
        supabase
          .from('agent_visits')
          .select('id', { count: 'exact' })
          .eq('agent_id', agent.id)
          .eq('visit_date', today),
        supabase
          .from('invoices')
          .select('total_amount')
          .eq('agent_id', agent.id)
          .gte('created_at', today),
      ]);

      const visitsCount = visitsRes.count || 0;
      const salesTotal = salesRes.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      setTodayStats({ visits: visitsCount, sales: salesTotal });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching today stats:', error);
      }
    }
  };

  const menuItems = [
    {
      id: 'route',
      title: 'خط سير اليوم',
      subtitle: 'عرض العملاء المجدولين لليوم',
      icon: Route,
      color: 'from-teal-500 to-teal-600',
      path: '/agent/today-route',
    },
    {
      id: 'visit',
      title: 'زيارة جديدة',
      subtitle: 'ابدأ زيارة عميل',
      icon: MapPin,
      color: 'from-emerald-500 to-emerald-600',
      path: '/agent/visit',
    },
    {
      id: 'sale',
      title: 'فاتورة بيع',
      subtitle: 'إنشاء فاتورة جديدة',
      icon: Receipt,
      color: 'from-blue-500 to-blue-600',
      path: '/agent/sale',
    },
    {
      id: 'targets',
      title: 'أدائي',
      subtitle: 'عرض المستهدفات والإنجازات',
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      path: '/agent/targets',
    },
    {
      id: 'inventory',
      title: 'مخزني',
      subtitle: 'عرض البضاعة المحملة',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      path: '/agent/inventory',
    },
    {
      id: 'settlement',
      title: 'تفريغ وتسوية',
      subtitle: 'إنهاء الوردية وتسوية النقدية',
      icon: Truck,
      color: 'from-rose-500 to-rose-600',
      path: '/agent/settlement',
    },
  ];

  // Add customer button if agent has permission
  const showAddCustomer = agent?.can_add_clients;

  return (
    <AgentMobileLayout>
      <div className="p-4 space-y-4">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-muted-foreground">زيارات اليوم</p>
            <p className="text-2xl font-bold text-primary">{todayStats.visits}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-muted-foreground">مبيعات اليوم</p>
            <p className="text-2xl font-bold text-emerald-600">{todayStats.sales.toLocaleString()} ج.م</p>
          </div>
        </div>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 gap-4 pt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                relative overflow-hidden rounded-2xl p-6 text-white
                bg-gradient-to-br ${item.color}
                shadow-lg active:scale-[0.98] transition-transform
                flex items-center gap-4
              `}
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                  <item.icon className="h-8 w-8" />
                </div>
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-white/80 text-sm mt-1">{item.subtitle}</p>
              </div>
              <div className="text-white/60">
                <span className="text-2xl">←</span>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
            </button>
          ))}

          {/* Add Customer Button */}
          {showAddCustomer && (
            <button
              onClick={() => navigate('/agent/add-customer')}
              className="relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg active:scale-[0.98] transition-transform flex items-center gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserPlus className="h-8 w-8" />
                </div>
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-xl font-bold">إضافة عميل</h3>
                <p className="text-white/80 text-sm mt-1">تسجيل عميل جديد بالموقع</p>
              </div>
              <div className="text-white/60">
                <span className="text-2xl">←</span>
              </div>
              
              <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
            </button>
          )}
        </div>
      </div>
    </AgentMobileLayout>
  );
};

export default AgentDashboard;
