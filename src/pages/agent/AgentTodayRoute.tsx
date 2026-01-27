import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentMobileLayout } from '@/components/agent/AgentMobileLayout';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Building2, 
  Loader2, 
  CheckCircle,
  Clock,
  Route
} from 'lucide-react';

interface RouteCustomer {
  id: string;
  customer_id: string;
  stop_order: number;
  status: string;
  customer_name: string;
  customer_city: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  customer_lat: number | null;
  customer_lng: number | null;
}

const AgentTodayRoute = () => {
  const { agent } = useAgentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [routeCustomers, setRouteCustomers] = useState<RouteCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (agent) {
      fetchTodayRoute();
    }
  }, [agent]);

  const fetchTodayRoute = async () => {
    if (!agent) return;

    try {
      const today = new Date();
      const dayOfWeek = today.getDay();

      // Get today's journey plan using the weekly_day_ notes pattern
      const { data: plans, error: plansError } = await supabase
        .from('journey_plans')
        .select(`
          id,
          journey_stops (
            id,
            customer_id,
            stop_order,
            status,
            customers (
              id,
              name,
              city,
              address,
              phone,
              location_lat,
              location_lng
            )
          )
        `)
        .eq('agent_id', agent.id)
        .eq('notes', `weekly_day_${dayOfWeek}`);

      if (plansError) throw plansError;

      if (plans && plans.length > 0) {
        const stops = plans[0].journey_stops || [];
        const customers: RouteCustomer[] = stops.map((stop: any) => ({
          id: stop.id,
          customer_id: stop.customer_id,
          stop_order: stop.stop_order,
          status: stop.status || 'pending',
          customer_name: stop.customers?.name || '',
          customer_city: stop.customers?.city,
          customer_address: stop.customers?.address,
          customer_phone: stop.customers?.phone,
          customer_lat: stop.customers?.location_lat,
          customer_lng: stop.customers?.location_lng,
        })).sort((a: RouteCustomer, b: RouteCustomer) => a.stop_order - b.stop_order);

        setRouteCustomers(customers);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching today route:', error);
      }
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل خط السير',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startVisit = (customer: RouteCustomer) => {
    // Navigate to visit page with pre-selected customer
    navigate('/agent/visit', { state: { customerId: customer.customer_id } });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked_out':
        return <Badge className="bg-emerald-100 text-emerald-700">تم الزيارة</Badge>;
      case 'checked_in':
        return <Badge className="bg-blue-100 text-blue-700">جاري الزيارة</Badge>;
      case 'skipped':
        return <Badge className="bg-amber-100 text-amber-700">تم التخطي</Badge>;
      default:
        return <Badge variant="secondary">في الانتظار</Badge>;
    }
  };

  const getDayName = () => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[new Date().getDay()];
  };

  if (isLoading) {
    return (
      <AgentMobileLayout title="خط سير اليوم" showBack>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AgentMobileLayout>
    );
  }

  return (
    <AgentMobileLayout title="خط سير اليوم" showBack>
      <div className="p-4 space-y-4">
        {/* Day Header */}
        <div className="flex items-center justify-between bg-primary/10 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">{getDayName()}</span>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            {routeCustomers.length} عميل
          </Badge>
        </div>

        {/* Route List */}
        {routeCustomers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">لا يوجد خط سير مجدول لليوم</p>
            <p className="text-sm mt-2">تواصل مع مديرك لتحديد خط السير</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routeCustomers.map((customer, index) => (
              <Card 
                key={customer.id}
                className={customer.status === 'checked_out' ? 'opacity-60' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Order Number */}
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${customer.status === 'checked_out' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-primary text-primary-foreground'}
                    `}>
                      {customer.status === 'checked_out' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{customer.customer_name}</h3>
                        {getStatusBadge(customer.status)}
                      </div>
                      
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {customer.customer_city && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            <span>{customer.customer_city}</span>
                          </div>
                        )}
                        {customer.customer_address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{customer.customer_address}</span>
                          </div>
                        )}
                        {customer.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${customer.customer_phone}`} dir="ltr" className="text-primary">
                              {customer.customer_phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Location Indicator */}
                      {customer.customer_lat && customer.customer_lng ? (
                        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                          <Navigation className="h-3 w-3" />
                          <span>موقع GPS متوفر</span>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                          <Navigation className="h-3 w-3" />
                          <span>لا يوجد موقع GPS</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {customer.status !== 'checked_out' && (
                    <Button 
                      className="w-full mt-4"
                      onClick={() => startVisit(customer)}
                    >
                      <MapPin className="h-4 w-4 ml-2" />
                      بدء الزيارة
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AgentMobileLayout>
  );
};

export default AgentTodayRoute;