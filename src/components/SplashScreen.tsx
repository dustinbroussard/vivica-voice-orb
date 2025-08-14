
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
    <div 
      id="splash-screen" 
      className={!isVisible ? 'hidden' : ''}
    >
      <img 
        alt="VIVICA Logo" 
        src="/lovable-uploads/8c31fff4-7a55-4a27-bc69-41d56362bed5.png"
      />
    </div>
  );
};

export default SplashScreen;
