import React, { useState, useEffect, useCallback } from 'react';
import VoiceOrb from '@/components/VoiceOrb';
import VivicaLogo from '@/components/VivicaLogo';
import ActivationHint from '@/components/ActivationHint';
import SettingsHint from '@/components/SettingsHint';
import SettingsPanel from '@/components/SettingsPanel';
import SplashScreen from '@/components/SplashScreen';

type VivicaState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

const Index = () => {
  const [state, setState] = useState<VivicaState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  // Simulate voice activity for demo
  const simulateVoiceActivity = useCallback(() => {
    if (!isActive || isSettingsOpen) return;

    const activities: VivicaState[] = ['listening', 'processing', 'speaking'];
    let currentIndex = 0;

    const cycle = () => {
      if (!isActive || isSettingsOpen) {
        setState('idle');
        return;
      }

      setState(activities[currentIndex]);
      
      // Simulate volume changes
      const newVolume = Math.random() * 0.8 + 0.2;
      setVolume(newVolume);

      currentIndex = (currentIndex + 1) % activities.length;
      
      const delay = activities[currentIndex] === 'processing' ? 2000 : 
                   activities[currentIndex] === 'speaking' ? 3000 : 1500;
      
      setTimeout(cycle, delay);
    };

    cycle();
  }, [isActive, isSettingsOpen]);

  const handleActivation = useCallback(() => {
    if (isSettingsOpen) return;
    
    setIsActive(!isActive);
    if (!isActive) {
      console.log('VIVICA activated');
      // In a real implementation, this would start speech recognition
      setState('listening');
    } else {
      console.log('VIVICA deactivated');
      setState('idle');
      setVolume(0);
    }
  }, [isActive, isSettingsOpen]);

  const handleSettingsToggle = useCallback(() => {
    setIsSettingsOpen(!isSettingsOpen);
    if (!isSettingsOpen && isActive) {
      // Pause VIVICA when opening settings
      setState('idle');
      setVolume(0);
    }
  }, [isSettingsOpen, isActive]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          handleSettingsToggle();
        } else {
          handleActivation();
        }
      }
      if (event.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleActivation, handleSettingsToggle, isSettingsOpen]);

  // Touch handlers for mobile
  useEffect(() => {
    let longPressTimer: NodeJS.Timeout;
    let isLongPress = false;

    const handleTouchStart = () => {
      isLongPress = false;
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        handleSettingsToggle();
      }, 800);
    };

    const handleTouchEnd = () => {
      clearTimeout(longPressTimer);
      if (!isLongPress && !isSettingsOpen) {
        handleActivation();
      }
    };

    const handleTouchCancel = () => {
      clearTimeout(longPressTimer);
      isLongPress = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
      clearTimeout(longPressTimer);
    };
  }, [handleActivation, handleSettingsToggle, isSettingsOpen]);

  // Simulate voice activity when active
  useEffect(() => {
    if (isActive && !isSettingsOpen) {
      simulateVoiceActivity();
    }
  }, [isActive, isSettingsOpen, simulateVoiceActivity]);

  // Update body classes for global styling
  useEffect(() => {
    document.body.className = isActive ? 'active' : '';
  }, [isActive]);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Voice Orb - Main visual element */}
      <VoiceOrb state={state} volume={volume} />
      
      {/* VIVICA Logo */}
      <VivicaLogo isActive={isActive} />
      
      {/* Activation Hint */}
      <ActivationHint isActive={isActive} />
      
      {/* Settings Hint */}
      <SettingsHint isActive={isActive} />
      
      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Status indicator for development */}
      <div className="fixed top-4 left-4 text-xs text-white/50 font-mono">
        State: {state} | Active: {isActive ? 'Yes' : 'No'} | Volume: {volume.toFixed(2)}
      </div>
    </div>
  );
};

export default Index;
