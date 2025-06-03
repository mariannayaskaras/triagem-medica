
import React from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmergencyButtonProps {
  showText?: boolean;
}

const EmergencyButton = ({ showText = true }: EmergencyButtonProps) => {
  const isMobile = useIsMobile();
  
  const handleEmergencyCall = () => {
    // Direct call to emergency number using tel: protocol
    window.location.href = 'tel:192';
  };

  return (
    <Button 
      onClick={handleEmergencyCall}
      className="bg-triage-high hover:bg-red-600 text-white flex items-center gap-2 px-4 py-2 rounded-md shadow-md animate-pulse"
      aria-label="Chamar emergência - 192 SAMU"
    >
      <Phone className="w-5 h-5" />
      {showText && <span className="font-bold">EMERGÊNCIA - Chamar 192</span>}
    </Button>
  );
};

export default EmergencyButton;
