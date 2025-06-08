import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';
import { useNearbyFacilities } from '@/hooks/useNearbyFacilities';

interface MedicalMapProps {
  facilityType: 'hospital' | 'clinic' | 'doctors';
}

const MedicalMap = ({ facilityType }: MedicalMapProps) => {
  const { coords, loading: locationLoading, error: locationError } = useLocation();
  const {
    facilities,
    loading: facilitiesLoading,
    error: facilitiesError
  } = useNearbyFacilities([facilityType], coords);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!coords || !mapContainer.current) return;

    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [coords.lng, coords.lat],
        zoom: 13,
      });

      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      mapRef.current.on('load', () => {
        facilities.forEach(facility => {
          new maplibregl.Marker()
            .setLngLat([facility.longitude, facility.latitude])
            .setPopup(new maplibregl.Popup().setHTML(
              `<strong>${facility.nome}</strong><br/>${facility.tipo}<br/>${facility.distancia?.toFixed(2)} km`
            ))
            .addTo(mapRef.current!);
        });
      });
    }
  }, [coords, facilities]);

  if (locationLoading || facilitiesLoading) {
    return <div className="p-4 text-center"><Loader className="animate-spin inline-block" /> Carregando mapa...</div>;
  }

  if (locationError || facilitiesError) {
    return <div className="p-4 text-red-500">Erro: {locationError || facilitiesError}</div>;
  }

  return (
    <div className="w-full h-[400px]" ref={mapContainer} />
  );
};

export default MedicalMap;