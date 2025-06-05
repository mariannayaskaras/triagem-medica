import { useState, useEffect } from 'react';

export interface LocationData {
  city: string;
  coords: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
}

export function useLocation(): LocationData {
  const [city, setCity] = useState("Local Desconhecido");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sanitizeString = (str: string): string => {
      if (typeof str !== 'string') return "Local Desconhecido";
      return str.replace(/<[^>]*>/g, '').substring(0, 100).trim() || "Local Desconhecido";
    };

    const buscarPorCoordenadas = async (lat: number, lon: number) => {
      try {
        setCoords({ lat, lng: lon });
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        const cidade = sanitizeString(
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          "Local Desconhecido"
        );
        setCity(cidade);
        setError(null);
      } catch (err) {
        console.warn("Erro ao converter coordenadas, usando fallback por IP.");
        buscarPorIP();
      } finally {
        setLoading(false);
      }
    };

    const buscarPorIP = async () => {
      try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await response.json();
        setCity(sanitizeString(data.city || "Local Desconhecido"));
        setCoords(null);
        setError(null);
      } catch (err) {
        console.error('Erro ao obter a localização via IP:', err);
        setCity("Local Desconhecido");
        setCoords(null);
        setError("Falha ao obter localização");
      } finally {
        setLoading(false);
      }
    };

    const obterLocalizacao = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            buscarPorCoordenadas(latitude, longitude);
          },
          () => {
            buscarPorIP(); // fallback
          },
          { timeout: 10000 }
        );
      } else {
        buscarPorIP();
      }
    };

    obterLocalizacao();
  }, []);

  return { city, coords, loading, error };
}
