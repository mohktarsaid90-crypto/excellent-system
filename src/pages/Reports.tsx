import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Package, FileText, Download, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const reportTypes = [
  { 
    key: 'sales_report', 
    icon: BarChart3, 
    title: { en: 'Sales Report', ar: 'تقرير المبيعات' },
    description: { en: 'Overview of sales performance by period', ar: 'نظرة عامة على أداء المبيعات حسب الفترة' },
    color: 'bg-primary/10 text-primary'
  },
  { 
    key: 'rep_performance', 
    icon: TrendingUp, 
    title: { en: 'Rep Performance', ar: 'أداء المندوبين' },
    description: { en: 'Individual and team performance metrics', ar: 'مقاييس الأداء الفردي والجماعي' },
    color: 'bg-success/10 text-success'
  },
  { 
    key: 'customer_analysis', 
    icon: Users, 
    title: { en: 'Customer Analysis', ar: 'تحليل العملاء' },
    description: { en: 'Customer behavior and purchase patterns', ar: 'سلوك العملاء وأنماط الشراء' },
    color: 'bg-info/10 text-info'
  },
  { 
    key: 'inventory_report', 
    icon: Package, 
    title: { en: 'Inventory Report', ar: 'تقرير المخزون' },
    description: { en: 'Stock levels and movement analysis', ar: 'تحليل مستويات وحركة المخزون' },
    color: 'bg-warning/10 text-warning'
  },
];

const recentReports = [
  { name: 'Monthly Sales Report - January 2024', date: '2024-01-25', type: 'Sales', size: '2.4 MB' },
  { name: 'Q4 2023 Performance Summary', date: '2024-01-15', type: 'Performance', size: '5.1 MB' },
  { name: 'Customer Retention Analysis', date: '2024-01-10', type: 'Customer', size: '1.8 MB' },
  { name: 'Inventory Audit Report', date: '2024-01-05', type: 'Inventory', size: '3.2 MB' },
];

const Reports = () => {
  const { t, language, isRTL } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {t('reports')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Generate and view business analytics reports'
                : 'إنشاء وعرض تقارير تحليلات الأعمال'
              }
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Calendar className="h-4 w-4" />
            {language === 'en' ? 'Schedule Report' : 'جدولة تقرير'}
          </Button>
        </div>

        {/* Report Types Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reportTypes.map((report) => (
            <div key={report.key} className="group rounded-xl bg-card p-6 shadow-sm card-hover cursor-pointer">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl mb-4", report.color)}>
                <report.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{report.title[language]}</h3>
              <p className="text-sm text-muted-foreground mb-4">{report.description[language]}</p>
              <Button variant="outline" size="sm" className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                {language === 'en' ? 'Generate' : 'إنشاء'}
              </Button>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {language === 'en' ? 'Recent Reports' : 'التقارير الأخيرة'}
            </h3>
            <Button variant="ghost" size="sm">
              {t('viewAll')}
            </Button>
          </div>

          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.date} • {report.size}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
