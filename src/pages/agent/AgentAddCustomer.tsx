import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentMobileLayout } from '@/components/agent/AgentMobileLayout';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Navigation, 
  User, 
  Phone, 
  Building2, 
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const AgentAddCustomer = () => {
  const { agent } = useAgentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captureLocation = () => {
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
          toast({
            title: 'تم التقاط الموقع',
            description: 'تم حفظ إحداثيات GPS بنجاح',
          });
        },
        (error) => {
          setIsLocating(false);
          toast({
            title: 'خطأ في الموقع',
            description: 'تأكد من تفعيل خدمة الموقع',
            variant: 'destructive',
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setIsLocating(false);
      toast({
        title: 'غير مدعوم',
        description: 'خدمة GPS غير متوفرة على هذا الجهاز',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم العميل',
        variant: 'destructive',
      });
      return;
    }

    if (!agent) return;

    // Check if agent has permission to add clients
    if (!agent.can_add_clients) {
      toast({
        title: 'غير مصرح',
        description: 'ليس لديك صلاحية إضافة عملاء جدد',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('customers')
        .insert({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
          assigned_agent_id: agent.id,
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
          classification: 'retail',
          credit_limit: 0,
          current_balance: 0,
        });

      if (error) throw error;

      toast({
        title: 'تم إضافة العميل',
        description: 'تمت إضافة العميل بنجاح',
      });

      navigate('/agent');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error adding customer:', error);
      }
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة العميل',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AgentMobileLayout title="إضافة عميل جديد" showBack>
      <div className="p-4 space-y-4">
        {/* Permission Check */}
        {agent && !agent.can_add_clients && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                ليس لديك صلاحية إضافة عملاء جدد. تواصل مع مديرك.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              اسم العميل *
            </Label>
            <Input
              placeholder="أدخل اسم العميل"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              رقم الهاتف
            </Label>
            <Input
              type="tel"
              placeholder="أدخل رقم الهاتف"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12"
              dir="ltr"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              المدينة
            </Label>
            <Input
              placeholder="أدخل المدينة"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="h-12"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              العنوان
            </Label>
            <Input
              placeholder="أدخل العنوان التفصيلي"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="h-12"
            />
          </div>

          {/* GPS Location */}
          <Card className={location ? 'border-emerald-200 bg-emerald-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    الموقع الجغرافي
                  </h3>
                  {location ? (
                    <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      تم التقاط الموقع
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      اضغط لالتقاط موقع العميل
                    </p>
                  )}
                </div>
                <Button
                  variant={location ? "outline" : "default"}
                  onClick={captureLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <MapPin className="h-4 w-4 ml-2" />
                  )}
                  {location ? 'تحديث' : 'التقاط الموقع'}
                </Button>
              </div>
              
              {location && (
                <div className="mt-3 p-2 bg-white rounded text-xs text-muted-foreground" dir="ltr">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full h-14 text-lg mt-6"
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.name.trim() || (agent && !agent.can_add_clients)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin ml-2" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 ml-2" />
              إضافة العميل
            </>
          )}
        </Button>
      </div>
    </AgentMobileLayout>
  );
};

export default AgentAddCustomer;