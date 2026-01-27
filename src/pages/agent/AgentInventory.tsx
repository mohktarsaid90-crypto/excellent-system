import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentMobileLayout } from '@/components/agent/AgentMobileLayout';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Package, Search, AlertTriangle, Loader2, Plus, Truck, Send } from 'lucide-react';

interface StockItem {
  product_id: string;
  product_name_ar: string;
  product_name_en: string;
  loaded_quantity: number;
  sold_quantity: number;
  remaining_quantity: number;
}

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  stock_quantity: number;
}

interface LoadRequestItem {
  product_id: string;
  product_name: string;
  requested_quantity: number;
  carry_over: number;
}

const AgentInventory = () => {
  const { agent } = useAgentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [loadRequestItems, setLoadRequestItems] = useState<LoadRequestItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (agent) {
      fetchInventory();
      fetchProducts();
    }
  }, [agent]);

  const fetchInventory = async () => {
    if (!agent) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
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
              name_en
            )
          `)
          .eq('stock_load_id', stockLoads[0].id);

        if (itemsError) throw itemsError;

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
          return {
            product_id: item.product_id,
            product_name_ar: item.products?.name_ar || '',
            product_name_en: item.products?.name_en || '',
            loaded_quantity: loaded,
            sold_quantity: sold,
            remaining_quantity: loaded - sold,
          };
        });

        setStockItems(stockItemsList);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching inventory:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_ar, name_en, stock_quantity')
        .eq('is_active', true)
        .order('name_ar');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching products:', error);
      }
    }
  };

  const openLoadRequestDialog = () => {
    // Initialize with carry-over stock from current inventory
    const items: LoadRequestItem[] = products.map(product => {
      const currentStock = stockItems.find(s => s.product_id === product.id);
      const carryOver = currentStock?.remaining_quantity || 0;
      return {
        product_id: product.id,
        product_name: product.name_ar || product.name_en,
        requested_quantity: 0,
        carry_over: carryOver,
      };
    });
    setLoadRequestItems(items);
    setShowLoadDialog(true);
  };

  const updateRequestQuantity = (productId: string, quantity: number) => {
    setLoadRequestItems(items =>
      items.map(item =>
        item.product_id === productId
          ? { ...item, requested_quantity: Math.max(0, quantity) }
          : item
      )
    );
  };

  const submitLoadRequest = async () => {
    if (!agent) return;

    const itemsToRequest = loadRequestItems.filter(item => item.requested_quantity > 0);
    
    if (itemsToRequest.length === 0) {
      toast({
        title: 'تنبيه',
        description: 'يرجى إضافة كميات للطلب',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create stock load request
      const { data: stockLoad, error: loadError } = await supabase
        .from('stock_loads')
        .insert({
          agent_id: agent.id,
          status: 'requested',
          notes: `طلب تحميل - المتبقي السابق تم احتسابه`,
        })
        .select()
        .single();

      if (loadError) throw loadError;

      // Create stock load items
      const loadItems = itemsToRequest.map(item => ({
        stock_load_id: stockLoad.id,
        product_id: item.product_id,
        requested_quantity: item.requested_quantity,
      }));

      const { error: itemsError } = await supabase
        .from('stock_load_items')
        .insert(loadItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'تم إرسال الطلب',
        description: 'سيتم مراجعة طلب التحميل من قبل المستودع',
      });

      setShowLoadDialog(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error submitting load request:', error);
      }
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال طلب التحميل',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = stockItems.filter(item =>
    item.product_name_ar.includes(searchQuery) ||
    item.product_name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLoaded = stockItems.reduce((sum, item) => sum + item.loaded_quantity, 0);
  const totalSold = stockItems.reduce((sum, item) => sum + item.sold_quantity, 0);
  const totalRemaining = stockItems.reduce((sum, item) => sum + item.remaining_quantity, 0);

  if (isLoading) {
    return (
      <AgentMobileLayout title="مخزني" showBack>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AgentMobileLayout>
    );
  }

  return (
    <AgentMobileLayout title="مخزني" showBack>
      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-blue-600">محمّل</p>
              <p className="text-xl font-bold text-blue-700">{totalLoaded}</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-emerald-600">مباع</p>
              <p className="text-xl font-bold text-emerald-700">{totalSold}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-amber-600">متبقي</p>
              <p className="text-xl font-bold text-amber-700">{totalRemaining}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-14 flex items-center justify-center gap-2"
            onClick={openLoadRequestDialog}
          >
            <Plus className="h-5 w-5" />
            طلب تحميل
          </Button>
          <Button
            variant="outline"
            className="h-14 flex items-center justify-center gap-2"
            onClick={() => navigate('/agent/settlement')}
          >
            <Truck className="h-5 w-5" />
            تفريغ وتسوية
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-12"
          />
        </div>

        {/* Stock List */}
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد بضاعة محملة</p>
              <p className="text-sm">قم بطلب تحميل بضاعة من المستودع</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.product_id} className={item.remaining_quantity <= 0 ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product_name_ar || item.product_name_en}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          محمّل: <span className="font-medium text-foreground">{item.loaded_quantity}</span>
                        </span>
                        <span className="text-muted-foreground">
                          مباع: <span className="font-medium text-emerald-600">{item.sold_quantity}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      {item.remaining_quantity <= 0 ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          نفد
                        </Badge>
                      ) : item.remaining_quantity <= 5 ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          {item.remaining_quantity} متبقي
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          {item.remaining_quantity} متبقي
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Load Request Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              طلب تحميل بضاعة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              أدخل الكميات المطلوبة. سيتم احتساب المتبقي بالسيارة تلقائياً.
            </p>

            {loadRequestItems.map((item) => (
              <div key={item.product_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  {item.carry_over > 0 && (
                    <p className="text-xs text-amber-600">متبقي: {item.carry_over}</p>
                  )}
                </div>
                <Input
                  type="number"
                  min="0"
                  value={item.requested_quantity || ''}
                  onChange={(e) => updateRequestQuantity(item.product_id, parseInt(e.target.value) || 0)}
                  className="w-20 h-10 text-center"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLoadDialog(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              onClick={submitLoadRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <Send className="h-4 w-4 ml-2" />
              )}
              إرسال الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgentMobileLayout>
  );
};

export default AgentInventory;
