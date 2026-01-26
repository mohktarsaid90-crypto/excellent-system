import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReconciliations, useApproveReconciliation, useDisputeReconciliation } from '@/hooks/useReconciliations';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Loader2,
  DollarSign,
  Package,
  RotateCcw,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/export';
import { cn } from '@/lib/utils';

const Reconciliation = () => {
  const { language, isRTL, t } = useLanguage();
  const { user, hasPermission } = useAuth();
  const { data: reconciliations, isLoading } = useReconciliations();
  const approveReconciliation = useApproveReconciliation();
  const disputeReconciliation = useDisputeReconciliation();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [selectedReconciliation, setSelectedReconciliation] = useState<string | null>(null);
  const [disputeNotes, setDisputeNotes] = useState('');

  const canManage = hasPermission(['it_admin', 'accountant']);

  const filteredReconciliations = reconciliations?.filter(
    (rec) => statusFilter === 'all' || rec.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: { en: string; ar: string } }> = {
      pending: {
        variant: 'secondary',
        icon: <Clock className="h-3 w-3" />,
        label: { en: 'Pending', ar: 'قيد الانتظار' },
      },
      submitted: {
        variant: 'default',
        icon: <ClipboardCheck className="h-3 w-3" />,
        label: { en: 'Submitted', ar: 'مقدم' },
      },
      approved: {
        variant: 'outline',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: { en: 'Approved', ar: 'موافق عليه' },
      },
      disputed: {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
        label: { en: 'Disputed', ar: 'متنازع عليه' },
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

  const handleApprove = async (id: string) => {
    if (!user) return;
    await approveReconciliation.mutateAsync({ id, approved_by: user.id });
  };

  const handleDispute = async () => {
    if (!selectedReconciliation) return;
    await disputeReconciliation.mutateAsync({
      id: selectedReconciliation,
      notes: disputeNotes,
    });
    setDisputeDialogOpen(false);
    setDisputeNotes('');
    setSelectedReconciliation(null);
  };

  const openDisputeDialog = (id: string) => {
    setSelectedReconciliation(id);
    setDisputeDialogOpen(true);
  };

  const stats = {
    totalCollected: reconciliations?.reduce((sum, r) => sum + Number(r.cash_collected), 0) || 0,
    totalVariance: reconciliations?.reduce((sum, r) => sum + Number(r.variance), 0) || 0,
    pendingCount: reconciliations?.filter((r) => r.status === 'submitted').length || 0,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={cn(isRTL && "text-right")}>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            {language === 'en' ? 'End-of-Day Reconciliation' : 'تسوية نهاية اليوم (تفريغ)'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Settle sold vs returned stock and verify cash collection'
              : 'تسوية المباع مقابل المرتجع والتحقق من النقد المحصل'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">
                    {t('cashCollected')}
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(stats.totalCollected)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">
                    {t('variance')}
                  </p>
                  <p className={cn(
                    "text-2xl font-bold",
                    stats.totalVariance === 0 ? "text-success" : stats.totalVariance > 0 ? "text-info" : "text-destructive"
                  )}>
                    {formatCurrency(stats.totalVariance)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Pending Review' : 'في انتظار المراجعة'}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {stats.pendingCount}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={language === 'en' ? 'Filter by status' : 'تصفية حسب الحالة'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All Status' : 'جميع الحالات'}</SelectItem>
              <SelectItem value="pending">{t('pending')}</SelectItem>
              <SelectItem value="submitted">{t('submitted')}</SelectItem>
              <SelectItem value="approved">{t('approved')}</SelectItem>
              <SelectItem value="disputed">{t('disputed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reconciliations Table */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <ClipboardCheck className="h-5 w-5" />
              {language === 'en' ? 'Reconciliation Records' : 'سجلات التسوية'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReconciliations?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'No reconciliation records found' : 'لا توجد سجلات تسوية'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(isRTL && "text-right")}>{t('agent')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('date')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{language === 'en' ? 'Status' : 'الحالة'}</TableHead>
                      <TableHead className="text-center">
                        <div className={cn("flex items-center justify-center gap-1", isRTL && "flex-row-reverse")}>
                          <Package className="h-4 w-4" />
                          {t('totalLoaded')}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className={cn("flex items-center justify-center gap-1", isRTL && "flex-row-reverse")}>
                          <DollarSign className="h-4 w-4" />
                          {t('totalSold')}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className={cn("flex items-center justify-center gap-1", isRTL && "flex-row-reverse")}>
                          <RotateCcw className="h-4 w-4" />
                          {t('totalReturned')}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        {t('cashCollected')}
                      </TableHead>
                      <TableHead className="text-center">
                        {t('variance')}
                      </TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReconciliations?.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell className={cn("font-medium", isRTL && "text-right")}>
                          {rec.agents?.name || '-'}
                        </TableCell>
                        <TableCell className={cn("text-sm text-muted-foreground", isRTL && "text-right")}>
                          {formatDate(rec.date, language)}
                        </TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{getStatusBadge(rec.status)}</TableCell>
                        <TableCell className="text-center">{rec.total_loaded}</TableCell>
                        <TableCell className="text-center text-success">{rec.total_sold}</TableCell>
                        <TableCell className="text-center text-warning">{rec.total_returned}</TableCell>
                        <TableCell className="text-center font-medium">
                          {formatCurrency(Number(rec.cash_collected))}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "font-medium",
                            Number(rec.variance) === 0 ? "text-success" : Number(rec.variance) > 0 ? "text-info" : "text-destructive"
                          )}>
                            {formatCurrency(Number(rec.variance))}
                          </span>
                        </TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>
                          {rec.status === 'submitted' && canManage && (
                            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(rec.id)}
                                disabled={approveReconciliation.isPending}
                              >
                                {approveReconciliation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className={cn("h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
                                )}
                                {t('approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDisputeDialog(rec.id)}
                              >
                                <XCircle className={cn("h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
                                {language === 'en' ? 'Dispute' : 'اعتراض'}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dispute Dialog */}
        <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
          <DialogContent className={cn(isRTL && "text-right")}>
            <DialogHeader>
              <DialogTitle className={cn(isRTL && "text-right")}>
                {language === 'en' ? 'Dispute Reconciliation' : 'الاعتراض على التسوية'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Textarea
                placeholder={language === 'en' ? 'Enter reason for dispute...' : 'أدخل سبب الاعتراض...'}
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                rows={4}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <div className={cn("flex gap-2", isRTL ? "justify-start" : "justify-end")}>
                <Button variant="outline" onClick={() => setDisputeDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDispute}
                  disabled={disputeReconciliation.isPending || !disputeNotes.trim()}
                >
                  {disputeReconciliation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    language === 'en' ? 'Submit Dispute' : 'تقديم الاعتراض'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Reconciliation;
