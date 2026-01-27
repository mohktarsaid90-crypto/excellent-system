import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Package, FileText, Download, Calendar, Printer, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { exportToExcel, exportToPDF, formatCurrency, formatDate } from '@/lib/export';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

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

const Reports = () => {
  const { t, language, isRTL } = useLanguage();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Fetch recent invoices for reports
  const { data: recentInvoices, isLoading } = useQuery({
    queryKey: ['recent-invoices-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          created_at,
          payment_status,
          customers (name),
          agents (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Fetch summary stats
  const { data: stats } = useQuery({
    queryKey: ['report-stats'],
    queryFn: async () => {
      const [invoicesRes, customersRes, productsRes, agentsRes] = await Promise.all([
        supabase.from('invoices').select('total_amount, vat_amount'),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('agents').select('current_sales, monthly_target'),
      ]);

      return {
        totalRevenue: invoicesRes.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
        totalVAT: invoicesRes.data?.reduce((sum, inv) => sum + (inv.vat_amount || 0), 0) || 0,
        invoiceCount: invoicesRes.data?.length || 0,
        customerCount: customersRes.count || 0,
        productCount: productsRes.count || 0,
        agents: agentsRes.data || [],
      };
    },
  });

  const handleGenerateReport = async (reportKey: string) => {
    setIsGenerating(reportKey);
    
    try {
      let data;
      const today = new Date().toISOString().split('T')[0];
      
      switch (reportKey) {
        case 'sales_report':
          data = {
            title: language === 'en' ? 'Sales Report' : 'تقرير المبيعات',
            headers: [
              language === 'en' ? 'Invoice #' : 'رقم الفاتورة',
              language === 'en' ? 'Customer' : 'العميل',
              language === 'en' ? 'Agent' : 'المندوب',
              language === 'en' ? 'Amount' : 'المبلغ',
              language === 'en' ? 'Status' : 'الحالة',
              language === 'en' ? 'Date' : 'التاريخ',
            ],
            rows: recentInvoices?.map(inv => [
              inv.invoice_number,
              (inv.customers as any)?.name || '-',
              (inv.agents as any)?.name || '-',
              `${inv.total_amount.toFixed(2)} EGP`,
              inv.payment_status || 'pending',
              formatDate(inv.created_at, language),
            ]) || [],
          };
          exportToPDF(data, `sales_report_${today}`);
          break;

        case 'rep_performance':
          data = {
            title: language === 'en' ? 'Rep Performance Report' : 'تقرير أداء المندوبين',
            headers: [
              language === 'en' ? 'Agent' : 'المندوب',
              language === 'en' ? 'Current Sales' : 'المبيعات الحالية',
              language === 'en' ? 'Target' : 'الهدف',
              language === 'en' ? 'Achievement %' : 'نسبة التحقيق',
            ],
            rows: stats?.agents?.map((agent: any) => [
              agent.name || '-',
              `${(agent.current_sales || 0).toFixed(2)} EGP`,
              `${(agent.monthly_target || 0).toFixed(2)} EGP`,
              agent.monthly_target ? `${((agent.current_sales / agent.monthly_target) * 100).toFixed(1)}%` : '0%',
            ]) || [],
          };
          exportToPDF(data, `rep_performance_${today}`);
          break;

        case 'customer_analysis':
          const { data: customers } = await supabase
            .from('customers')
            .select('name, classification, city, credit_limit, current_balance')
            .limit(50);
          
          data = {
            title: language === 'en' ? 'Customer Analysis Report' : 'تقرير تحليل العملاء',
            headers: [
              language === 'en' ? 'Customer' : 'العميل',
              language === 'en' ? 'Classification' : 'التصنيف',
              language === 'en' ? 'City' : 'المدينة',
              language === 'en' ? 'Credit Limit' : 'حد الائتمان',
              language === 'en' ? 'Balance' : 'الرصيد',
            ],
            rows: customers?.map(c => [
              c.name,
              c.classification || 'retail',
              c.city || '-',
              `${(c.credit_limit || 0).toFixed(2)} EGP`,
              `${(c.current_balance || 0).toFixed(2)} EGP`,
            ]) || [],
          };
          exportToPDF(data, `customer_analysis_${today}`);
          break;

        case 'inventory_report':
          const { data: products } = await supabase
            .from('products')
            .select('sku, name_en, name_ar, category, stock_quantity, min_stock_level, unit_price, carton_price, pieces_per_carton')
            .eq('is_active', true);
          
          data = {
            title: language === 'en' ? 'Inventory Report' : 'تقرير المخزون',
            headers: ['SKU', language === 'en' ? 'Product' : 'المنتج', language === 'en' ? 'Stock' : 'المخزون', language === 'en' ? 'Min Level' : 'الحد الأدنى', language === 'en' ? 'Unit Price' : 'سعر الوحدة'],
            rows: products?.map(p => [
              p.sku,
              language === 'en' ? p.name_en : p.name_ar,
              p.stock_quantity || 0,
              p.min_stock_level || 0,
              `${p.unit_price.toFixed(2)} EGP`,
            ]) || [],
          };
          exportToPDF(data, `inventory_report_${today}`);
          break;
      }

      toast({
        title: language === 'en' ? 'Report Generated' : 'تم إنشاء التقرير',
        description: language === 'en' ? 'Your report has been downloaded' : 'تم تحميل التقرير',
      });
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const handlePrintSummary = () => {
    const summaryData = {
      title: language === 'en' ? 'Business Summary Report' : 'ملخص الأعمال',
      headers: [
        language === 'en' ? 'Metric' : 'المقياس',
        language === 'en' ? 'Value' : 'القيمة',
      ],
      rows: [
        [language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات', `${stats?.totalRevenue?.toLocaleString() || 0} EGP`],
        [language === 'en' ? 'Total VAT Collected' : 'إجمالي الضريبة', `${stats?.totalVAT?.toLocaleString() || 0} EGP`],
        [language === 'en' ? 'Total Invoices' : 'إجمالي الفواتير', stats?.invoiceCount?.toString() || '0'],
        [language === 'en' ? 'Total Customers' : 'إجمالي العملاء', stats?.customerCount?.toString() || '0'],
        [language === 'en' ? 'Total Products' : 'إجمالي المنتجات', stats?.productCount?.toString() || '0'],
      ],
    };
    
    exportToPDF(summaryData, `business_summary_${new Date().toISOString().split('T')[0]}`);
    
    toast({
      title: language === 'en' ? 'Summary Printed' : 'تم طباعة الملخص',
      description: language === 'en' ? 'Business summary has been downloaded' : 'تم تحميل ملخص الأعمال',
    });
  };

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
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handlePrintSummary}>
              <Printer className="h-4 w-4" />
              {language === 'en' ? 'Print Summary' : 'طباعة الملخص'}
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Calendar className="h-4 w-4" />
              {language === 'en' ? 'Schedule Report' : 'جدولة تقرير'}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات'}</p>
            <p className="text-2xl font-bold text-primary">{stats?.totalRevenue?.toLocaleString() || 0} {t('sar')}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Invoices' : 'إجمالي الفواتير'}</p>
            <p className="text-2xl font-bold">{stats?.invoiceCount || 0}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Customers' : 'إجمالي العملاء'}</p>
            <p className="text-2xl font-bold">{stats?.customerCount || 0}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'VAT Collected' : 'الضريبة المحصلة'}</p>
            <p className="text-2xl font-bold text-success">{stats?.totalVAT?.toLocaleString() || 0} {t('sar')}</p>
          </div>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleGenerateReport(report.key)}
                disabled={isGenerating === report.key}
              >
                {isGenerating === report.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  language === 'en' ? 'Generate' : 'إنشاء'
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {language === 'en' ? 'Recent Transactions' : 'المعاملات الأخيرة'}
            </h3>
            <Button variant="ghost" size="sm">
              {t('viewAll')}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {recentInvoices?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t('noData')}</p>
              ) : (
                recentInvoices?.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {invoice.invoice_number} - {(invoice.customers as any)?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(invoice.agents as any)?.name || '-'} • {formatDate(invoice.created_at, language)} • {invoice.total_amount.toFixed(2)} {t('sar')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
