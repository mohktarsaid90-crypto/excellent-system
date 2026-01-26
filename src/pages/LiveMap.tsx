import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAgents } from '@/hooks/useAgents';
import { MapPin, Users, Wifi, WifiOff, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const LiveMap = () => {
  const { language } = useLanguage();
  const { data: agents, isLoading } = useAgents();

  const onlineAgents = agents?.filter((a) => a.is_online && a.is_active) || [];
  const offlineAgents = agents?.filter((a) => !a.is_online && a.is_active) || [];

  useEffect(() => {
    // Dynamic import for Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = await import('leaflet');
      
      const mapContainer = document.getElementById('map');
      if (!mapContainer || (mapContainer as any)._leaflet_id) return;

      const map = L.map('map').setView([24.7136, 46.6753], 10); // Riyadh center

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Add markers for agents with locations
      agents?.forEach((agent) => {
        if (agent.last_location_lat && agent.last_location_lng && agent.is_active) {
          const marker = L.marker([Number(agent.last_location_lat), Number(agent.last_location_lng)])
            .addTo(map)
            .bindPopup(`
              <div style="text-align: center;">
                <strong>${agent.name}</strong><br/>
                <span style="color: ${agent.is_online ? 'green' : 'gray'};">
                  ${agent.is_online ? '● Online' : '○ Offline'}
                </span>
              </div>
            `);
        }
      });
    };

    if (agents) {
      initMap();
    }
  }, [agents]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            {language === 'en' ? 'Live Tracking Map' : 'خريطة التتبع المباشر'}
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
              <div className="flex items-center justify-between">
                <div>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Online Now' : 'متصل الآن'}
                  </p>
                  <p className="text-2xl font-bold text-success">{onlineAgents.length}</p>
                </div>
                <Wifi className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Offline' : 'غير متصل'}
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
            <CardTitle className="flex items-center gap-2">
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
            <CardTitle>{language === 'en' ? 'Agent Status' : 'حالة المندوبين'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agents?.filter((a) => a.is_active).map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${agent.is_online ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <Badge variant={agent.is_online ? 'default' : 'secondary'}>
                    {agent.is_online
                      ? (language === 'en' ? 'Online' : 'متصل')
                      : (language === 'en' ? 'Offline' : 'غير متصل')}
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
