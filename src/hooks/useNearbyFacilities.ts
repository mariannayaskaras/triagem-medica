import { useEffect, useState } from 'react';

export interface Facility {
  id: number;
  nome: string;
  tipo: string;
  latitude: number;
  longitude: number;
  distancia?: number;
}

export function useNearbyFacilities(
  tipos: string[], // ex: ['hospital', 'clinic', 'pharmacy']
  userCoords: { lat: number; lng: number } | null
) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userCoords) return;

    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const query = `
[out:json][timeout:25];
node
  ["amenity"~"${tipos.join('|')}"]
  (around:15000, ${userCoords.lat}, ${userCoords.lng});
out body;
        `.trim();

        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
        });

        const json = await res.json();
        const elements = json.elements || [];

        const parsedFacilities: Facility[] = elements.map((el: any) => ({
          id: el.id,
          nome: el.tags?.name || 'Unidade de Saúde',
          tipo: el.tags?.amenity || 'desconhecido',
          latitude: el.lat,
          longitude: el.lon,
        }));

        setFacilities(parsedFacilities);
      } catch (err) {
        setError('Erro ao buscar unidades próximas.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [userCoords, tipos]);

  return { facilities, loading, error };
}

