import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Package, FileDown, Loader2, ArrowLeft, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { SalesReportView } from '@/components/reports/SalesReportView';
import { AgentPerformanceView } from '@/components/reports/AgentPerformanceView';
import { CustomerAnalysisView } from '@/components/reports/CustomerAnalysisView';
import { InventoryReportView } from '@/components/reports/InventoryReportView';
import { 
  DateRange, 
  useSalesReport, 
  useAgentPerformanceReport, 
  useCustomerAnalysisReport, 
  useInventoryReport 
} from '@/hooks/useReportsData';
import { exportSummaryToPDF } from '@/lib/arabicPdfExport';

type ReportType = 'sales' | 'agents' | 'customers' | 'inventory' | null;

const reportTypes = [
  { 
    key: 'sales' as ReportType, 
    icon: BarChart3, 
    title: { en: 'Sales Report', ar: 'تقرير المبيعات' },
    description: { en: 'Revenue, invoices, and payment status', ar: 'الإيرادات والفواتير وحالة الدفع' },
    color: 'bg-primary/10 text-primary hover:bg-primary/20'
  },
  { 
    key: 'agents' as ReportType, 
    icon: TrendingUp, 
    title: { en: 'Agent Performance', ar: 'أداء المندوبين' },
    description: { en: 'Productivity, strike rate, drop size', ar: 'الإنتاجية ومعدل النجاح ومتوسط البيع' },
    color: 'bg-success/10 text-success hover:bg-success/20'
  },
  { 
    key: 'customers' as ReportType, 
    icon: Users, 
    title: { en: 'Customer Analysis', ar: 'تحليل العملاء' },
    description: { en: 'Categories and withdrawal patterns', ar: 'التصنيفات وأنماط السحب' },
    color: 'bg-info/10 text-info hover:bg-info/20'
  },
  { 
    key: 'inventory' as ReportType, 
    icon: Package, 
    title: { en: 'Inventory Report', ar: 'تقرير المخزون' },
    description: { en: 'Stock, damages, and returns', ar: 'المخزون والتالف والمرتجعات' },
    color: 'bg-warning/10 text-warning hover:bg-warning/20'
  },
];

