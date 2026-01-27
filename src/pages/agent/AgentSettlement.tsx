import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentMobileLayout } from '@/components/agent/AgentMobileLayout';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Truck, 
  Package, 
  ArrowDown, 
  ArrowRight, 
  CheckCircle, 
  Loader2,
  Calculator,
  AlertTriangle
} from 'lucide-react';

interface StockItem {
  product_id: string;
  product_name_ar: string;
  product_name_en: string;
  loaded_quantity: number;
  sold_quantity: number;
  remaining_quantity: number;
  unit_price: number;
  unload_quantity: number;
  keep_quantity: number;
}

const AgentSettlement = () => {
  const { agent } = useAgentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [cashCollected, setCashCollected] = useState<string>('0');

  useEffect(() => {
    if (agent) {
      fetchInventory();
    }
  }, [agent]);

  const fetchInventory = async () => {
    if (!agent) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get latest released stock load
      const { data: stockLoads, error: loadError } = await supabase
        .from('stock_loads')
        .select('id')
        .eq('agent_id', agent.id)
        .eq('status', 'released')
        .order('released_at', { ascending: false })
        .limit(1);

      if (loadError) throw loadError;

      if (stockLoads && stockLoads.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('stock_load_items')
          .select(`
            product_id,
            approved_quantity,
            released_quantity,
            products (
              name_ar,
              name_en,
              unit_price
            )
          `)
          .eq('stock_load_id', stockLoads[0].id);

        if (itemsError) throw itemsError;

        // Get sales for today
        const { data: salesData, error: salesError } = await supabase
          .from('invoice_items')
          .select(`
            product_id,
            quantity,
            invoices!inner (
              agent_id,
              created_at
            )
          `)
          .eq('invoices.agent_id', agent.id)
          .gte('invoices.created_at', today);

        const salesByProduct: Record<string, number> = {};
        if (salesData) {
          salesData.forEach((sale: any) => {
            salesByProduct[sale.product_id] = (salesByProduct[sale.product_id] || 0) + sale.quantity;
          });
        }

        const stockItemsList: StockItem[] = (items || []).map((item: any) => {
          const loaded = item.released_quantity || item.approved_quantity || 0;
          const sold = salesByProduct[item.product_id] || 0;
          const remaining = loaded - sold;
          return {
            product_id: item.product_id,
            product_name_ar: item.products?.name_ar || '',
            product_name_en: item.products?.name_en || '',
            loaded_quantity: loaded,
            sold_quantity: sold,
            remaining_quantity: remaining,
            unit_price: item.products?.unit_price || 0,
            unload_quantity: 0,
            keep_quantity: remaining, // Default to keeping all remaining
          };
        });

        setStockItems(stockItemsList);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching inventory:', error);
      }
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات المخزون',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantities = (productId: string, unloadQty: number) => {
    setStockItems(items =>
      items.map(item => {
        if (item.product_id === productId) {
          const maxUnload = item.remaining_quantity;
          const validUnload = Math.min(Math.max(0, unloadQty), maxUnload);
          return {
            ...item,
            unload_quantity: validUnload,
            keep_quantity: item.remaining_quantity - validUnload,
          };
        }
        return item;
      })
    );
  };

  const totalLoaded = stockItems.reduce((sum, item) => sum + item.loaded_quantity, 0);
  const totalSold = stockItems.reduce((sum, item) => sum + item.sold_quantity, 0);
  const totalUnloading = stockItems.reduce((sum, item) => sum + item.unload_quantity, 0);
  const totalKeeping = stockItems.reduce((sum, item) => sum + item.keep_quantity, 0);
  const expectedCash = stockItems.reduce((sum, item) => sum + (item.sold_quantity * item.unit_price), 0);
  const variance = parseFloat(cashCollected || '0') - expectedCash;

  const handleSubmit = async () => {
    if (!agent) return;

    setIsSubmitting(true);

    try {
      // Create reconciliation record
      const { data: reconciliation, error: recError } = await supabase
        .from('reconciliations')
        .insert({
          agent_id: agent.id,
          date: new Date().toISOString().split('T')[0],
          total_loaded: totalLoaded,
          total_sold: totalSold,
          total_returned: totalUnloading,
          cash_collected: parseFloat(cashCollected || '0'),
          expected_cash: expectedCash,
          variance: variance,
          notes: notes || null,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (recError) throw recError;

      // Create reconciliation items
      const recItems = stockItems.map(item => ({
        reconciliation_id: reconciliation.id,
        product_id: item.product_id,
        loaded_quantity: item.loaded_quantity,
        sold_quantity: item.sold_quantity,
        returned_quantity: item.unload_quantity,
        remaining_quantity: item.keep_quantity,
        unit_price: item.unit_price,
        total_value: item.sold_quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from('reconciliation_items')
        .insert(recItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'تم إرسال التسوية',
        description: 'تم إرسال تقرير نهاية اليوم للمراجعة',
      });

      navigate('/agent');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error submitting settlement:', error);
      }
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال التسوية',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AgentMobileLayout title="تفريغ وتسوية" showBack>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AgentMobileLayout>
    );
  }

  return (
    <AgentMobileLayout title="تفريغ وتسوية" showBack>
      <div className="p-4 space-y-4 pb-48">
        {/* Summary Header */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-blue-600">إجمالي محمّل</p>
              <p className="text-xl font-bold text-blue-700">{totalLoaded}</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-emerald-600">إجمالي مباع</p>
              <p className="text-xl font-bold text-emerald-700">{totalSold}</p>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Formula Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-medium">محمّل</span>
              <span className="text-muted-foreground">-</span>
              <span className="font-medium">مباع</span>
              <span className="text-muted-foreground">-</span>
              <span className="font-medium">تفريغ</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-bold text-primary">متبقي بالسيارة</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg font-bold mt-2">
              <span>{totalLoaded}</span>
              <span>-</span>
              <span>{totalSold}</span>
              <span>-</span>
              <span className="text-amber-600">{totalUnloading}</span>
              <span>=</span>
              <span className="text-primary">{totalKeeping}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stock Items List */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            تفاصيل البضاعة
          </h3>

          {stockItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد بضاعة محملة</p>
              </CardContent>
            </Card>
          ) : (
            stockItems.map((item) => (
              <Card key={item.product_id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{item.product_name_ar || item.product_name_en}</h4>
                    <span className="text-sm text-muted-foreground">
                      متبقي: <span className="font-bold text-foreground">{item.remaining_quantity}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-blue-600">محمّل</p>
                      <p className="font-bold text-blue-700">{item.loaded_quantity}</p>
                    </div>
                    <div className="bg-emerald-50 rounded p-2">
                      <p className="text-emerald-600">مباع</p>
                      <p className="font-bold text-emerald-700">{item.sold_quantity}</p>
                    </div>
                    <div className="bg-amber-50 rounded p-2">
                      <p className="text-amber-600">متبقي</p>
                      <p className="font-bold text-amber-700">{item.remaining_quantity}</p>
                    </div>
                  </div>

                  {item.remaining_quantity > 0 && (
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <div className="flex-1">
                        <Label className="text-xs">تفريغ للمستودع</Label>
                        <Input
                          type="number"
                          min="0"
                          max={item.remaining_quantity}
                          value={item.unload_quantity}
                          onChange={(e) => updateItemQuantities(item.product_id, parseInt(e.target.value) || 0)}
                          className="h-10 mt-1"
                        />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground mt-5" />
                      <div className="flex-1">
                        <Label className="text-xs">يبقى بالسيارة</Label>
                        <div className="h-10 mt-1 flex items-center justify-center bg-primary/10 rounded-md font-bold text-primary">
                          {item.keep_quantity}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Cash Collection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              تسوية النقدية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">المبيعات المتوقعة:</span>
              <span className="font-bold">{expectedCash.toLocaleString()} ج.م</span>
            </div>
            
            <div>
              <Label>النقدية المحصّلة</Label>
              <Input
                type="number"
                value={cashCollected}
                onChange={(e) => setCashCollected(e.target.value)}
                className="h-12 text-lg font-bold"
                placeholder="0"
              />
            </div>

            {variance !== 0 && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${variance < 0 ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 text-emerald-700'}`}>
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  الفرق: {Math.abs(variance).toLocaleString()} ج.م {variance < 0 ? '(عجز)' : '(زيادة)'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <div>
          <Label>ملاحظات</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أي ملاحظات إضافية..."
            className="mt-1"
          />
        </div>
      </div>

      {/* Fixed Bottom Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 space-y-3 shadow-2xl">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">تفريغ للمستودع:</span>
            <span className="font-bold mr-2">{totalUnloading}</span>
          </div>
          <div>
            <span className="text-muted-foreground">متبقي بالسيارة:</span>
            <span className="font-bold text-primary mr-2">{totalKeeping}</span>
          </div>
        </div>
        <Button
          className="w-full h-14 text-lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <CheckCircle className="ml-2 h-5 w-5" />
              إرسال التسوية
            </>
          )}
        </Button>
      </div>
    </AgentMobileLayout>
  );
};

export default AgentSettlement;