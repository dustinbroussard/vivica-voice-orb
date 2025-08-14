
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for fade-out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] transition-opacity duration-800">
      <img 
        alt="VIVICA Logo" 
        src="/lovable-uploads/8c31fff4-7a55-4a27-bc69-41d56362bed5.png"
        className="max-w-[60vw] max-h-[60vh] w-auto h-auto animate-pulse"
        style={{
          filter: 'drop-shadow(0 0 30px hsl(var(--vivica-purple) / 0.6))',
          animation: 'vivica-splash-pulse 2s ease-in-out infinite'
        }}
      />
    </div>
  );
};

export default SplashScreen;
