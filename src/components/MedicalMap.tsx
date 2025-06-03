
import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

interface Facility {
  id: number;
  name: string;
  type: 'UBS' | 'UPA' | 'Hospital';
  address: string;
  distance: string;
  waitTime?: string;
  coordinates?: { lat: number; lng: number }; // Updated for Google Maps format
}

interface MedicalMapProps {
  facilityType: 'UBS' | 'UPA' | 'Hospital';
}

// Security: API key should be configured in production environment
// For demo purposes only - replace with proper environment configuration
const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgw8gwBZkQCzrfUAuGPoYtJ8UZT15TUs';

// Validate API key before using
if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.length < 10) {
  console.warn('Google Maps API key not properly configured');
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: -10.9091,  // Default center (Brazil)
  lng: -37.0677
};

const MedicalMap = ({ facilityType }: MedicalMapProps) => {
  const { city, loading: locationLoading } = useLocation();
  const [mapLoading, setMapLoading] = useState(true);
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  
  // Dummy data for demonstration - updated to use Google Maps format
  const facilities: Facility[] = [
    {
      id: 1, 
      name: 'UBS Vila Nova', 
      type: 'UBS', 
      address: 'Rua das Flores, 123', 
      distance: '1,2 km',
      waitTime: '~30 min',
      coordinates: { lat: -10.9147, lng: -37.0594 } // Example coordinates 
    },
    {
      id: 2, 
      name: 'UPA Centro', 
      type: 'UPA', 
      address: 'Av. Principal, 500', 
      distance: '2,5 km',
      waitTime: '~45 min',
      coordinates: { lat: -10.9213, lng: -37.0669 } // Example coordinates
    },
    {
      id: 3, 
      name: 'Hospital São Lucas', 
      type: 'Hospital', 
      address: 'Av. Central, 1000', 
      distance: '3,8 km',
      waitTime: '~60 min',
      coordinates: { lat: -10.9081, lng: -37.0733 } // Example coordinates
    }
  ];

  const filteredFacilities = facilities.filter(f => f.type === facilityType);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  // Handle API loading errors
  if (loadError) {
    console.error('Error loading Google Maps API:', loadError);
  }

  // Get coordinates for the city
  useEffect(() => {
    if (city && city !== "Local Desconhecido") {
      const geocodeCity = async () => {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            setCenter({ lat, lng });
          }
          setMapLoading(false);
        } catch (error) {
          console.error('Error geocoding city:', error);
          setMapLoading(false);
        }
      };

      geocodeCity();
    } else {
      setMapLoading(false);
    }
  }, [city]);

  const onMapLoad = useCallback(() => {
    setMapLoading(false);
  }, []);

  const handleMarkerClick = (facility: Facility) => {
    setSelectedFacility(facility);
  };

  const facilityIcon = (type: 'UBS' | 'UPA' | 'Hospital') => {
    return {
      path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
      fillColor: type === 'UBS' ? '#10B981' : type === 'UPA' ? '#F59E0B' : '#EF4444',
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#FFFFFF',
      scale: 1.5,
    };
  };

  return (
    <div className="space-y-4">
      <div className="h-64 bg-gray-100 rounded-lg relative overflow-hidden">
        {(mapLoading || locationLoading || !isLoaded) && (
          <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center z-10">
            <Loader className="h-6 w-6 animate-spin text-triage-blue mb-2" />
            <p className="text-gray-500">Carregando mapa...</p>
          </div>
        )}
        
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
            }}
          >
            {/* User Location Marker */}
            <Marker
              position={center}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
              title="Sua localização"
            />

            {/* Facility Markers */}
            {filteredFacilities.map((facility) => (
              facility.coordinates && (
                <Marker
                  key={facility.id}
                  position={facility.coordinates}
                  onClick={() => handleMarkerClick(facility)}
                  icon={facilityIcon(facility.type)}
                />
              )
            ))}

            {/* Info Window for selected facility */}
            {selectedFacility && selectedFacility.coordinates && (
              <InfoWindow
                position={selectedFacility.coordinates}
                onCloseClick={() => setSelectedFacility(null)}
              >
                <div className="p-2">
                  <h3 className="font-bold text-sm">{selectedFacility.name}</h3>
                  <p className="text-xs">{selectedFacility.address}</p>
                  <p className="text-xs mt-1">Distância: {selectedFacility.distance}</p>
                  {selectedFacility.waitTime && (
                    <p className="text-xs">Tempo de espera: {selectedFacility.waitTime}</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Unidades próximas{city ? ` a ${city}` : ''}:</h3>
        {filteredFacilities.length > 0 ? (
          <div className="space-y-2">
            {filteredFacilities.map((facility) => (
              <div 
                key={facility.id}
                className="p-3 border border-gray-200 rounded-md flex items-start"
              >
                <MapPin className="text-triage-blue shrink-0 mt-1 mr-2" />
                <div>
                  <h4 className="font-medium">{facility.name}</h4>
                  <p className="text-sm text-gray-600">{facility.address}</p>
                  <div className="flex gap-3 text-sm text-gray-500 mt-1">
                    <span>Distância: {facility.distance}</span>
                    {facility.waitTime && <span>Espera: {facility.waitTime}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma unidade encontrada do tipo {facilityType}</p>
        )}
      </div>
    </div>
  );
};

export default MedicalMap;
