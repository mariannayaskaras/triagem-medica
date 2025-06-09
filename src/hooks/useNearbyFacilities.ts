import { useEffect, useState } from 'react';

export interface Facility {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

interface Coords {
  lat: number;
  lng: number;
}

export function useNearbyFacilities(
  keyword: string,
  userCoords: Coords | null
) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userCoords || !window.google || !window.google.maps) return;

    setLoading(true);

    const map = new window.google.maps.Map(document.createElement('div')); // necessário para inicializar o serviço
    const location = new window.google.maps.LatLng(userCoords.lat, userCoords.lng);

    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location,
      radius: 5000,
      keyword,
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const parsed = results.map((place) => ({
          name: place.name || 'Unidade de Saúde',
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
          address: place.vicinity,
        }));

        setFacilities(parsed);
      } else {
        setError('Nenhuma unidade encontrada.');
      }

      setLoading(false);
    });
  }, [userCoords, keyword]);

  return { facilities, loading, error };
}
