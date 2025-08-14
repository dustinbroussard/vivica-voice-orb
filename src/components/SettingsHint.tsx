
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
      <div className="md:hidden">Long press for settings</div>
      <div className="hidden md:block">Press SPACE or long-press for settings</div>
    </div>
  );
};

export default SettingsHint;
