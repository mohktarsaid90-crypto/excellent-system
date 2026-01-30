import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentMobileLayout } from '@/components/agent/AgentMobileLayout';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, Receipt, Loader2, Search, MapPin, Navigation, Percent, DollarSign } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  unit_price: number;
  vat_rate: number;
  stock_quantity: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface ActiveVisit {
  id: string;
  customer_id: string;
  customer_name: string;
}

type DiscountType = 'percentage' | 'fixed';

const AgentSale = () => {
  const { agent, updateLocation } = useAgentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVisit, setActiveVisit] = useState<ActiveVisit | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);

  useEffect(() => {
    fetchData();
    getCurrentLocation();
    checkActiveVisit();
  }, [agent]);

  const getCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        () => {
          toast({
            title: 'تنبيه',
            description: 'يرجى تفعيل خدمة الموقع للتأكد من موقعك',
            variant: 'destructive',
          });
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const checkActiveVisit = async () => {
    if (!agent) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Find today's active visit (checked in but not checked out)
      const { data: visits, error } = await supabase
        .from('agent_visits')
        .select(`
          id,
          customer_id,
          customers (name)
        `)
        .eq('agent_id', agent.id)
        .eq('visit_date', today)
        .not('check_in_at', 'is', null)
        .is('check_out_at', null)
        .order('check_in_at', { ascending: false })
        .limit(1);

      if (!error && visits && visits.length > 0) {
        const visit = visits[0] as any;
        setActiveVisit({
          id: visit.id,
          customer_id: visit.customer_id,
          customer_name: visit.customers?.name || '',
        });
        setSelectedCustomer(visit.customer_id);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking active visit:', error);
      }
    }
  };

  const fetchData = async () => {
    if (!agent) return;

    try {
      const [customersRes, productsRes] = await Promise.all([
        supabase
          .from('customers')
          .select('id, name')
          .eq('assigned_agent_id', agent.id)
          .order('name'),
        supabase
          .from('products')
          .select('id, name_ar, name_en, unit_price, vat_rate, stock_quantity')
          .eq('is_active', true)
          .order('name_ar'),
      ]);

      if (customersRes.error) throw customersRes.error;
      if (productsRes.error) throw productsRes.error;

      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name_ar.includes(productSearch) ||
    p.name_en.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => 
    sum + (item.product.unit_price * item.quantity), 0
  );

  // Calculate discount amount based on type
  const calculateDiscountAmount = () => {
    if (!agent?.can_give_discounts) return 0;
    if (discountType === 'percentage') {
      const maxPercent = agent?.max_discount_percent || 10;
      const appliedPercent = Math.min(discountValue, maxPercent);
      return (subtotal * appliedPercent) / 100;
    }
    return Math.min(discountValue, subtotal); // Fixed amount can't exceed subtotal
  };

  const discountAmount = calculateDiscountAmount();
  const subtotalAfterDiscount = subtotal - discountAmount;

  const vatAmount = cart.reduce((sum, item) => {
    const itemSubtotal = item.product.unit_price * item.quantity;
    const itemDiscountRatio = subtotal > 0 ? discountAmount / subtotal : 0;
    const itemAfterDiscount = itemSubtotal - (itemSubtotal * itemDiscountRatio);
    return sum + (itemAfterDiscount * (item.product.vat_rate || 0) / 100);
  }, 0);

  const total = subtotalAfterDiscount + vatAmount;

  // Check if discount exceeds max allowed
  const isDiscountExceeded = discountType === 'percentage' && 
    agent?.can_give_discounts && 
    discountValue > (agent?.max_discount_percent || 10);

  const handleSubmit = async () => {
    if (!selectedCustomer || cart.length === 0 || !agent) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار العميل وإضافة منتجات',
        variant: 'destructive',
      });
      return;
    }

    if (!currentLocation) {
      toast({
        title: 'خطأ',
        description: 'يرجى تفعيل الموقع للتحقق من موقعك',
        variant: 'destructive',
      });
      getCurrentLocation();
      return;
    }

    if (isDiscountExceeded) {
      toast({
        title: 'خطأ',
        description: `الحد الأقصى للخصم هو ${agent.max_discount_percent}%`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update agent location
      await updateLocation(currentLocation.lat, currentLocation.lng);

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice with GPS coordinates and discount
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          agent_id: agent.id,
          customer_id: selectedCustomer,
          subtotal: subtotal,
          discount_amount: discountAmount,
          vat_amount: vatAmount,
          total_amount: total,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cash' ? 'paid' : 'pending',
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const items = cart.map(item => {
        const itemSubtotal = item.product.unit_price * item.quantity;
        const itemDiscountRatio = subtotal > 0 ? discountAmount / subtotal : 0;
        const itemAfterDiscount = itemSubtotal - (itemSubtotal * itemDiscountRatio);
        return {
          invoice_id: invoice.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.unit_price,
          discount_percent: discountType === 'percentage' ? discountValue : 0,
          vat_amount: itemAfterDiscount * (item.product.vat_rate || 0) / 100,
          line_total: itemSubtotal,
        };
      });

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // If there's an active visit, link the invoice and update outcome
      if (activeVisit) {
        await supabase
          .from('agent_visits')
          .update({ 
            invoice_id: invoice.id,
            outcome: 'sale',
            check_out_at: new Date().toISOString(),
            location_lat: currentLocation.lat,
            location_lng: currentLocation.lng,
          })
          .eq('id', activeVisit.id);
      } else {
        // Create a new visit record for this sale
        await supabase
          .from('agent_visits')
          .insert({
            agent_id: agent.id,
            customer_id: selectedCustomer,
            visit_type: 'unscheduled',
            check_in_at: new Date().toISOString(),
            check_out_at: new Date().toISOString(),
            location_lat: currentLocation.lat,
            location_lng: currentLocation.lng,
            invoice_id: invoice.id,
            outcome: 'sale',
          });
      }

      toast({
        title: 'تم إنشاء الفاتورة',
        description: `رقم الفاتورة: ${invoiceNumber}`,
      });

      navigate('/agent');
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء الفاتورة',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <AgentMobileLayout title="فاتورة بيع" showBack>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AgentMobileLayout>
    );
  }

  return (
    <AgentMobileLayout title="فاتورة بيع" showBack>
      <div className="p-4 space-y-4 pb-40">
        {/* Location Status */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${currentLocation ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {isLocating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Navigation className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">
            {isLocating ? 'جاري تحديد الموقع...' : currentLocation ? 'تم تحديد موقعك' : 'الموقع غير متاح'}
          </span>
          {!currentLocation && !isLocating && (
            <Button variant="ghost" size="sm" onClick={getCurrentLocation}>
              إعادة المحاولة
            </Button>
          )}
        </div>

        {/* Active Visit Banner */}
        {activeVisit && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">
              زيارة نشطة: {activeVisit.customer_name}
            </span>
          </div>
        )}

        {/* Customer Selection */}
        <div className="space-y-2">
          <Label>اختر العميل</Label>
          <Select 
            value={selectedCustomer} 
            onValueChange={setSelectedCustomer}
            disabled={!!activeVisit}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="اختر العميل" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeVisit && (
            <p className="text-xs text-muted-foreground">العميل مرتبط بالزيارة النشطة</p>
          )}
        </div>

        {/* Product Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منتج..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="pr-10 h-12"
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-2">
          {filteredProducts.slice(0, 8).map((product) => (
            <Card 
              key={product.id}
              className="cursor-pointer hover:border-primary transition-colors active:scale-[0.98]"
              onClick={() => addToCart(product)}
            >
              <CardContent className="p-3">
                <p className="font-medium text-sm line-clamp-2">{product.name_ar || product.name_en}</p>
                <p className="text-primary font-bold mt-1">{product.unit_price.toFixed(2)} ج.م</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              السلة ({cart.length})
            </h3>
            
            {cart.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name_ar || item.product.name_en}</p>
                    <p className="text-muted-foreground text-sm">
                      {item.product.unit_price.toFixed(2)} × {item.quantity} = {(item.product.unit_price * item.quantity).toFixed(2)} ج.م
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>طريقة الدفع</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">نقدي</SelectItem>
              <SelectItem value="credit">آجل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discount Section - Only if agent has permission */}
        {agent?.can_give_discounts && cart.length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-warning" />
                <Label className="font-bold">الخصم</Label>
                <span className="text-xs text-muted-foreground mr-auto">
                  (الحد الأقصى: {agent.max_discount_percent}%)
                </span>
              </div>
              
              {/* Discount Type Toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={discountType === 'percentage' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setDiscountType('percentage');
                    setDiscountValue(0);
                  }}
                >
                  <Percent className="h-4 w-4 ml-1" />
                  نسبة مئوية
                </Button>
                <Button
                  type="button"
                  variant={discountType === 'fixed' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setDiscountType('fixed');
                    setDiscountValue(0);
                  }}
                >
                  <DollarSign className="h-4 w-4 ml-1" />
                  مبلغ ثابت
                </Button>
              </div>

              {/* Discount Value Input */}
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? agent.max_discount_percent : subtotal}
                  step={discountType === 'percentage' ? 1 : 0.01}
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === 'percentage' ? 'أدخل النسبة' : 'أدخل المبلغ'}
                  className="h-12 pr-12"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {discountType === 'percentage' ? '%' : 'ج.م'}
                </span>
              </div>

              {/* Warning if exceeded */}
              {isDiscountExceeded && (
                <p className="text-destructive text-xs font-medium">
                  تجاوزت الحد الأقصى للخصم ({agent.max_discount_percent}%)
                </p>
              )}

              {/* Preview discount amount */}
              {discountAmount > 0 && (
                <p className="text-sm text-warning font-medium">
                  قيمة الخصم: {discountAmount.toFixed(2)} ج.م
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 space-y-2 shadow-2xl">
          <div className="flex justify-between text-sm">
            <span>المجموع الفرعي</span>
            <span>{subtotal.toFixed(2)} ج.م</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-warning">
              <span>الخصم</span>
              <span>-{discountAmount.toFixed(2)} ج.م</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>ضريبة القيمة المضافة</span>
            <span>{vatAmount.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>الإجمالي النهائي</span>
            <span className="text-primary">{total.toFixed(2)} ج.م</span>
          </div>
          <Button
            className="w-full h-14 text-lg"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCustomer || !currentLocation || isDiscountExceeded}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Receipt className="ml-2 h-5 w-5" />
                إنشاء الفاتورة
              </>
            )}
          </Button>
        </div>
      )}
    </AgentMobileLayout>
  );
};

export default AgentSale;
