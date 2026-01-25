import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Building2, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockCustomers = [
  { id: 1, name: 'Ahmed Al-Rashid', company: 'Rashid Trading Co.', email: 'ahmed@rashid.com', phone: '+966 50 111 2222', city: 'Riyadh', orders: 45, totalSpent: 125000, status: 'active' },
  { id: 2, name: 'Sara Hassan', company: 'Hassan Supermarket', email: 'sara@hassan.com', phone: '+966 55 222 3333', city: 'Jeddah', orders: 32, totalSpent: 89000, status: 'active' },
  { id: 3, name: 'Khalid Omar', company: 'Omar & Sons', email: 'khalid@omar.com', phone: '+966 54 333 4444', city: 'Dammam', orders: 28, totalSpent: 76500, status: 'active' },
  { id: 4, name: 'Fatima Ali', company: 'Ali Markets', email: 'fatima@ali.com', phone: '+966 56 444 5555', city: 'Makkah', orders: 15, totalSpent: 42000, status: 'inactive' },
  { id: 5, name: 'Nasser Ibrahim', company: 'Ibrahim Foods', email: 'nasser@ibrahim.com', phone: '+966 50 555 6666', city: 'Riyadh', orders: 52, totalSpent: 156000, status: 'active' },
  { id: 6, name: 'Layla Mohammed', company: 'Mohammed Stores', email: 'layla@mohammed.com', phone: '+966 55 666 7777', city: 'Madinah', orders: 8, totalSpent: 23500, status: 'inactive' },
];

const statusConfig = {
  active: { label: { en: 'Active', ar: 'نشط' }, className: 'bg-success/10 text-success border-success/20' },
  inactive: { label: { en: 'Inactive', ar: 'غير نشط' }, className: 'bg-muted text-muted-foreground border-muted' },
};

const Customers = () => {
  const { t, language, isRTL } = useLanguage();

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
          <Button className="gap-2 bg-primary hover:bg-primary/90">
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

        {/* Customers Table */}
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
                    {language === 'en' ? 'Orders' : 'الطلبات'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Total Spent' : 'إجمالي المشتريات'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {language === 'en' ? 'Status' : 'الحالة'}
                  </th>
                  <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{customer.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {customer.company}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {customer.city}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {customer.orders}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {customer.totalSpent.toLocaleString()} {t('sar')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn("text-xs", statusConfig[customer.status as keyof typeof statusConfig].className)}>
                        {statusConfig[customer.status as keyof typeof statusConfig].label[language]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          {t('view')}
                        </Button>
                        <Button variant="ghost" size="sm">
                          {t('edit')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Customers;
