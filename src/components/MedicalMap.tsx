import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader } from 'lucide-react';
import { Button } from './ui/button';
import { useLocation } from '@/hooks/use-location';

interface Facility {
  id: number;
  name: string;
  type: 'UBS' | 'UPA' | 'Hospital';
  address: string;
  distance: string;
  waitTime?: string;
  coordinates?: { lat: number; lng: number };
}

const MedicalMap = () => {
  const { city, loading: locationLoading } = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [center, setCenter] = useState<[number, number]>([-37.0677, -10.9091]);
  const [filter, setFilter] = useState<'UBS' | 'UPA' | 'Hospital'>('UPA');
  const [mapLoaded, setMapLoaded] = useState(false);

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

  useEffect(() => {
    if (!mapRef.current && mapContainer.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: center,
        zoom: 13,
      });

      mapRef.current.addControl(new maplibregl.NavigationControl());
      mapRef.current.on('load', () => setMapLoaded(true));
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    const fetchCityCoords = async () => {
      if (!city || city === "Local Desconhecido") return;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCenter([lon, lat]);
        mapRef.current?.flyTo({ center: [lon, lat], zoom: 13 });
      }
    };

    fetchCityCoords();
  }, [city]);

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      const map = mapRef.current;

      // Remove todos os marcadores anteriores
      document.querySelectorAll('.custom-marker').forEach(el => el.remove());

      // Adiciona marcadores
      filteredFacilities.forEach((facility) => {
        if (!facility.coordinates) return;

        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.backgroundColor =
          facility.type === 'UBS' ? '#10B981' : facility.type === 'UPA' ? '#F59E0B' : '#EF4444';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <strong>${facility.name}</strong><br/>
          ${facility.address}<br/>
          Distância: ${facility.distance}<br/>
          ${facility.waitTime ? `Espera: ${facility.waitTime}` : ''}
        `);

        new maplibregl.Marker(el)
          .setLngLat([facility.coordinates.lng, facility.coordinates.lat])
          .setPopup(popup)
          .addTo(map);
      });
    }
  }, [filteredFacilities, mapLoaded]);

  return (
    <div className="space-y-4">
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

      <div className="h-64 bg-gray-100 rounded-lg relative overflow-hidden">
        {(!mapLoaded || locationLoading) && (
          <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center z-10">
            <Loader className="h-6 w-6 animate-spin text-triage-blue mb-2" />
            <p className="text-gray-500">Carregando mapa...</p>
          </div>
        )}
        <div ref={mapContainer} className="h-full w-full" />
      </div>
    </div>
  );
};

export default MedicalMap;
