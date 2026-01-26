import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Building2, Phone, Mail, Loader2, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomers, CreateCustomerData, UpdateCustomerData } from '@/hooks/useCustomers';
import { useRepresentatives } from '@/hooks/useRepresentatives';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const Customers = () => {
  const { t, language, isRTL } = useLanguage();
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { representatives } = useRepresentatives();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [formData, setFormData] = useState<CreateCustomerData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    credit_limit: 0,
    assigned_agent_id: '',
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateSubmit = async () => {
    await createCustomer.mutateAsync({
      ...formData,
      assigned_agent_id: formData.assigned_agent_id || undefined,
    });
    setIsCreateDialogOpen(false);
    setFormData({ name: '', email: '', phone: '', address: '', city: '', credit_limit: 0, assigned_agent_id: '' });
  };

  const handleEditSubmit = async () => {
    if (!selectedCustomer) return;
    const updateData: UpdateCustomerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      credit_limit: formData.credit_limit,
      assigned_agent_id: formData.assigned_agent_id || undefined,
    };
    await updateCustomer.mutateAsync({ id: selectedCustomer.id, data: updateData });
    setIsEditDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    await deleteCustomer.mutateAsync(selectedCustomer.id);
    setIsDeleteDialogOpen(false);
    setSelectedCustomer(null);
  };

  const openEditDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      credit_limit: customer.credit_limit || 0,
      assigned_agent_id: customer.assigned_agent_id || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {t('customers')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Manage your customer relationships and data'
                : 'إدارة علاقات العملاء وبياناتهم'
              }
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'Add Customer' : 'إضافة عميل'}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
            <Input
              placeholder={t('search')}
              className={cn("bg-card", isRTL ? 'pr-10' : 'pl-10')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('filter')}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t('export')}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'en' ? 'No customers found' : 'لا يوجد عملاء'}
            </p>
          </div>
        )}

        {/* Customers Table */}
        {!isLoading && filteredCustomers.length > 0 && (
          <div className="rounded-xl bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('customerName')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {language === 'en' ? 'Contact' : 'التواصل'}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {language === 'en' ? 'City' : 'المدينة'}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {language === 'en' ? 'Credit Limit' : 'حد الائتمان'}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {language === 'en' ? 'Balance' : 'الرصيد'}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{customer.name}</p>
                            {customer.address && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {customer.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {customer.email && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </p>
                          )}
                          {customer.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {customer.city || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        {customer.credit_limit.toLocaleString()} {t('sar')}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        {customer.current_balance.toLocaleString()} {t('sar')}
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="bg-popover z-50">
                            <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                              <Pencil className="h-4 w-4 me-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(customer)} className="text-destructive">
                              <Trash2 className="h-4 w-4 me-2" />
                              {t('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Add Customer' : 'إضافة عميل'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Create a new customer account' : 'إنشاء حساب عميل جديد'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{language === 'en' ? 'Name' : 'الاسم'}</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('email')}</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{t('phone')}</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'City' : 'المدينة'}</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Credit Limit' : 'حد الائتمان'}</Label>
                <Input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('address')}</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>{language === 'en' ? 'Assigned Agent' : 'المندوب المسؤول'}</Label>
              <Select value={formData.assigned_agent_id} onValueChange={(v) => setFormData({ ...formData, assigned_agent_id: v })}>
                <SelectTrigger><SelectValue placeholder={language === 'en' ? 'Select agent' : 'اختر المندوب'} /></SelectTrigger>
                <SelectContent>
                  {representatives.map((rep) => (
                    <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleCreateSubmit} disabled={createCustomer.isPending}>
              {createCustomer.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Edit Customer' : 'تعديل العميل'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Update customer information' : 'تحديث معلومات العميل'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{language === 'en' ? 'Name' : 'الاسم'}</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('email')}</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{t('phone')}</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'City' : 'المدينة'}</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Credit Limit' : 'حد الائتمان'}</Label>
                <Input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('address')}</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleEditSubmit} disabled={updateCustomer.isPending}>
              {updateCustomer.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'en' ? 'Are you sure?' : 'هل أنت متأكد؟'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en'
                ? `This will permanently delete ${selectedCustomer?.name}. This action cannot be undone.`
                : `سيتم حذف ${selectedCustomer?.name} نهائياً. لا يمكن التراجع عن هذا الإجراء.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Customers;
