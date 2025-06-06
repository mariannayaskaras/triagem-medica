import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';
import { useNearbyFacilities } from '@/hooks/useNearbyFacilities';

interface MedicalMapProps {
  facilityType: 'UBS' | 'UPA' | 'Hospital';
}

const MedicalMap = ({ facilityType }: MedicalMapProps) => {
  const { coords, loading: locationLoading, error: locationError } = useLocation();
  const {
    facilities,
    loading: facilitiesLoading,
    error: facilitiesError
  } = useNearbyFacilities(facilityType, coords);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Inicializa o mapa
  useEffect(() => {
    if (!mapRef.current && mapContainer.current && coords) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [coords.lng, coords.lat],
        zoom: 13,
      });

      mapRef.current.addControl(new maplibregl.NavigationControl());
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [coords]);

  // Marca localização do usuário e unidades
  useEffect(() => {
    if (!mapRef.current || !coords) return;

    const map = mapRef.current;
    document.querySelectorAll('.custom-marker').forEach(el => el.remove());

    // 📍 Localização do usuário
    new maplibregl.Marker({ color: '#3B82F6' })
      .setLngLat([coords.lng, coords.lat])
      .setPopup(new maplibregl.Popup().setText('Sua localização'))
      .addTo(map);

    // 🏥 Unidades filtradas
    facilities.forEach(f => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.backgroundColor =
        f.tipo === 'UBS' ? '#10B981' : f.tipo === 'UPA' ? '#F59E0B' : '#EF4444';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <strong>${f.nome}</strong><br/>
        ${f.endereco}<br/>
        Distância: ${f.distancia?.toFixed(1)} km<br/>
        Espera: ${f.tempo_espera || 'N/A'}
      `);

      new maplibregl.Marker(el)
        .setLngLat([f.longitude, f.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    // 🗺️ Ajuste de visualização
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([coords.lng, coords.lat]);
    facilities.forEach(f => bounds.extend([f.longitude, f.latitude]));
    map.fitBounds(bounds, { padding: 60 });
  }, [facilities, coords]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:gap-6">
        {/* Mapa */}
        <div className="md:w-1/2">
          <div className="h-64 sm:h-80 md:h-96 bg-gray-100 rounded-lg relative overflow-hidden">
            {(locationLoading || facilitiesLoading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span>Carregando...</span>
              </div>
            )}
            <div ref={mapContainer} className="h-full w-full" />
          </div>
        </div>

        {/* Lista de unidades */}
        <div className="mt-6 md:mt-0 md:w-1/2">
          <h4 className="text-md font-semibold mb-2">Unidades listadas:</h4>
          <ul className="space-y-2 text-sm">
            {facilities.map(f => (
              <li key={f.id} className="p-3 rounded border bg-white shadow-sm">
                <p className="font-medium">{f.nome}</p>
                <p>{f.endereco}</p>
                <p>Distância: {f.distancia?.toFixed(1)} km</p>
                {f.tempo_espera && <p>Espera: {f.tempo_espera}</p>}
              </li>
            ))}
            {facilities.length === 0 && (
              <li className="text-gray-500">Nenhuma unidade encontrada para esse tipo.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MedicalMap;
