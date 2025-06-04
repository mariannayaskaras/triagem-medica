import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Button } from './ui/button';

interface Facility {
  id: number;
  name: string;
  type: 'UBS' | 'UPA' | 'Hospital';
  address: string;
  distance: string;
  waitTime?: string;
  coordinates?: { lat: number; lng: number };
}

// ✅ Chave de API via variável de ambiente
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: -10.9091,
  lng: -37.0677,
};

const MedicalMap = () => {
  const { city, loading: locationLoading } = useLocation();
  const [mapLoading, setMapLoading] = useState(true);
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [filter, setFilter] = useState<'UBS' | 'UPA' | 'Hospital'>('UPA');

  // Mock de unidades de saúde
  const facilities: Facility[] = [
    {
      id: 1, name: 'UBS Vila Nova', type: 'UBS', address: 'Rua das Flores, 123', distance: '1,2 km', waitTime: '~30 min',
      coordinates: { lat: -10.9147, lng: -37.0594 }
    },
    {
      id: 2, name: 'UPA Centro', type: 'UPA', address: 'Av. Principal, 500', distance: '2,5 km', waitTime: '~45 min',
      coordinates: { lat: -10.9213, lng: -37.0669 }
    },
    {
      id: 3, name: 'Hospital São Lucas', type: 'Hospital', address: 'Av. Central, 1000', distance: '3,8 km', waitTime: '~60 min',
      coordinates: { lat: -10.9081, lng: -37.0733 }
    }
  ];

  const filteredFacilities = facilities.filter(f => f.type === filter);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

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
          console.error('Erro ao geocodificar cidade:', error);
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

  const facilityIcon = (type: 'UBS' | 'UPA' | 'Hospital') => ({
    path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    fillColor: type === 'UBS' ? '#10B981' : type === 'UPA' ? '#F59E0B' : '#EF4444',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: '#FFFFFF',
    scale: 1.5,
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 justify-center mb-2">
        {(['UBS', 'UPA', 'Hospital'] as const).map(tipo => (
          <Button
            key={tipo}
            variant={filter === tipo ? 'default' : 'outline'}
            onClick={() => setFilter(tipo)}
            className="text-sm"
          >
            {tipo}
          </Button>
        ))}
      </div>

      {/* Mapa */}
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

            {filteredFacilities.map((facility) =>
              facility.coordinates && (
                <Marker
                  key={facility.id}
                  position={facility.coordinates}
                  onClick={() => handleMarkerClick(facility)}
                  icon={facilityIcon(facility.type)}
                />
              )
            )}

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
    </div>
  );
};

export default MedicalMap;
