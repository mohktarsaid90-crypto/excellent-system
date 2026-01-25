import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MapPin, Phone, Mail, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockReps = [
  { 
    id: 1, 
    name: 'Mohammed Salem', 
    email: 'mohammed.s@company.com', 
    phone: '+966 50 123 4567',
    territory: 'Riyadh Central',
    status: 'online',
    target: 50000,
    achieved: 48500,
    customers: 45,
    lastActive: '2 min ago'
  },
  { 
    id: 2, 
    name: 'Ali Khalid', 
    email: 'ali.k@company.com', 
    phone: '+966 55 234 5678',
    territory: 'Riyadh North',
    status: 'online',
    target: 45000,
    achieved: 42000,
    customers: 38,
    lastActive: '5 min ago'
  },
  { 
    id: 3, 
    name: 'Omar Hassan', 
    email: 'omar.h@company.com', 
    phone: '+966 54 345 6789',
    territory: 'Jeddah',
    status: 'offline',
    target: 40000,
    achieved: 38750,
    customers: 42,
    lastActive: '2 hours ago'
  },
  { 
    id: 4, 
    name: 'Yusuf Ahmed', 
    email: 'yusuf.a@company.com', 
    phone: '+966 56 456 7890',
    territory: 'Dammam',
    status: 'online',
    target: 35000,
    achieved: 31200,
    customers: 35,
    lastActive: '10 min ago'
  },
  { 
    id: 5, 
    name: 'Hamad Ibrahim', 
    email: 'hamad.i@company.com', 
    phone: '+966 50 567 8901',
    territory: 'Makkah',
    status: 'offline',
    target: 30000,
    achieved: 25800,
    customers: 28,
    lastActive: '1 day ago'
  },
];

const Representatives = () => {
  const { t, language, isRTL } = useLanguage();

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
          <Button className="gap-2 bg-primary hover:bg-primary/90">
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
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('filter')}
          </Button>
        </div>

        {/* Representatives Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mockReps.map((rep) => {
            const percentage = Math.round((rep.achieved / rep.target) * 100);
            
            return (
              <div key={rep.id} className="group rounded-xl bg-card p-6 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {rep.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
                        rep.status === 'online' ? 'bg-success' : 'bg-muted-foreground'
                      )} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{rep.name}</h3>
                      <p className="text-sm text-muted-foreground">{rep.territory}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{rep.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{rep.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{rep.territory}</span>
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
                    <span>{rep.achieved.toLocaleString()} / {rep.target.toLocaleString()} {t('sar')}</span>
                    <span>{rep.customers} {language === 'en' ? 'customers' : 'عميل'}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    {t('view')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    {t('edit')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Representatives;
