
import React from 'react';
import { cn } from '@/lib/utils';

interface SettingsHintProps {
  isActive: boolean;
  className?: string;
}

const SettingsHint: React.FC<SettingsHintProps> = ({ isActive, className }) => {
  return (
    <div className={cn(
      "fixed bottom-5 right-5 text-xs opacity-40",
      "transition-all duration-300 ease-out pointer-events-none select-none",
      "text-right leading-relaxed",
      isActive && "opacity-20",
      className
    )}>
      Press SPACE or long-press screen for settings
    </div>
  );
};

export default SettingsHint;
