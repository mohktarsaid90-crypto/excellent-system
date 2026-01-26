import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { RepPerformance } from '@/components/dashboard/RepPerformance';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

const Dashboard = () => {
  const { t, language } = useLanguage();
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      key: 'totalRevenue',
      value: stats?.totalRevenue || 0,
      valuePrefix: '',
      valueSuffix: ` ${t('sar')}`,
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
      subtitle: t('thisMonth'),
      variant: 'primary' as const,
      format: true,
    },
    {
      key: 'totalSales',
      value: stats?.totalSales || 0,
      icon: ShoppingCart,
      trend: { value: 8.2, isPositive: true },
      subtitle: t('thisMonth'),
      variant: 'default' as const,
      format: true,
    },
    {
      key: 'totalCustomers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      trend: { value: 4.1, isPositive: true },
      subtitle: language === 'en' ? 'Active' : 'نشط',
      variant: 'default' as const,
      format: true,
    },
    {
      key: 'totalProducts',
      value: stats?.totalProducts || 0,
      icon: Package,
      trend: { value: 2.3, isPositive: true },
      subtitle: language === 'en' ? 'In stock' : 'متوفر',
      variant: 'default' as const,
      format: false,
    },
    {
      key: 'activeReps',
      value: stats?.activeReps || 0,
      icon: UserCheck,
      trend: { value: 0, isPositive: true },
      subtitle: language === 'en' ? 'Online now' : 'متصل الآن',
      variant: 'success' as const,
      format: false,
    },
    {
      key: 'lowStock',
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      subtitle: language === 'en' ? 'Items need attention' : 'تحتاج انتباه',
      variant: 'warning' as const,
      format: false,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            {t('dashboard')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Overview of your sales performance and key metrics'
              : 'نظرة عامة على أداء المبيعات والمقاييس الرئيسية'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : (
            statCards.map((stat) => (
              <StatCard
                key={stat.key}
                title={t(stat.key)}
                value={`${stat.valuePrefix || ''}${stat.format ? stat.value.toLocaleString() : stat.value}${stat.valueSuffix || ''}`}
                icon={stat.icon}
                trend={stat.trend}
                subtitle={stat.subtitle}
                variant={stat.variant}
              />
            ))
          )}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div>
            <RepPerformance />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentOrders />
          <TopProducts />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
