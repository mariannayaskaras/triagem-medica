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

const MedicalMap = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [userCity, setUserCity] = useState<string>("");

  // Primeiro: Detectar a cidade do usuário
  useEffect(() => {
    async function fetchUserCity() {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        console.log("Cidade detectada:", data.city);
        setUserCity(data.city || "São Paulo");
      } catch (error) {
        console.error("Erro ao detectar cidade do usuário:", error);
        setUserCity("São Paulo");
      }
    }

    fetchUserCity();
  }, []);

  // Segundo: Fazer o fetch dos locais da SerpApi com base na cidade
  useEffect(() => {
    async function fetchPlaces(city: string) {
      try {
        const response = await fetch(`/api/serpapi?location=${encodeURIComponent(city)}`);
        const data = await response.json();
        if (data.local_results) {
          setPlaces(data.local_results);
        } else {
          console.error("Nenhum resultado da SerpApi:", data);
        }
      } catch (error) {
        console.error("Erro ao buscar locais da SerpApi:", error);
      }
    }

    if (userCity) {
      fetchPlaces(userCity);
    }
  }, [userCity]);

  const centerPosition =
    places.length > 0
      ? [
          places[0].gps_coordinates.latitude,
          places[0].gps_coordinates.longitude,
        ]
      : [-23.55052, -46.633308]; // Fallback caso não ache nada

  return (
    <div>
      <h2>Unidades de Saúde em {userCity}</h2>
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
    </div>
  );
};

export default MedicalMap;
