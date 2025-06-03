import { useState, useEffect } from 'react';

export interface LocationData {
  city: string;
  loading: boolean;
  error: string | null;
}

export function useLocation(): LocationData {
  const [city, setCity] = useState("Local Desconhecido");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obterLocalizacao = async () => {
      try {
        setLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch('https://get.geojs.io/v1/ip/geo.json', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const sanitizeString = (str: string): string => {
          if (typeof str !== 'string') return "Local Desconhecido";
          return str.replace(/<[^>]*>/g, '').substring(0, 100).trim() || "Local Desconhecido";
        };

        const cidade = sanitizeString(data.city || "Local Desconhecido");
        setCity(cidade);
        setError(null);
      } catch (err) {
        console.error('Erro ao obter a localização:', err);
        setCity("Local Desconhecido");
        setError("Falha ao obter localização");
      } finally {
        setLoading(false);
      }
    };

    obterLocalizacao();
  }, []);

  return { city, loading, error };
}
