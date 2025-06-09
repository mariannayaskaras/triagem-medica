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
      console.log("📡 Obtendo cidade via coordenadas...");
      setCoords({ lat, lng: lon });

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=10`
        );
        const data = await response.json();

        if (!data.address) {
          throw new Error("Endereço não encontrado na resposta.");
        }

        let cidade = sanitizeString(
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.county ||
          "Local Desconhecido"
        );

        if (cidade === "São Cristóvão") {
          console.warn("⚠️ Cidade incorreta detectada. Substituindo por 'Aracaju'.");
          cidade = "Aracaju";
        }

        setCity(cidade);
        setError(null);
      } catch (err) {
        console.warn("🌐 Erro ao converter coordenadas para cidade:", err);
        setError("Erro ao converter coordenadas para cidade.");
      } finally {
        setLoading(false);
      }
    };

    const buscarPorIP = async () => {
      console.warn("📍 Usando localização aproximada por IP...");
      try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await response.json();

        setCity(sanitizeString(data.city));
        setCoords(null);
        setError("⚠️ Usando localização aproximada por IP");
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
      console.log("🔍 Tentando obter geolocalização...");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("📍 Coordenadas:", position.coords);
            buscarPorCoordenadas(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.warn("🚫 Geolocalização negada. Usando IP:", err.message);
            buscarPorIP();
          },
          { timeout: 8000, maximumAge: 60000 }
        );
      } else {
        buscarPorIP();
      }
    };

    obterLocalizacao();
  }, []);

  useEffect(() => {
    console.log("🧭 STATUS DE LOCALIZAÇÃO:");
    console.log(" - Coordenadas:", coords);
    console.log(" - Cidade:", city);
    console.log(" - Erro:", error);
    console.log(" - Loading:", loading);
  }, [coords, city, error, loading]);

  return { city, coords, loading, error };
}
