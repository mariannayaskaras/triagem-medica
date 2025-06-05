import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';

interface Facility {
  id: number;
  name: string;
  type: 'UBS' | 'UPA' | 'Hospital';
  address: string;
  distance?: string;
  waitTime?: string;
  coordinates?: { lat: number; lng: number };
}

interface MedicalMapProps {
  facilityType: 'UBS' | 'UPA' | 'Hospital';
}

const MedicalMap = ({ facilityType }: MedicalMapProps) => {
  const { coords, loading: locationLoading } = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [center, setCenter] = useState<[number, number]>([-37.0677, -10.9091]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const facilities: Facility[] = [
    {
      id: 1, name: 'UBS Vila Nova', type: 'UBS', address: 'Rua das Flores, 123', waitTime: '~30 min',
      coordinates: { lat: -10.9147, lng: -37.0594 }
    },
    {
      id: 2, name: 'UPA Centro', type: 'UPA', address: 'Av. Principal, 500', waitTime: '~45 min',
      coordinates: { lat: -10.9213, lng: -37.0669 }
    },
    {
      id: 3, name: 'Hospital São Lucas', type: 'Hospital', address: 'Av. Central, 1000', waitTime: '~60 min',
      coordinates: { lat: -10.9081, lng: -37.0733 }
    }
  ];

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredFacilities = useMemo(() => {
    console.log('📌 facilityType recebido:', facilityType);
    console.log('📌 Coordenadas do usuário:', coords);

    if (!coords) {
      const semCoords = facilities.filter(f => f.type === facilityType);
      console.log('⚠️ Sem coordenadas, unidades filtradas:', semCoords);
      return semCoords;
    }

    const resultado = facilities
      .filter(f => f.type === facilityType)
      .map(f => {
        if (!f.coordinates) return f;
        const dist = calculateDistance(coords.lat, coords.lng, f.coordinates.lat, f.coordinates.lng);
        return {
          ...f,
          distance: `${dist.toFixed(1)} km`
        };
      })
      .sort((a, b) => {
        const da = parseFloat(a.distance || '999');
        const db = parseFloat(b.distance || '999');
        return da - db;
      });

    console.log('✅ Unidades filtradas com distância:', resultado);
    return resultado;
  }, [facilityType, coords]);

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
    if (coords) {
      setCenter([coords.lng, coords.lat]);
      mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 13 });
    }
  }, [coords]);

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      const map = mapRef.current;
      document.querySelectorAll('.custom-marker').forEach(el => el.remove());

      if (coords) {
        new maplibregl.Marker({ color: '#3B82F6' })
          .setLngLat([coords.lng, coords.lat])
          .setPopup(new maplibregl.Popup().setText('Sua localização'))
          .addTo(map);
      }

      filteredFacilities.forEach((facility) => {
        if (!facility.coordinates) {
          console.warn(`❌ Unidade "${facility.name}" sem coordenadas`);
          return;
        }

        console.log('📍 Marcador adicionado:', facility.name);

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
          ${facility.distance ? `Distância: ${facility.distance}<br/>` : ''}
          ${facility.waitTime ? `Espera: ${facility.waitTime}` : ''}
        `);

        new maplibregl.Marker(el)
          .setLngLat([facility.coordinates.lng, facility.coordinates.lat])
          .setPopup(popup)
          .addTo(map);
      });
    }
  }, [filteredFacilities, mapLoaded, coords]);

  return (
    <div className="space-y-4">
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
