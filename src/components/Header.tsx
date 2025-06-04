import React from 'react';
import { FaHeartbeat } from 'react-icons/fa'; // Ou troque pelo ícone que preferir
import { useIsMobile } from '@/hooks/use-mobile';
import LocationDisplay from './LocationDisplay';

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <FaHeartbeat className="w-6 h-6 sm:w-8 sm:h-8 text-triage-blue" />
        <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-800`}>
          Cuidado Inteligente
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <LocationDisplay className="text-gray-600" />
        {!isMobile && (
          <div className="text-sm text-gray-500">
            Triagem médica assistida por IA
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
