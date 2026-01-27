import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAgent, useAgentKPIs, useAgentVisits } from '@/hooks/useAgentKPIs';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { DateRange } from '@/hooks/useReportsData';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import {
  ArrowLeft,
  ArrowRight,
  Target,
  TrendingUp,
  ShoppingCart,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2,
  Package,
  Scale,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const locale = language === 'ar' ? ar : enUS;

  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: agent, isLoading: agentLoading } = useAgent(id || '');
  const { data: kpis, isLoading: kpisLoading } = useAgentKPIs(id || '', {
    from: dateRange.from,
    to: dateRange.to,
  });
  const { data: visits, isLoading: visitsLoading } = useAgentVisits(id || '', {
    from: dateRange.from,
    to: dateRange.to,
  });

  const isLoading = agentLoading || kpisLoading;

  const getPerformanceStatus = (value: number, threshold: number = 100) => {
    if (value >= threshold) return { color: 'text-success', bg: 'bg-success/10', status: 'good' };
    if (value >= threshold * 0.75) return { color: 'text-warning', bg: 'bg-warning/10', status: 'warning' };
    return { color: 'text-destructive', bg: 'bg-destructive/10', status: 'poor' };
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-success';
    if (percent >= 75) return 'bg-warning';
    return 'bg-destructive';
  };

  const getOutcomeLabel = (outcome: string | null) => {
    if (!outcome) return { label: language === 'en' ? 'Pending' : 'قيد الانتظار', variant: 'secondary' as const };
    switch (outcome) {
      case 'successful':
        return { label: language === 'en' ? 'Sale Made' : 'تمت البيع', variant: 'default' as const };
      case 'no_sale':
        return { label: language === 'en' ? 'No Sale' : 'لم تتم البيع', variant: 'destructive' as const };
      case 'follow_up':
        return { label: language === 'en' ? 'Follow Up' : 'متابعة', variant: 'secondary' as const };
      default:
        return { label: outcome, variant: 'outline' as const };
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!agent) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="text-muted-foreground">
            {language === 'en' ? 'Agent not found' : 'المندوب غير موجود'}
          </p>
          <Button onClick={() => navigate('/agents')}>
            {language === 'en' ? 'Back to Agents' : 'العودة للمندوبين'}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/agents')}
              className="shrink-0"
            >
              {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                  {agent.name}
                </h1>
                <Badge variant={agent.is_active ? 'default' : 'destructive'}>
                  {agent.is_active
                    ? language === 'en' ? 'Active' : 'نشط'
                    : language === 'en' ? 'Inactive' : 'غير نشط'}
                </Badge>
              </div>
              <p className="text-muted-foreground">{agent.email}</p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <Card>
          <CardContent className="pt-4">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Productivity */}
          <Card className={cn("card-hover", getPerformanceStatus(kpis?.productivity || 0, 0.5).bg)}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Productivity' : 'الإنتاجية'}
                  </p>
                  <p className={cn("mt-2 text-3xl font-bold", getPerformanceStatus((kpis?.productivity || 0) * 100, 50).color)}>
                    {kpis?.productivity || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'en' ? 'Invoices per Visit' : 'فواتير لكل زيارة'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {kpis?.totalInvoices || 0} {language === 'en' ? 'invoices' : 'فاتورة'} / {kpis?.totalVisits || 0} {language === 'en' ? 'visits' : 'زيارة'}
              </div>
            </CardContent>
          </Card>

          {/* Strike Rate */}
          <Card className={cn("card-hover", getPerformanceStatus(kpis?.strikeRate || 0, 70).bg)}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Strike Rate' : 'معدل النجاح'}
                  </p>
                  <p className={cn("mt-2 text-3xl font-bold", getPerformanceStatus(kpis?.strikeRate || 0, 70).color)}>
                    {kpis?.strikeRate || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'en' ? 'Successful Visits' : 'الزيارات الناجحة'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {kpis?.successfulVisits || 0} / {kpis?.totalVisits || 0} {language === 'en' ? 'successful' : 'ناجحة'}
              </div>
            </CardContent>
          </Card>

          {/* Drop Size */}
          <Card className={cn("card-hover", getPerformanceStatus(kpis?.dropSize || 0, 500).bg)}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Drop Size' : 'متوسط الفاتورة'}
                  </p>
                  <p className={cn("mt-2 text-3xl font-bold", getPerformanceStatus(kpis?.dropSize || 0, 500).color)}>
                    {(kpis?.dropSize || 0).toLocaleString()} <span className="text-lg">ج.م</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'en' ? 'Avg per Invoice' : 'متوسط لكل فاتورة'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {(kpis?.totalSalesValue || 0).toLocaleString()} ج.م {language === 'en' ? 'total' : 'إجمالي'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Target Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {language === 'en' ? 'Target Progress' : 'تقدم الهدف'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Value Target (EGP) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {language === 'en' ? 'Value (EGP)' : 'القيمة (ج.م)'}
                    </span>
                  </div>
                  <span className={cn("text-sm font-bold", getPerformanceStatus(kpis?.targetProgress || 0).color)}>
                    {kpis?.targetProgress || 0}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(kpis?.targetProgress || 0, 100)} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{(kpis?.actualValue || 0).toLocaleString()}</span>
                  <span>/ {(kpis?.targetValue || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Cartons Target */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-info" />
                    <span className="font-medium">
                      {language === 'en' ? 'Cartons' : 'كراتين'}
                    </span>
                  </div>
                  <span className={cn("text-sm font-bold", getPerformanceStatus(kpis?.cartonsProgress || 0).color)}>
                    {kpis?.cartonsProgress || 0}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(kpis?.cartonsProgress || 0, 100)} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{kpis?.actualCartons || 0}</span>
                  <span>/ {kpis?.targetCartons || 0}</span>
                </div>
              </div>

              {/* Tons Target */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-warning" />
                    <span className="font-medium">
                      {language === 'en' ? 'Tons' : 'طن'}
                    </span>
                  </div>
                  <span className={cn("text-sm font-bold", getPerformanceStatus(kpis?.tonsProgress || 0).color)}>
                    {kpis?.tonsProgress || 0}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(kpis?.tonsProgress || 0, 100)} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{kpis?.actualTons || 0}</span>
                  <span>/ {kpis?.targetTons || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {language === 'en' ? 'Visit History' : 'سجل الزيارات'}
              {visits && (
                <Badge variant="secondary" className="ml-2">
                  {visits.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visitsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !visits || visits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'No visits found for this period' : 'لا توجد زيارات في هذه الفترة'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'en' ? 'Date' : 'التاريخ'}</TableHead>
                      <TableHead>{language === 'en' ? 'Customer' : 'العميل'}</TableHead>
                      <TableHead>{language === 'en' ? 'Type' : 'النوع'}</TableHead>
                      <TableHead>{language === 'en' ? 'Check In' : 'وقت الدخول'}</TableHead>
                      <TableHead>{language === 'en' ? 'Outcome' : 'النتيجة'}</TableHead>
                      <TableHead>{language === 'en' ? 'Sale' : 'البيع'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((visit) => {
                      const outcomeInfo = getOutcomeLabel(visit.outcome);
                      return (
                        <TableRow key={visit.id}>
                          <TableCell className="font-medium">
                            {format(new Date(visit.visit_date), 'PP', { locale })}
                          </TableCell>
                          <TableCell>
                            {visit.customer?.name || (
                              <span className="text-muted-foreground">
                                {language === 'en' ? 'Unknown' : 'غير معروف'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {visit.visit_type === 'scheduled' 
                                ? language === 'en' ? 'Scheduled' : 'مجدول'
                                : language === 'en' ? 'Ad-hoc' : 'عشوائي'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {visit.check_in_at ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {format(new Date(visit.check_in_at), 'HH:mm')}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={outcomeInfo.variant}>
                              {outcomeInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {visit.invoice_id ? (
                              <div className="flex items-center gap-1 text-success">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{language === 'en' ? 'Yes' : 'نعم'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <XCircle className="h-4 w-4" />
                                <span className="text-sm">{language === 'en' ? 'No' : 'لا'}</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AgentDetail;
