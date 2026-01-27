import { useState, useEffect } from 'react';
import { AgentMobileLayout } from '@/components/agent/AgentMobileLayout';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Search, AlertTriangle, Loader2 } from 'lucide-react';

interface StockItem {
  product_id: string;
  product_name_ar: string;
  product_name_en: string;
  loaded_quantity: number;
  sold_quantity: number;
  remaining_quantity: number;
}

const AgentInventory = () => {
  const { agent } = useAgentAuth();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (agent) {
      fetchInventory();
    }
  }, [agent]);

  const fetchInventory = async () => {
    if (!agent) return;

    try {
      // Get today's stock load
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

        // Calculate remaining quantities
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
    </AgentMobileLayout>
  );
};

export default AgentInventory;
