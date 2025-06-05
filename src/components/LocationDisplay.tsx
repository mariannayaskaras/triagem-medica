import React from 'react';
import { useLocation } from '@/hooks/use-location';
import { MapPin, Loader } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && (
          <Tooltip>
            <TooltipTrigger asChild>
              <MapPin className="h-4 w-4 text-triage-blue cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded shadow-sm">
              <p className="text-xs max-w-[200px]">
                <strong>Nota:</strong> A localização pode não ser precisa se você estiver usando VPN ou proxy.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        <span className="text-sm">{city}</span>
      </div>
    </TooltipProvider>
  );
};

export default LocationDisplay;
