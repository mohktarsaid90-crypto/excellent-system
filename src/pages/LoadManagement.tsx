import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useStockLoads, useApproveStockLoad, useReleaseStockLoad } from '@/hooks/useStockLoads';
import {
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { formatDateTime } from '@/lib/export';
import { cn } from '@/lib/utils';

const LoadManagement = () => {
  const { language } = useLanguage();
  const { user, hasPermission } = useAuth();
  const { data: stockLoads, isLoading } = useStockLoads();
  const approveLoad = useApproveStockLoad();
  const releaseLoad = useReleaseStockLoad();

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const canManageLoads = hasPermission(['it_admin', 'sales_manager']);

  const filteredLoads = stockLoads?.filter(
    (load) => statusFilter === 'all' || load.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: { en: string; ar: string } }> = {
      requested: {
        variant: 'secondary',
        icon: <Clock className="h-3 w-3" />,
        label: { en: 'Requested', ar: 'مطلوب' },
      },
      approved: {
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: { en: 'Approved', ar: 'موافق عليه' },
      },
      released: {
        variant: 'outline',
        icon: <Truck className="h-3 w-3" />,
        label: { en: 'Released', ar: 'تم الإصدار' },
      },
      rejected: {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
        label: { en: 'Rejected', ar: 'مرفوض' },
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

  const handleApprove = async (loadId: string) => {
    if (!user) return;
    await approveLoad.mutateAsync({ id: loadId, approved_by: user.id });
  };

  const handleRelease = async (loadId: string) => {
    if (!user) return;
    await releaseLoad.mutateAsync({ id: loadId, released_by: user.id });
  };

  const stats = {
    requested: stockLoads?.filter((l) => l.status === 'requested').length || 0,
    approved: stockLoads?.filter((l) => l.status === 'approved').length || 0,
    released: stockLoads?.filter((l) => l.status === 'released').length || 0,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            {language === 'en' ? 'Load Management' : 'إدارة التحميل'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Morning stock loading workflow: Request → Approval → Release'
              : 'سير عمل تحميل المخزون الصباحي: طلب ← موافقة ← إصدار'}
          </p>
        </div>

        {/* Workflow Visualization */}
        <Card className="glass overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-secondary-foreground" />
                </div>
                <span className="text-sm font-medium">{language === 'en' ? 'Request' : 'طلب'}</span>
                <Badge variant="secondary">{stats.requested}</Badge>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm font-medium">{language === 'en' ? 'Approved' : 'موافقة'}</span>
                <Badge>{stats.approved}</Badge>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                  <Truck className="h-8 w-8 text-success" />
                </div>
                <span className="text-sm font-medium">{language === 'en' ? 'Released' : 'إصدار'}</span>
                <Badge variant="outline">{stats.released}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={language === 'en' ? 'Filter by status' : 'تصفية حسب الحالة'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All Status' : 'جميع الحالات'}</SelectItem>
              <SelectItem value="requested">{language === 'en' ? 'Requested' : 'مطلوب'}</SelectItem>
              <SelectItem value="approved">{language === 'en' ? 'Approved' : 'موافق عليه'}</SelectItem>
              <SelectItem value="released">{language === 'en' ? 'Released' : 'تم الإصدار'}</SelectItem>
              <SelectItem value="rejected">{language === 'en' ? 'Rejected' : 'مرفوض'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stock Loads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {language === 'en' ? 'Stock Load Requests' : 'طلبات تحميل المخزون'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLoads?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'No stock load requests found' : 'لا توجد طلبات تحميل'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'en' ? 'Agent' : 'المندوب'}</TableHead>
                      <TableHead>{language === 'en' ? 'Status' : 'الحالة'}</TableHead>
                      <TableHead>{language === 'en' ? 'Requested At' : 'تاريخ الطلب'}</TableHead>
                      <TableHead>{language === 'en' ? 'Approved At' : 'تاريخ الموافقة'}</TableHead>
                      <TableHead>{language === 'en' ? 'Released At' : 'تاريخ الإصدار'}</TableHead>
                      <TableHead>{language === 'en' ? 'Actions' : 'الإجراءات'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoads?.map((load) => (
                      <TableRow key={load.id}>
                        <TableCell className="font-medium">
                          {load.agents?.name || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(load.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(load.requested_at, language)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {load.approved_at ? formatDateTime(load.approved_at, language) : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {load.released_at ? formatDateTime(load.released_at, language) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {load.status === 'requested' && canManageLoads && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(load.id)}
                                disabled={approveLoad.isPending}
                              >
                                {approveLoad.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                )}
                                {language === 'en' ? 'Approve' : 'موافقة'}
                              </Button>
                            )}
                            {load.status === 'approved' && canManageLoads && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRelease(load.id)}
                                disabled={releaseLoad.isPending}
                              >
                                {releaseLoad.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Truck className="h-4 w-4 mr-1" />
                                )}
                                {language === 'en' ? 'Release' : 'إصدار'}
                              </Button>
                            )}
                          </div>
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

export default LoadManagement;
