
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
out center;
        `.trim();

        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
        });

        const json = await res.json();
        console.log("📦 Resposta da Overpass API:", json);

        const toRad = (value: number) => (value * Math.PI) / 180;
        const calcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371;
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a = Math.sin(dLat / 2) ** 2 +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                    Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        const parsed: Facility[] = (json.elements || []).map((e: any) => ({
          id: e.id,
          nome: e.tags?.name || e.tags?.amenity || 'Unidade de Saúde',
          tipo: e.tags?.amenity || 'desconhecido',
          latitude: e.lat,
          longitude: e.lon,
          distancia: calcDist(userCoords.lat, userCoords.lng, e.lat, e.lon),
        }));

        const ordenadas = parsed.sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0)).slice(0, 10);
        console.log("📍 Facilities recebidas:", ordenadas);
        setFacilities(ordenadas);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Erro ao buscar unidades via OpenStreetMap.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [tipos, userCoords]);

  return { facilities, loading, error };
}