const Reports = () => {
  const { t, language } = useLanguage();
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fetch data for each report type
  const salesReport = useSalesReport(dateRange);
  const agentReport = useAgentPerformanceReport(dateRange);
  const customerReport = useCustomerAnalysisReport(dateRange);
  const inventoryReport = useInventoryReport();

  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const dateStr = `${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}`;
      
      switch (selectedReport) {
        case 'sales':
          if (salesReport.data) {
            const summaryItems = [
              { label: language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات', value: `${salesReport.data.totals.totalRevenue.toLocaleString()} ج.م` },
              { label: language === 'en' ? 'VAT Collected' : 'الضريبة المحصلة', value: `${salesReport.data.totals.totalVat.toLocaleString()} ج.م` },
              { label: language === 'en' ? 'Total Discounts' : 'إجمالي الخصومات', value: `${salesReport.data.totals.totalDiscount.toLocaleString()} ج.م` },
              { label: language === 'en' ? 'Invoices' : 'الفواتير', value: salesReport.data.totals.invoiceCount },
            ];
            
            exportSummaryToPDF(
              language === 'en' ? 'Sales Report' : 'تقرير المبيعات',
              summaryItems,
              {
                title: '',
                headers: [
                  language === 'en' ? 'Invoice #' : 'رقم الفاتورة',
                  language === 'en' ? 'Customer' : 'العميل',
                  language === 'en' ? 'Agent' : 'المندوب',
                  language === 'en' ? 'Amount' : 'المبلغ',
                  language === 'en' ? 'Status' : 'الحالة',
                ],
                rows: salesReport.data.data.map(r => [
                  r.invoiceNumber,
                  r.customerName,
                  r.agentName,
                  `${r.amount.toLocaleString()} ج.م`,
                  r.paymentStatus,
                ]),
              },
              `sales_report_${dateStr}`,
              language
            );
          }
          break;

        case 'agents':
          if (agentReport.data) {
            const summaryItems = [
              { label: language === 'en' ? 'Active Agents' : 'المندوبين النشطين', value: agentReport.data.totals.totalAgents },
              { label: language === 'en' ? 'Avg Achievement' : 'متوسط الإنجاز', value: `${agentReport.data.totals.avgAchievement.toFixed(1)}%` },
              { label: language === 'en' ? 'Avg Productivity' : 'متوسط الإنتاجية', value: agentReport.data.totals.avgProductivity.toFixed(2) },
              { label: language === 'en' ? 'Avg Strike Rate' : 'معدل النجاح', value: `${agentReport.data.totals.avgStrikeRate.toFixed(1)}%` },
            ];
            
            exportSummaryToPDF(
              language === 'en' ? 'Agent Performance Report' : 'تقرير أداء المندوبين',
              summaryItems,
              {
                title: '',
                headers: [
                  language === 'en' ? 'Agent' : 'المندوب',
                  language === 'en' ? 'Target' : 'الهدف',
                  language === 'en' ? 'Sales' : 'المبيعات',
                  language === 'en' ? 'Achievement' : 'الإنجاز',
                  language === 'en' ? 'Productivity' : 'الإنتاجية',
                  language === 'en' ? 'Strike Rate' : 'معدل النجاح',
                ],
                rows: agentReport.data.data.map(r => [
                  r.agentName,
                  `${r.monthlyTarget.toLocaleString()} ج.م`,
                  `${r.currentSales.toLocaleString()} ج.م`,
                  `${r.achievementPercent.toFixed(1)}%`,
                  r.productivity.toFixed(2),
                  `${r.strikeRate.toFixed(1)}%`,
                ]),
              },
              `agent_performance_${dateStr}`,
              language
            );
          }
          break;

        case 'customers':
          if (customerReport.data) {
            const summaryItems = [
              { label: language === 'en' ? 'Total Customers' : 'إجمالي العملاء', value: customerReport.data.totals.totalCustomers },
              { label: language === 'en' ? 'Total Purchases' : 'إجمالي المشتريات', value: `${customerReport.data.totals.totalPurchases.toLocaleString()} ج.م` },
              { label: language === 'en' ? 'Total Invoices' : 'إجمالي الفواتير', value: customerReport.data.totals.totalInvoices },
              { label: language === 'en' ? 'Outstanding Balance' : 'الرصيد المستحق', value: `${customerReport.data.totals.totalBalance.toLocaleString()} ج.م` },
            ];
            
            exportSummaryToPDF(
              language === 'en' ? 'Customer Analysis Report' : 'تقرير تحليل العملاء',
              summaryItems,
              {
                title: '',
                headers: [
                  language === 'en' ? 'Customer' : 'العميل',
                  language === 'en' ? 'Classification' : 'التصنيف',
                  language === 'en' ? 'City' : 'المدينة',
                  language === 'en' ? 'Credit Limit' : 'حد الائتمان',
                  language === 'en' ? 'Balance' : 'الرصيد',
                ],
                rows: customerReport.data.data.map(r => [
                  r.name,
                  r.classification,
                  r.city,
                  `${r.creditLimit.toLocaleString()} ج.م`,
                  `${r.currentBalance.toLocaleString()} ج.م`,
                ]),
              },
              `customer_analysis_${dateStr}`,
              language
            );
          }
          break;

        case 'inventory':
          if (inventoryReport.data) {
            const summaryItems = [
              { label: language === 'en' ? 'Total Products' : 'إجمالي المنتجات', value: inventoryReport.data.totals.totalProducts },
              { label: language === 'en' ? 'Stock Value' : 'قيمة المخزون', value: `${inventoryReport.data.totals.totalStockValue.toLocaleString()} ج.م` },
              { label: language === 'en' ? 'Low Stock' : 'منخفض المخزون', value: inventoryReport.data.totals.lowStockCount },
              { label: language === 'en' ? 'Damaged' : 'التالف', value: inventoryReport.data.totals.totalDamaged },
            ];
            
            exportSummaryToPDF(
              language === 'en' ? 'Inventory Report' : 'تقرير المخزون',
              summaryItems,
              {
                title: '',
                headers: [
                  'SKU',
                  language === 'en' ? 'Product' : 'المنتج',
                  language === 'en' ? 'Stock' : 'المخزون',
                  language === 'en' ? 'Min Level' : 'الحد الأدنى',
                  language === 'en' ? 'Value' : 'القيمة',
                ],
                rows: inventoryReport.data.data.map(r => [
                  r.sku,
                  language === 'en' ? r.nameEn : r.nameAr || r.nameEn,
                  r.stockQuantity,
                  r.minStockLevel,
                  `${r.stockValue.toLocaleString()} ج.م`,
                ]),
              },
              `inventory_report_${dateStr}`,
              language
            );
          }
          break;
      }

      toast({
        title: language === 'en' ? 'Report Generated' : 'تم إنشاء التقرير',
        description: language === 'en' ? 'PDF has been downloaded' : 'تم تحميل ملف PDF',
      });
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isLoading = salesReport.isLoading || agentReport.isLoading || customerReport.isLoading || inventoryReport.isLoading;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {selectedReport && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                {selectedReport 
                  ? reportTypes.find(r => r.key === selectedReport)?.title[language]
                  : t('reports')
                }
              </h1>
              <p className="text-muted-foreground">
                {selectedReport
                  ? reportTypes.find(r => r.key === selectedReport)?.description[language]
                  : (language === 'en' 
                    ? 'Generate and view business analytics reports'
                    : 'إنشاء وعرض تقارير تحليلات الأعمال'
                  )
                }
              </p>
            </div>
          </div>

          {selectedReport && (
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90" 
              onClick={handleGeneratePDF}
              disabled={isGeneratingPdf || isLoading}
            >
              {isGeneratingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {language === 'en' ? 'Download PDF' : 'تحميل PDF'}
            </Button>
          )}
        </div>

        {/* Date Range Picker - Only show when a report is selected */}
        {selectedReport && (
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        )}

        {/* Report Selection Grid */}
        {!selectedReport && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reportTypes.map((report) => (
              <div 
                key={report.key} 
                className="group rounded-xl bg-card p-6 shadow-sm card-hover cursor-pointer transition-all"
                onClick={() => setSelectedReport(report.key)}
              >
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl mb-4 transition-colors", report.color)}>
                  <report.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">{report.title[language]}</h3>
                <p className="text-sm text-muted-foreground mb-4">{report.description[language]}</p>
                <div className="flex items-center text-sm text-primary font-medium">
                  <FileText className="h-4 w-4 mr-1" />
                  {language === 'en' ? 'View Report' : 'عرض التقرير'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Content */}
        {selectedReport && (
          <div className="rounded-xl bg-card p-6 shadow-sm">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {selectedReport === 'sales' && salesReport.data && (
                  <SalesReportView data={salesReport.data.data} totals={salesReport.data.totals} />
                )}
                {selectedReport === 'agents' && agentReport.data && (
                  <AgentPerformanceView data={agentReport.data.data} totals={agentReport.data.totals} />
                )}
                {selectedReport === 'customers' && customerReport.data && (
                  <CustomerAnalysisView data={customerReport.data.data} totals={customerReport.data.totals} />
                )}
                {selectedReport === 'inventory' && inventoryReport.data && (
                  <InventoryReportView data={inventoryReport.data.data} totals={inventoryReport.data.totals} />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Reports;
