
import React from 'react';
import { cn } from '@/lib/utils';

interface ActivationHintProps {
  isActive: boolean;
  className?: string;
}

const ActivationHint: React.FC<ActivationHintProps> = ({ isActive, className }) => {
  return (
    <div className={cn(
      "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      "px-6 py-3 rounded-full text-sm font-medium",
      "vivica-glass transition-all duration-500 ease-out pointer-events-none select-none",
      "border border-white/20",
      isActive ? "opacity-0 scale-95" : "opacity-80 scale-100",
      className
    )}>
      Tap or Space to activate
    </div>
  );
};

export default ActivationHint;
