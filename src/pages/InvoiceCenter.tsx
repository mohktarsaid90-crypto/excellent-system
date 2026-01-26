import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInvoices, useInvoiceStats } from '@/hooks/useInvoices';
import { exportToExcel, exportToPDF, formatCurrency, formatDateTime } from '@/lib/export';
import {
  FileText,
  DollarSign,
  Percent,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Download,
  FileSpreadsheet,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const InvoiceCenter = () => {
  const { language, isRTL } = useLanguage();
  const { data: invoices, isLoading } = useInvoices();
  const { data: stats } = useInvoiceStats();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [syncFilter, setSyncFilter] = useState<string>('all');

  const filteredInvoices = useMemo(() => {
    return invoices?.filter((invoice) => {
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.agents?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customers?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.payment_status === statusFilter;
      
      const matchesSync = 
        syncFilter === 'all' ||
        (syncFilter === 'synced' && invoice.is_synced) ||
        (syncFilter === 'offline' && invoice.offline_created);

      return matchesSearch && matchesStatus && matchesSync;
    });
  }, [invoices, searchQuery, statusFilter, syncFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: { en: string; ar: string } }> = {
      pending: {
        variant: 'secondary',
        icon: <Clock className="h-3 w-3" />,
        label: { en: 'Pending', ar: 'قيد الانتظار' },
      },
      partial: {
        variant: 'outline',
        icon: <AlertCircle className="h-3 w-3" />,
        label: { en: 'Partial', ar: 'جزئي' },
      },
      paid: {
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: { en: 'Paid', ar: 'مدفوع' },
      },
      overdue: {
        variant: 'destructive',
        icon: <AlertCircle className="h-3 w-3" />,
        label: { en: 'Overdue', ar: 'متأخر' },
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label[language]}
      </Badge>
    );
  };

  const handleExportExcel = () => {
    if (!filteredInvoices) return;

    const data = {
      title: language === 'en' ? 'Invoices Report' : 'تقرير الفواتير',
      headers: [
        language === 'en' ? 'Invoice #' : 'رقم الفاتورة',
        language === 'en' ? 'Agent' : 'المندوب',
        language === 'en' ? 'Customer' : 'العميل',
        language === 'en' ? 'Subtotal' : 'المجموع الفرعي',
        language === 'en' ? 'Discount' : 'الخصم',
        language === 'en' ? 'VAT' : 'الضريبة',
        language === 'en' ? 'Total' : 'الإجمالي',
        language === 'en' ? 'Status' : 'الحالة',
        language === 'en' ? 'Date' : 'التاريخ',
      ],
      rows: filteredInvoices.map((inv) => [
        inv.invoice_number,
        inv.agents?.name || '-',
        inv.customers?.name || '-',
        Number(inv.subtotal),
        Number(inv.discount_amount),
        Number(inv.vat_amount),
        Number(inv.total_amount),
        inv.payment_status,
        inv.created_at,
      ]),
    };

    exportToExcel(data, `invoices_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    if (!filteredInvoices) return;

    const data = {
      title: language === 'en' ? 'Invoices Report' : 'تقرير الفواتير',
      headers: ['Invoice #', 'Agent', 'Customer', 'Total', 'Status'],
      rows: filteredInvoices.map((inv) => [
        inv.invoice_number,
        inv.agents?.name || '-',
        inv.customers?.name || '-',
        formatCurrency(Number(inv.total_amount)),
        inv.payment_status,
      ]),
    };

    exportToPDF(data, `invoices_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {language === 'en' ? 'Invoice Center' : 'مركز الفواتير'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Real-time invoices with VAT, discounts, and sync status'
                : 'الفواتير الفورية مع الضريبة والخصومات وحالة المزامنة'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات'}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total VAT' : 'إجمالي الضريبة'}
                  </p>
                  <p className="text-2xl font-bold text-info">
                    {formatCurrency(stats?.totalVat || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Discounts' : 'إجمالي الخصومات'}
                  </p>
                  <p className="text-2xl font-bold text-warning">
                    {formatCurrency(stats?.totalDiscounts || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Overdue' : 'متأخر'}
                  </p>
                  <p className="text-2xl font-bold text-destructive">
                    {stats?.overdueCount || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              placeholder={language === 'en' ? 'Search invoices...' : 'البحث عن فاتورة...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("bg-card", isRTL ? "pr-10" : "pl-10")}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={language === 'en' ? 'Status' : 'الحالة'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All Status' : 'جميع الحالات'}</SelectItem>
              <SelectItem value="pending">{language === 'en' ? 'Pending' : 'قيد الانتظار'}</SelectItem>
              <SelectItem value="partial">{language === 'en' ? 'Partial' : 'جزئي'}</SelectItem>
              <SelectItem value="paid">{language === 'en' ? 'Paid' : 'مدفوع'}</SelectItem>
              <SelectItem value="overdue">{language === 'en' ? 'Overdue' : 'متأخر'}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={syncFilter} onValueChange={setSyncFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={language === 'en' ? 'Sync Status' : 'حالة المزامنة'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All' : 'الكل'}</SelectItem>
              <SelectItem value="synced">{language === 'en' ? 'Live Synced' : 'مباشر'}</SelectItem>
              <SelectItem value="offline">{language === 'en' ? 'Offline Upload' : 'رفع بدون اتصال'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === 'en' ? 'Invoices' : 'الفواتير'}
              <Badge variant="secondary" className="ml-2">
                {filteredInvoices?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredInvoices?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'No invoices found' : 'لا توجد فواتير'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'en' ? 'Invoice #' : 'رقم الفاتورة'}</TableHead>
                      <TableHead>{language === 'en' ? 'Agent' : 'المندوب'}</TableHead>
                      <TableHead>{language === 'en' ? 'Customer' : 'العميل'}</TableHead>
                      <TableHead className="text-right">{language === 'en' ? 'Subtotal' : 'المجموع'}</TableHead>
                      <TableHead className="text-right">{language === 'en' ? 'Discount' : 'الخصم'}</TableHead>
                      <TableHead className="text-right">{language === 'en' ? 'VAT (15%)' : 'الضريبة'}</TableHead>
                      <TableHead className="text-right">{language === 'en' ? 'Total' : 'الإجمالي'}</TableHead>
                      <TableHead>{language === 'en' ? 'Status' : 'الحالة'}</TableHead>
                      <TableHead className="text-center">{language === 'en' ? 'Sync' : 'مزامنة'}</TableHead>
                      <TableHead>{language === 'en' ? 'Date' : 'التاريخ'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices?.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>{invoice.agents?.name || '-'}</TableCell>
                        <TableCell>{invoice.customers?.name || '-'}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(invoice.subtotal))}
                        </TableCell>
                        <TableCell className="text-right text-warning">
                          -{formatCurrency(Number(invoice.discount_amount))}
                        </TableCell>
                        <TableCell className="text-right text-info">
                          +{formatCurrency(Number(invoice.vat_amount))}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(Number(invoice.total_amount))}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.payment_status)}</TableCell>
                        <TableCell className="text-center">
                          {invoice.offline_created ? (
                            <div className="flex items-center justify-center gap-1 text-warning">
                              <WifiOff className="h-4 w-4" />
                              <span className="text-xs">Offline</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 text-success">
                              <Wifi className="h-4 w-4" />
                              <span className="text-xs">Live</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(invoice.created_at, language)}
                        </TableCell>
                      </TableRow>
                    ))}
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

export default InvoiceCenter;
