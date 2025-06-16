import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Corrige os ícones padrão do Leaflet no build React
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

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const response = await fetch(
          "https://serpapi.com/search.json?engine=google_maps&q=unidade+de+saúde+antônio+alves&api_key=46fc0880e871efe8cd2b724b98e38fb315c33a39bb14e47e005925cdac78dc3e"
        );
        const data = await response.json();
        if (data.local_results) {
          setPlaces(data.local_results);
        }
      } catch (error) {
        console.error("Erro ao buscar locais da SerpApi:", error);
      }
    }

    fetchPlaces();
  }, []);

  const centerPosition = places.length > 0
    ? [places[0].gps_coordinates.latitude, places[0].gps_coordinates.longitude]
    : [-23.55052, -46.633308]; // Posição padrão (São Paulo)

  return (
    <div>
      <h2>Unidades de Saúde Encontradas</h2>
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
