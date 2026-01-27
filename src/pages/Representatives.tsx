import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Filter, Phone, Mail, MoreVertical, Loader2, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRepresentatives, CreateRepresentativeData, UpdateRepresentativeData } from '@/hooks/useRepresentatives';
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
import { Label } from '@/components/ui/label';

const Representatives = () => {
  const { t, language, isRTL } = useLanguage();
  const { representatives, isLoading, createRepresentative, updateRepresentative, deleteRepresentative, togglePermission } = useRepresentatives();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRep, setSelectedRep] = useState<any>(null);
  
  // SECURITY: Removed password field - agents should use Supabase Auth if authentication is needed
  const [formData, setFormData] = useState<CreateRepresentativeData>({
    name: '',
    email: '',
    phone: '',
    monthly_target: 0,
  });

  const filteredReps = representatives.filter(rep => 
    rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = async () => {
    await createRepresentative.mutateAsync(formData);
    setIsCreateDialogOpen(false);
    setFormData({ name: '', email: '', phone: '', monthly_target: 0 });
  };

  const handleEditSubmit = async () => {
    if (!selectedRep) return;
    const updateData: UpdateRepresentativeData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      monthly_target: formData.monthly_target,
    };
    await updateRepresentative.mutateAsync({ id: selectedRep.id, data: updateData });
    setIsEditDialogOpen(false);
    setSelectedRep(null);
  };

  const handleDelete = async () => {
    if (!selectedRep) return;
    await deleteRepresentative.mutateAsync(selectedRep.id);
    setIsDeleteDialogOpen(false);
    setSelectedRep(null);
  };

  const openEditDialog = (rep: any) => {
    setSelectedRep(rep);
    setFormData({
      name: rep.name,
      email: rep.email,
      phone: rep.phone || '',
      monthly_target: rep.monthly_target,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (rep: any) => {
    setSelectedRep(rep);
    setIsDeleteDialogOpen(true);
  };

  const handleTogglePermission = async (repId: string, permission: string, currentValue: boolean) => {
    await togglePermission.mutateAsync({ id: repId, permission, value: !currentValue });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {t('representatives')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Monitor and manage your sales representatives'
                : 'مراقبة وإدارة مندوبي المبيعات'
              }
            </p>
          </div>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'Add Representative' : 'إضافة مندوب'}
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
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredReps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'en' ? 'No representatives found' : 'لا يوجد مندوبين'}
            </p>
          </div>
        )}

        {/* Representatives Grid */}
        {!isLoading && filteredReps.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredReps.map((rep) => {
              const percentage = rep.monthly_target > 0 
                ? Math.round((rep.current_sales / rep.monthly_target) * 100) 
                : 0;
              
              return (
                <div key={rep.id} className="group rounded-xl bg-card p-6 shadow-sm card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {rep.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className={cn(
                          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
                          rep.is_online ? 'bg-success' : 'bg-muted-foreground'
                        )} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{rep.name}</h3>
                        <Badge variant={rep.is_active ? 'default' : 'secondary'}>
                          {rep.is_active ? t('active') : t('inactive')}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="bg-popover z-50">
                        <DropdownMenuItem onClick={() => openEditDialog(rep)}>
                          <Pencil className="h-4 w-4 me-2" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(rep)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 me-2" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{rep.email}</span>
                    </div>
                    {rep.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{rep.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Permissions */}
                  <div className="space-y-2 mb-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('canGiveDiscounts')}</span>
                      <Switch 
                        checked={rep.can_give_discounts}
                        onCheckedChange={() => handleTogglePermission(rep.id, 'can_give_discounts', rep.can_give_discounts)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('canAddClients')}</span>
                      <Switch 
                        checked={rep.can_add_clients}
                        onCheckedChange={() => handleTogglePermission(rep.id, 'can_add_clients', rep.can_add_clients)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('canProcessReturns')}</span>
                      <Switch 
                        checked={rep.can_process_returns}
                        onCheckedChange={() => handleTogglePermission(rep.id, 'can_process_returns', rep.can_process_returns)}
                      />
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{t('performance')}</span>
                      <span className={cn(
                        "text-sm font-semibold",
                        percentage >= 90 ? 'text-success' : percentage >= 70 ? 'text-warning' : 'text-destructive'
                      )}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "absolute top-0 h-full rounded-full transition-all duration-500",
                          isRTL ? 'right-0' : 'left-0',
                          percentage >= 90 ? 'bg-success' : percentage >= 70 ? 'bg-warning' : 'bg-destructive'
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{rep.current_sales.toLocaleString()} / {rep.monthly_target.toLocaleString()} {t('sar')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(rep)}>
                      {t('edit')}
                    </Button>
                    <Button 
                      variant={rep.is_active ? 'destructive' : 'default'}
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleTogglePermission(rep.id, 'is_active', rep.is_active)}
                    >
                      {rep.is_active ? t('killSwitch') : t('active')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Dialog - SECURITY: Password field removed */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Add Representative' : 'إضافة مندوب'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Create a new sales representative account' : 'إنشاء حساب مندوب مبيعات جديد'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{language === 'en' ? 'Name' : 'الاسم'}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target">{t('monthlyTarget')}</Label>
              <Input
                id="target"
                type="number"
                value={formData.monthly_target}
                onChange={(e) => setFormData({ ...formData, monthly_target: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleCreateSubmit} disabled={createRepresentative.isPending}>
              {createRepresentative.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Edit Representative' : 'تعديل المندوب'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Update representative information' : 'تحديث معلومات المندوب'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{language === 'en' ? 'Name' : 'الاسم'}</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">{t('email')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">{t('phone')}</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-target">{t('monthlyTarget')}</Label>
              <Input
                id="edit-target"
                type="number"
                value={formData.monthly_target}
                onChange={(e) => setFormData({ ...formData, monthly_target: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateRepresentative.isPending}>
              {updateRepresentative.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Delete Representative' : 'حذف المندوب'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? `Are you sure you want to delete ${selectedRep?.name}? This action cannot be undone.`
                : `هل أنت متأكد من حذف ${selectedRep?.name}؟ لا يمكن التراجع عن هذا الإجراء.`
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

export default Representatives;