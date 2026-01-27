import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, X, Navigation } from 'lucide-react';

// Fix leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Customer {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
}

interface CustomerMapViewProps {
  customers: Customer[];
  onClose: () => void;
  language: 'en' | 'ar';
}

export const CustomerMapView = ({ customers, onClose, language }: CustomerMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter customers with valid coordinates
  const mappableCustomers = customers.filter(
    c => c.location_lat && c.location_lng
  );

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([30.0444, 31.2357], 10); // Default to Cairo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add markers for each customer
    const markers: L.Marker[] = [];
    
    mappableCustomers.forEach(customer => {
      if (customer.location_lat && customer.location_lng) {
        const marker = L.marker([customer.location_lat, customer.location_lng])
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; direction: rtl;">
              <strong>${customer.name}</strong>
              ${customer.city ? `<br/><small>${customer.city}</small>` : ''}
              ${customer.address ? `<br/><small>${customer.address}</small>` : ''}
            </div>
          `);
        
        marker.on('click', () => {
          setSelectedCustomer(customer);
        });
        
        markers.push(marker);
      }
    });

    // Fit bounds if we have markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      map.remove();
    };
  }, [mappableCustomers]);

  const customersWithoutLocation = customers.filter(
    c => !c.location_lat || !c.location_lng
  );

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 z-50 bg-card rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {language === 'en' ? 'Customer Locations' : 'مواقع العملاء'}
            </h2>
            <span className="text-sm text-muted-foreground">
              ({mappableCustomers.length} {language === 'en' ? 'on map' : 'على الخريطة'})
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0" />
          
          {/* Selected Customer Card */}
          {selectedCustomer && (
            <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[1000]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedCustomer.name}</h3>
                    {selectedCustomer.city && (
                      <p className="text-sm text-muted-foreground">{selectedCustomer.city}</p>
                    )}
                    {selectedCustomer.address && (
                      <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Navigation className="h-3 w-3" />
                  <span dir="ltr">
                    {selectedCustomer.location_lat?.toFixed(6)}, {selectedCustomer.location_lng?.toFixed(6)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Missing Locations Warning */}
        {customersWithoutLocation.length > 0 && (
          <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-800 text-sm">
            <strong>{customersWithoutLocation.length}</strong> {language === 'en' 
              ? 'customers without location data' 
              : 'عميل بدون بيانات موقع'}
          </div>
        )}
      </div>
    </div>
  );
};