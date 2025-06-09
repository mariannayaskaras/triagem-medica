import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';
import { useNearbyFacilities } from '@/hooks/useNearbyFacilities';

interface MedicalMapProps {
  facilityType: string; // Ex: "UBS", "Hospital"
}

const MedicalMap = ({ facilityType }: MedicalMapProps) => {
  const { coords, loading: locationLoading, error: locationError } = useLocation();

  const {
    facilities,
    loading: facilitiesLoading,
    error: facilitiesError
  } = useNearbyFacilities([facilityType?.toLowerCase() || 'ubs'], coords);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!coords || !mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [coords.lng, coords.lat],
      zoom: 13
    });

    mapRef.current = map;

    // marcador da localização atual
    new maplibregl.Marker({ color: '#007cbf' })
      .setLngLat([coords.lng, coords.lat])
      .setPopup(new maplibregl.Popup().setText('Sua localização'))
      .addTo(map);

    return () => {
      map.remove(); // limpa mapa se o componente for desmontado
      mapRef.current = null;
    };
  }, [coords]);

  useEffect(() => {
    if (!mapRef.current || !facilities?.length) return;

    facilities.forEach(facility => {
      if (facility.longitude && facility.latitude) {
        new maplibregl.Marker()
          .setLngLat([facility.longitude, facility.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setText(
              `${facility.nome} (${facility.tipo})`
            )
          )
          .addTo(mapRef.current!);
      }
    });
  }, [facilities]);

  if (locationLoading || facilitiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (locationError || facilitiesError) {
    return (
      <div className="text-red-500">
        Erro ao carregar o mapa ou unidades próximas. Verifique permissões de localização.
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-96 rounded-md shadow-md" />;
};

export default MedicalMap;
