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
      console.log("📡 Buscando cidade por coordenadas:", lat, lon);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=10`
        );

        if (!response.ok) {
          throw new Error(`Erro HTTP ao converter coordenadas: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.address) {
          throw new Error("Endereço não encontrado na resposta da API Nominatim.");
        }

        let cidade = sanitizeString(
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.county ||
          "Local Desconhecido"
        );

        // Tratamento específico para casos conhecidos
        if (cidade === "São Cristóvão") {
          console.warn("⚠️ Corrigindo cidade de 'São Cristóvão' para 'Aracaju'");
          cidade = "Aracaju";
        }

        setCity(cidade);
        setError(null);
      } catch (err: any) {
        console.error("❌ Erro ao buscar cidade por coordenadas:", err.message || err);
        setError("Erro ao converter coordenadas em cidade.");
        setCity("Local Desconhecido");
      } finally {
        setLoading(false);
      }
    };

    const buscarPorIP = async () => {
      console.warn("📍 Tentando obter cidade via IP...");
      try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');

        if (!response.ok) {
          throw new Error(`Erro HTTP ao buscar por IP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        setCity(sanitizeString(data.city));
        setCoords(null);
        setError("⚠️ Usando localização aproximada por IP.");
      } catch (err: any) {
        console.error("❌ Erro ao obter localização via IP:", err.message || err);
        setCity("Local Desconhecido");
        setCoords(null);
        setError("Falha ao obter localização por IP.");
      } finally {
        setLoading(false);
      }
    };

    const obterLocalizacao = () => {
      console.log("🔎 Tentando obter localização do navegador...");

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("✅ Coordenadas obtidas:", position.coords);
            buscarPorCoordenadas(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.warn("⚠️ Geolocalização do navegador falhou:", err.message);
            buscarPorIP();
          },
          { timeout: 8000, maximumAge: 60000 }
        );
      } else {
        console.warn("⚠️ Geolocalização não suportada no navegador. Caindo para IP...");
        buscarPorIP();
      }
    };

    obterLocalizacao();
  }, []);

  useEffect(() => {
    console.log("📍 Status da localização:");
    console.log(" - Cidade:", city);
    console.log(" - Coordenadas:", coords);
    console.log(" - Erro:", error);
    console.log(" - Loading:", loading);
  }, [city, coords, error, loading]);

  return { city, coords, loading, error };
}
