
import { useState, useEffect } from 'react';

export interface LocationData {
  city: string;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [locationData, setLocationData] = useState<LocationData>({
    city: "Local Desconhecido",
    loading: true,
    error: null
  });

  useEffect(() => {
    async function obterLocalizacao() {
      try {
        setLocationData(prev => ({ ...prev, loading: true }));
        
        // Security: Add timeout and proper error handling
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
        
        // Security: Validate and sanitize response data
        const sanitizeString = (str: string): string => {
          if (typeof str !== 'string') return "Local Desconhecido";
          // Remove any potential HTML/script tags and limit length
          return str.replace(/<[^>]*>/g, '').substring(0, 100).trim() || "Local Desconhecido";
        };
        
        const cidade = sanitizeString(data.city || "Local Desconhecido");
        
        setLocationData({
          city: cidade,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Erro ao obter a localização:', error);
        setLocationData({
          city: "Local Desconhecido",
          loading: false,
          error: "Falha ao obter localização"
        });
      }
    }

    obterLocalizacao();
  }, []);

  return locationData;
}
