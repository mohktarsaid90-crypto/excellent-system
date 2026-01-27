import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentMobileLayout } from '@/components/agent/AgentMobileLayout';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Search, Navigation, CheckCircle, Phone, Building2, Loader2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  location_lat: number | null;
  location_lng: number | null;
}

const AgentVisit = () => {
  const { agent, updateLocation } = useAgentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
    getCurrentLocation();
  }, [agent]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery) ||
        c.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    if (!agent) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, address, city, location_lat, location_lng')
        .eq('assigned_agent_id', agent.id)
        .order('name');
      
      if (error) throw error;
      setCustomers(data || []);
      setFilteredCustomers(data || []);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل قائمة العملاء',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast({
            title: 'تنبيه',
            description: 'يرجى تفعيل خدمة الموقع للتسجيل',
            variant: 'destructive',
          });
        }
      );
    }
  };

  const handleCheckIn = async () => {
    if (!selectedCustomer || !agent || !currentLocation) {
      toast({
        title: 'خطأ',
        description: 'يرجى تحديد العميل وتفعيل الموقع',
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingIn(true);

    try {
      // Update agent location
      await updateLocation(currentLocation.lat, currentLocation.lng);

      // Create visit record
      const { error } = await supabase
        .from('agent_visits')
        .insert({
          agent_id: agent.id,
          customer_id: selectedCustomer.id,
          visit_type: 'scheduled',
          check_in_at: new Date().toISOString(),
          location_lat: currentLocation.lat,
          location_lng: currentLocation.lng,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: 'تم التسجيل بنجاح',
        description: `تم تسجيل الوصول إلى ${selectedCustomer.name}`,
      });

      navigate('/agent');
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تسجيل الزيارة',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <AgentMobileLayout title="زيارة جديدة" showBack>
      <div className="p-4 space-y-4">
        {/* Location Status */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${currentLocation ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          <Navigation className="h-5 w-5" />
          <span className="text-sm font-medium">
            {currentLocation ? 'تم تحديد موقعك' : 'جاري تحديد الموقع...'}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن عميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-12"
          />
        </div>

        {/* Customer List or Selected Customer */}
        {selectedCustomer ? (
          <div className="space-y-4">
            <Card className="border-primary border-2">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedCustomer.name}</h3>
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="h-4 w-4" />
                        <span dir="ltr">{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedCustomer.address}</span>
                      </div>
                    )}
                  </div>
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Textarea
              placeholder="ملاحظات الزيارة (اختياري)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-14"
                onClick={() => setSelectedCustomer(null)}
              >
                تغيير العميل
              </Button>
              <Button
                className="flex-1 h-14 text-lg"
                onClick={handleCheckIn}
                disabled={isCheckingIn || !currentLocation}
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <MapPin className="ml-2 h-5 w-5" />
                    تسجيل الوصول
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد عملاء</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <Card 
                  key={customer.id}
                  className="cursor-pointer hover:border-primary transition-colors active:scale-[0.98]"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{customer.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {customer.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.city}
                        </span>
                      )}
                      {customer.phone && (
                        <span className="flex items-center gap-1" dir="ltr">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </AgentMobileLayout>
  );
};

export default AgentVisit;
