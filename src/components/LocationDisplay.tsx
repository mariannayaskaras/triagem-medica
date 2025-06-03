
import React from 'react';
import { useLocation } from '@/hooks/use-location';
import { MapPin, Loader, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationDisplayProps {
  showIcon?: boolean;
  className?: string;
}

const LocationDisplay = ({ showIcon = true, className = '' }: LocationDisplayProps) => {
  const { city, loading, error } = useLocation();

  if (loading) {
    return (
      <div className={`flex items-center gap-1 text-sm ${className}`}>
        <Loader className="h-4 w-4 animate-spin text-triage-blue" />
        <span>Obtendo localização...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-1 text-sm text-gray-500 ${className}`}>
        <span>{city}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && <MapPin className="h-4 w-4 text-triage-blue" />}
        <span className="text-sm">{city}</span>
      </div>
      
      <Alert className="border-amber-200 bg-amber-50">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs text-amber-700">
          <strong>Nota:</strong> A localização pode não ser precisa se você estiver usando VPN ou proxy.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default LocationDisplay;
