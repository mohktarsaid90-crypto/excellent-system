import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAgents } from '@/hooks/useAgents';
import { 
  Calendar, 
  Plus, 
  Users, 
  MapPin, 
  Loader2,
  ChevronRight,
  ChevronLeft,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
  { value: 0, labelEn: 'Sunday', labelAr: 'الأحد' },
  { value: 1, labelEn: 'Monday', labelAr: 'الإثنين' },
  { value: 2, labelEn: 'Tuesday', labelAr: 'الثلاثاء' },
  { value: 3, labelEn: 'Wednesday', labelAr: 'الأربعاء' },
  { value: 4, labelEn: 'Thursday', labelAr: 'الخميس' },
  { value: 5, labelEn: 'Friday', labelAr: 'الجمعة' },
  { value: 6, labelEn: 'Saturday', labelAr: 'السبت' },
];

interface Customer {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
}

interface WeeklySchedule {
  id?: string;
  agent_id: string;
  day_of_week: number;
  customer_ids: string[];
}

const JourneyPlanning = () => {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const { data: agents, isLoading: agentsLoading } = useAgents();
  
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<Record<number, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentData();
    }
  }, [selectedAgent]);

  const fetchAgentData = async () => {
    setIsLoading(true);
    try {
      // Fetch customers assigned to this agent
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, name, city, address')
        .eq('assigned_agent_id', selectedAgent)
        .order('name');

      if (customerError) throw customerError;
      setCustomers(customerData || []);

      // Fetch existing weekly schedules from journey_plans
      const { data: plansData, error: plansError } = await supabase
        .from('journey_plans')
        .select(`
          id,
          plan_date,
          notes,
          journey_stops (
            customer_id
          )
        `)
        .eq('agent_id', selectedAgent);

      if (plansError) throw plansError;

      // Parse schedules by day of week from notes field (we store day_of_week there)
      const schedules: Record<number, string[]> = {};
      plansData?.forEach((plan: any) => {
        if (plan.notes && plan.notes.startsWith('weekly_day_')) {
          const dayOfWeek = parseInt(plan.notes.replace('weekly_day_', ''));
          const customerIds = plan.journey_stops?.map((stop: any) => stop.customer_id) || [];
          schedules[dayOfWeek] = customerIds;
        }
      });
      setWeeklySchedules(schedules);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching agent data:', error);
      }
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to load data' : 'فشل في تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerDialog = (day: number) => {
    setSelectedDay(day);
    setSelectedCustomers(weeklySchedules[day] || []);
    setIsCustomerDialogOpen(true);
  };

  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const saveSchedule = async () => {
    if (selectedDay === null || !selectedAgent) return;

    setIsSaving(true);
    try {
      // Delete existing plan for this day
      const { data: existingPlans } = await supabase
        .from('journey_plans')
        .select('id')
        .eq('agent_id', selectedAgent)
        .eq('notes', `weekly_day_${selectedDay}`);

      if (existingPlans && existingPlans.length > 0) {
        for (const plan of existingPlans) {
          await supabase.from('journey_stops').delete().eq('journey_plan_id', plan.id);
          await supabase.from('journey_plans').delete().eq('id', plan.id);
        }
      }

      // Create new plan
      if (selectedCustomers.length > 0) {
        const { data: newPlan, error: planError } = await supabase
          .from('journey_plans')
          .insert({
            agent_id: selectedAgent,
            plan_date: new Date().toISOString().split('T')[0],
            notes: `weekly_day_${selectedDay}`,
            status: 'planned',
          })
          .select()
          .single();

        if (planError) throw planError;

        // Add stops
        const stops = selectedCustomers.map((customerId, index) => ({
          journey_plan_id: newPlan.id,
          customer_id: customerId,
          stop_order: index + 1,
        }));

        const { error: stopsError } = await supabase
          .from('journey_stops')
          .insert(stops);

        if (stopsError) throw stopsError;
      }

      // Update local state
      setWeeklySchedules(prev => ({
        ...prev,
        [selectedDay]: selectedCustomers,
      }));

      toast({
        title: language === 'en' ? 'Schedule Saved' : 'تم حفظ الجدول',
        description: language === 'en' ? 'The weekly schedule has been updated' : 'تم تحديث جدول الأسبوع',
      });

      setIsCustomerDialogOpen(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving schedule:', error);
      }
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to save schedule' : 'فشل في حفظ الجدول',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getDayLabel = (day: { value: number; labelEn: string; labelAr: string }) => {
    return language === 'en' ? day.labelEn : day.labelAr;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {language === 'en' ? 'Journey Planning' : 'جدولة خطوط السير'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Assign customers to agents for each day of the week'
                : 'تعيين العملاء للمندوبين لكل يوم من أيام الأسبوع'}
            </p>
          </div>
        </div>

        {/* Agent Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {language === 'en' ? 'Select Agent' : 'اختر المندوب'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder={language === 'en' ? 'Choose an agent...' : 'اختر مندوب...'} />
              </SelectTrigger>
              <SelectContent>
                {agents?.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        {selectedAgent && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'en' ? 'Weekly Schedule' : 'الجدول الأسبوعي'}
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {DAYS_OF_WEEK.map((day) => {
                  const assignedCustomers = weeklySchedules[day.value] || [];
                  const customerNames = assignedCustomers.map(id => 
                    customers.find(c => c.id === id)?.name || ''
                  ).filter(Boolean);

                  return (
                    <Card 
                      key={day.value}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md hover:border-primary",
                        assignedCustomers.length > 0 && "border-primary/50 bg-primary/5"
                      )}
                      onClick={() => openCustomerDialog(day.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{getDayLabel(day)}</h3>
                          <Badge variant={assignedCustomers.length > 0 ? "default" : "secondary"}>
                            {assignedCustomers.length} {language === 'en' ? 'stops' : 'محطة'}
                          </Badge>
                        </div>
                        
                        {customerNames.length > 0 ? (
                          <div className="space-y-1">
                            {customerNames.slice(0, 3).map((name, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{name}</span>
                              </div>
                            ))}
                            {customerNames.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{customerNames.length - 3} {language === 'en' ? 'more' : 'آخرين'}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' ? 'Click to assign customers' : 'اضغط لتعيين العملاء'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* No Agent Selected */}
        {!selectedAgent && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'en' ? 'Select an agent to view and edit their schedule' : 'اختر مندوب لعرض وتعديل جدوله'}</p>
          </div>
        )}
      </div>

      {/* Customer Assignment Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Assign Customers for ' : 'تعيين العملاء ليوم '}
              {selectedDay !== null && getDayLabel(DAYS_OF_WEEK[selectedDay])}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {customers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {language === 'en' 
                  ? 'No customers assigned to this agent' 
                  : 'لا يوجد عملاء مسندين لهذا المندوب'}
              </p>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedCustomers.includes(customer.id) 
                      ? "border-primary bg-primary/10" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => toggleCustomer(customer.id)}
                >
                  <Checkbox 
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={() => toggleCustomer(customer.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{customer.name}</p>
                    {customer.city && (
                      <p className="text-sm text-muted-foreground">{customer.city}</p>
                    )}
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={saveSchedule} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default JourneyPlanning;