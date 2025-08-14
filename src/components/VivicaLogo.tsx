
import React from 'react';
import { cn } from '@/lib/utils';

interface VivicaLogoProps {
  className?: string;
  isActive?: boolean;
}

const VivicaLogo: React.FC<VivicaLogoProps> = ({ className, isActive = false }) => {
  return (
    <div className={cn(
      "fixed bottom-10 left-1/2 transform -translate-x-1/2",
      "font-bold tracking-[0.3em] text-2xl md:text-3xl lg:text-4xl",
      "transition-all duration-500 ease-out",
      "vivica-text-glow select-none pointer-events-none",
      isActive ? "opacity-40 scale-95" : "opacity-90 scale-100",
      className
    )}>
      V I V I C A
    </div>
  );
};

export default VivicaLogo;
