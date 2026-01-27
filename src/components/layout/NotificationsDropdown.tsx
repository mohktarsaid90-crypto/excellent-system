import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Package, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'low_stock' | 'new_order' | 'reconciliation' | 'system';
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

export const NotificationsDropdown = () => {
  const { language, isRTL } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch real notifications based on system data
  useEffect(() => {
    const fetchNotifications = async () => {
      const notifs: Notification[] = [];

      // Check for low stock items
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('name_en, name_ar, stock_quantity, min_stock_level')
        .eq('is_active', true)
        .not('stock_quantity', 'is', null)
        .not('min_stock_level', 'is', null);

      const lowStockItems = lowStockProducts?.filter(
        p => (p.stock_quantity || 0) < (p.min_stock_level || 0)
      ) || [];

      if (lowStockItems.length > 0) {
        notifs.push({
          id: 'low-stock',
          type: 'low_stock',
          title: language === 'en' ? 'Low Stock Alert' : 'تنبيه نقص المخزون',
          message: language === 'en' 
            ? `${lowStockItems.length} products below minimum stock level`
            : `${lowStockItems.length} منتجات أقل من الحد الأدنى للمخزون`,
          time: new Date(),
          read: false,
        });
      }

      // Check for pending reconciliations
      const { data: pendingRecons } = await supabase
        .from('reconciliations')
        .select('id')
        .eq('status', 'submitted');

      if (pendingRecons && pendingRecons.length > 0) {
        notifs.push({
          id: 'pending-recons',
          type: 'reconciliation',
          title: language === 'en' ? 'Pending Reconciliations' : 'تسويات معلقة',
          message: language === 'en'
            ? `${pendingRecons.length} reconciliations awaiting approval`
            : `${pendingRecons.length} تسويات بانتظار الموافقة`,
          time: new Date(),
          read: false,
        });
      }

      // Check for pending stock loads
      const { data: pendingLoads } = await supabase
        .from('stock_loads')
        .select('id')
        .eq('status', 'requested');

      if (pendingLoads && pendingLoads.length > 0) {
        notifs.push({
          id: 'pending-loads',
          type: 'new_order',
          title: language === 'en' ? 'Pending Load Requests' : 'طلبات تحميل معلقة',
          message: language === 'en'
            ? `${pendingLoads.length} load requests awaiting approval`
            : `${pendingLoads.length} طلبات تحميل بانتظار الموافقة`,
          time: new Date(),
          read: false,
        });
      }

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    };

    fetchNotifications();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [language]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'new_order':
        return <ShoppingCart className="h-4 w-4 text-primary" />;
      case 'reconciliation':
        return <Package className="h-4 w-4 text-info" />;
      default:
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className={cn(
              "absolute top-1 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center",
              isRTL ? "left-1" : "right-1"
            )}>
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-80">
        <DropdownMenuLabel>
          {language === 'en' ? 'Notifications' : 'الإشعارات'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {language === 'en' ? 'No notifications' : 'لا توجد إشعارات'}
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                !notification.read && "bg-muted/50"
              )}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
