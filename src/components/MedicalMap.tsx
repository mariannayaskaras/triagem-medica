import React, { useEffect, useRef, useState } from 'react';
import { useNearbyFacilities, Facility } from '@/hooks/useNearbyFacilities';

interface MedicalMapProps {
  facilityType: string; // Ex: "hospital", "ubs", "upa"
}

const facilityMap: Record<string, string> = {
  ubs: 'hospital',
  upa: 'urgent care',
  hospital: 'hospital'
};

const MedicalMap = ({ facilityType }: MedicalMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const keyword = facilityMap[facilityType.toLowerCase()] || 'hospital';
  const { facilities } = useNearbyFacilities(keyword, userCoords);

  // Carrega script do Google Maps se ainda não carregado
  useEffect(() => {
    const scriptId = 'google-maps-api';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initUserLocation();
      document.body.appendChild(script);
    } else {
      initUserLocation();
    }
  }, []);

  const initUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Erro ao obter localização do usuário:', error);
      }
    );
  };

  useEffect(() => {
    if (userCoords && mapRef.current && window.google && !mapInstance) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: userCoords,
        zoom: 14
      });

      new window.google.maps.Marker({
        position: userCoords,
        map,
        title: 'Sua localização',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      });

      setMapInstance(map);
    }
  }, [userCoords, mapRef.current]);

  useEffect(() => {
    if (!mapInstance || !facilities.length) return;

    facilities.forEach((facility: Facility) => {
      new window.google.maps.Marker({
        position: { lat: facility.lat, lng: facility.lng },
        map: mapInstance,
        title: facility.name
      });
    });
  }, [facilities, mapInstance]);

  return (
    <div
      ref={mapRef}
      className="w-full h-96 rounded-md shadow-md border border-gray-200"
    />
  );
};

export default MedicalMap;
