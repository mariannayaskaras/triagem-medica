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
      return typeof str === 'string'
        ? str.replace(/<[^>]*>/g, '').substring(0, 100).trim() || "Local Desconhecido"
        : "Local Desconhecido";
    };

    const buscarPorCoordenadas = async (lat: number, lon: number) => {
      setCoords({ lat, lng: lon });
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        const cidade = sanitizeString(data.address?.city || data.address?.town || data.address?.village);
        setCity(cidade);
        setError(null);
      } catch (err) {
        console.warn("🌐 Erro ao converter coordenadas para cidade. Usando IP como fallback.");
        buscarPorIP();
      } finally {
        setLoading(false);
      }
    };

    const buscarPorIP = async () => {
      try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await response.json();
        setCity(sanitizeString(data.city));
        setCoords(null);
        setError("⚠️ Usando localização aproximada por IP");
        if (import.meta.env.DEV) console.warn("⚠️ Fallback ativado: localização por IP (menos precisa)");
      } catch (err) {
        console.error('❌ Falha ao obter localização por IP:', err);
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
            buscarPorCoordenadas(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.warn("🚫 Geolocalização negada. Usando IP como fallback:", err.message);
            buscarPorIP();
          },
          { timeout: 8000 }
        );
      } else {
        buscarPorIP();
      }
    };

    obterLocalizacao();
  }, []);

  return { city, coords, loading, error };
}
