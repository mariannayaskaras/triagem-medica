import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface Place {
  title: string;
  address: string;
  gps_coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface MedicalMapProps {
  city: string;
  coords: { lat: number; lng: number } | null;
  facilityType?: 'ubs' | 'upa' | 'hospital';
}

// Função para calcular a distância entre dois pontos (Haversine)
function getDistance(lat1, lng1, lat2, lng2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const MedicalMap: React.FC<MedicalMapProps> = ({ city, coords, facilityType }) => {
  const [places, setPlaces] = useState<Place[]>([]);

  // Buscar locais da SerpApi com base na cidade recebida por prop
  useEffect(() => {
    async function fetchPlaces(city: string) {
      try {
        const response = await fetch(`/api/serpapi?location=${encodeURIComponent(city)}`);
        let data;
        try {
          data = await response.json();
        } catch (jsonErr) {
          setPlaces([]);
          console.error("Resposta da SerpApi não é JSON válido:", jsonErr);
          return;
        }
        if (data.locais) {
          console.log("🔎 Dados recebidos da API:", data.locais);
          setPlaces(data.locais.map(local => ({
            title: local.nome,
            address: local.endereco,
            gps_coordinates: {
              latitude: local.lat,
              longitude: local.lng
            }
          })));
        } else {
          setPlaces([]);
          console.error("Nenhum resultado da SerpApi:", data);
        }
      } catch (error) {
        setPlaces([]);
        console.error("Erro ao buscar locais da SerpApi:", error);
      }
    }

    if (city && city !== "Local Desconhecido") {
      fetchPlaces(city);
    }
  }, [city]);

  // Centralizar o mapa nas coordenadas do usuário, se disponíveis
  const centerPosition: [number, number] = coords
    ? [coords.lat, coords.lng]
    : places.length > 0
      ? [places[0].gps_coordinates.latitude, places[0].gps_coordinates.longitude]
      : [-23.55052, -46.633308]; // Fallback caso não ache nada

  // Filtro por tipo de unidade de saúde
  const filterKeywords = {
    ubs: [/ubs/i, /posto/i, /básica/i],
    upa: [/upa/i, /pronto atendimento/i, /24h/i, /pronto-atendimento/i],
    hospital: [/hospital/i, /emergência/i, /pronto-socorro/i, /pronto socorro/i]
  };

  const filteredPlaces = facilityType
    ? places.filter(place =>
        filterKeywords[facilityType].some(regex => regex.test(place.title))
      )
    : places;

  // Se não encontrar nenhuma unidade filtrada, exibe todas na lista
  const displayList = filteredPlaces.length > 0 ? filteredPlaces : places;

  // Encontrar a unidade mais próxima
  let closestPlace = null;
  if (coords && places.length > 0) {
    closestPlace = places
      .map(place => ({
        ...place,
        distance: getDistance(coords.lat, coords.lng, place.gps_coordinates.latitude, place.gps_coordinates.longitude)
      }))
      .sort((a, b) => a.distance - b.distance)[0];
  }

  // Não renderizar o mapa se a cidade não for válida
  if (!city || city === "Local Desconhecido") {
    return <div>Carregando localização do usuário...</div>;
  }

  return (
    <div>
      <h2>Unidades de Saúde em {city}</h2>
      <MapContainer center={centerPosition} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place, index) => (
          <Marker
            key={index}
            position={[place.gps_coordinates.latitude, place.gps_coordinates.longitude]}
          >
            <Popup>
              <strong>{place.title}</strong><br />
              {place.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {/* Destaque para a unidade mais próxima */}
      {closestPlace && (
        <div className="mb-4 p-4 border rounded bg-green-50">
          <h3 className="font-bold text-green-700">Unidade de saúde mais próxima:</h3>
          <p><strong>{closestPlace.title}</strong></p>
          <p>{closestPlace.address}</p>
          <p>Distância aproximada: {closestPlace.distance.toFixed(2)} km</p>
        </div>
      )}
      {/* Lista das unidades de saúde */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Lista de Unidades de Saúde</h3>
        {places.length === 0 ? (
          <p>Nenhuma unidade encontrada para esta região.</p>
        ) : (
          <ul className="space-y-2">
            {places.map((place, index) => (
              <li key={index} className="border p-3 rounded-md bg-white shadow-sm">
                <strong>{place.title}</strong><br />
                {place.address}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MedicalMap;
