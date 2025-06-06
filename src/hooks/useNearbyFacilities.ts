import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface Facility {
  id: string;
  nome: string;
  tipo: 'UBS' | 'UPA' | 'Hospital';
  endereco: string;
  cidade?: string;
  latitude: number;
  longitude: number;
  tempo_espera?: string;
  distancia?: number;
}

export function useNearbyFacilities(
  tipo: 'UBS' | 'UPA' | 'Hospital',
  userCoords: { lat: number; lng: number } | null
) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userCoords) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('unidades_saude')
          .select('*')
          .eq('tipo', tipo);

        if (error) throw error;

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

        const withDistance = (data || []).map((f) => ({
          ...f,
          distancia: calcDist(userCoords.lat, userCoords.lng, f.latitude, f.longitude),
        }));

        setFacilities(withDistance.sort((a, b) => a.distancia! - b.distancia!));
        setError(null);
      } catch (err) {
        setError('Erro ao buscar unidades.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipo, userCoords]);

  return { facilities, loading, error };
}
