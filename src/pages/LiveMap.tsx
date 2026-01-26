import { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAgents } from '@/hooks/useAgents';
import { MapPin, Users, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

const LiveMap = () => {
  const { language, isRTL, t } = useLanguage();
  const { data: agents, isLoading } = useAgents();
  const mapRef = useRef<any>(null);
  const mapInitialized = useRef(false);

  const onlineAgents = agents?.filter((a) => a.is_online && a.is_active) || [];
  const offlineAgents = agents?.filter((a) => !a.is_online && a.is_active) || [];

  useEffect(() => {
    // Dynamic import for Leaflet to avoid SSR issues
    const initMap = async () => {
      if (mapInitialized.current) return;
      
      const L = await import('leaflet');
      
      const mapContainer = document.getElementById('map');
      if (!mapContainer) return;

      // Clean up existing map
      if (mapRef.current) {
        mapRef.current.remove();
      }

      mapRef.current = L.map('map').setView([24.7136, 46.6753], 10); // Riyadh center
      mapInitialized.current = true;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Custom icon
      const createIcon = (isOnline: boolean) => L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background: ${isOnline ? 'hsl(152, 69%, 40%)' : 'hsl(215, 13%, 50%)'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      // Add markers for agents with locations
      agents?.forEach((agent) => {
        if (agent.last_location_lat && agent.last_location_lng && agent.is_active) {
          const marker = L.marker(
            [Number(agent.last_location_lat), Number(agent.last_location_lng)],
            { icon: createIcon(agent.is_online || false) }
          )
            .addTo(mapRef.current)
            .bindPopup(`
              <div style="text-align: center; direction: ${isRTL ? 'rtl' : 'ltr'};">
                <strong>${agent.name}</strong><br/>
                <span style="color: ${agent.is_online ? 'hsl(152, 69%, 40%)' : 'hsl(215, 13%, 50%)'};">
                  ${agent.is_online ? (language === 'en' ? '● Online' : '● متصل') : (language === 'en' ? '○ Offline' : '○ غير متصل')}
                </span>
              </div>
            `);
        }
      });
    };

    if (agents && !mapInitialized.current) {
      initMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitialized.current = false;
      }
    };
  }, [agents, language, isRTL]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={cn(isRTL && "text-right")}>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            {t('liveMap')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Real-time agent locations and visit status'
              : 'مواقع المندوبين وحالة الزيارات بشكل مباشر'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Agents' : 'إجمالي المندوبين'}
                  </p>
                  <p className="text-2xl font-bold">{agents?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">
                    {t('online')}
                  </p>
                  <p className="text-2xl font-bold text-success">{onlineAgents.length}</p>
                </div>
                <Wifi className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">
                    {t('offline')}
                  </p>
                  <p className="text-2xl font-bold text-muted-foreground">{offlineAgents.length}</p>
                </div>
                <WifiOff className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <MapPin className="h-5 w-5" />
              {language === 'en' ? 'Agent Locations' : 'مواقع المندوبين'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div id="map" className="h-[500px] w-full" />
            )}
          </CardContent>
        </Card>

        {/* Agent List */}
        <Card>
          <CardHeader>
            <CardTitle className={cn(isRTL && "text-right")}>
              {language === 'en' ? 'Agent Status' : 'حالة المندوبين'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agents?.filter((a) => a.is_active).map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border bg-card",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      agent.is_online ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                    )} />
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <Badge variant={agent.is_online ? 'default' : 'secondary'}>
                    {agent.is_online ? t('online') : t('offline')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LiveMap;
