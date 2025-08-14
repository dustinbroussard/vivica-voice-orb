
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

  // Web Speech API
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speechRecognition = new (window as any).webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';

      speechRecognition.onstart = () => {
        setIsListening(true);
        setState('listening');
      };

      speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceInput(transcript);
      };

      speechRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setState('error');
        setIsListening(false);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
        if (isActive && !isSettingsOpen) {
          setState('idle');
        }
      };

      setRecognition(speechRecognition);
    }
  }, []);

  const handleVoiceInput = async (transcript: string) => {
    setState('processing');
    console.log('User said:', transcript);
    
    // Here we'll make the actual API call
    try {
      const response = await makeOpenRouterCall(transcript);
      setState('speaking');
      await speakResponse(response);
      
      if (isActive && !isSettingsOpen) {
        setState('listening');
        if (recognition) {
          recognition.start();
        }
      } else {
        setState('idle');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      setState('error');
    }
  };

  const makeOpenRouterCall = async (message: string): Promise<string> => {
    const apiKey = localStorage.getItem('openrouter_api_key');
    const model = localStorage.getItem('selected_model') || 'openai/gpt-3.5-turbo';
    
    if (!apiKey) {
      throw new Error('Please set your OpenRouter API key in settings');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'VIVICA Voice Assistant'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are VIVICA, a helpful AI assistant. Keep responses concise for voice interaction.' },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const speakResponse = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      speechSynthesis.speak(utterance);
    });
  };

  // Simulate voice activity for demo when not using real speech
  const simulateVoiceActivity = useCallback(() => {
    if (!isActive || isSettingsOpen || isListening) return;

    const activities: VivicaState[] = ['listening', 'processing', 'speaking'];
    let currentIndex = 0;

    const cycle = () => {
      if (!isActive || isSettingsOpen || isListening) {
        setState('idle');
        return;
      }

      setState(activities[currentIndex]);
      
      const newVolume = Math.random() * 0.8 + 0.2;
      setVolume(newVolume);

      currentIndex = (currentIndex + 1) % activities.length;
      
      const delay = activities[currentIndex] === 'processing' ? 2000 : 
                   activities[currentIndex] === 'speaking' ? 3000 : 1500;
      
      setTimeout(cycle, delay);
    };

    cycle();
  }, [isActive, isSettingsOpen, isListening]);

  const handleActivation = useCallback(() => {
    if (isSettingsOpen) return;
    
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    
    if (newActiveState && recognition) {
      console.log('VIVICA activated');
      setState('listening');
      recognition.start();
    } else {
      console.log('VIVICA deactivated');
      setState('idle');
      setVolume(0);
      if (recognition) {
        recognition.stop();
      }
    }
  }, [isActive, isSettingsOpen, recognition]);

  const handleSettingsToggle = useCallback(() => {
    setIsSettingsOpen(!isSettingsOpen);
    if (!isSettingsOpen && isActive) {
      setState('idle');
      setVolume(0);
      if (recognition) {
        recognition.stop();
      }
    }
  }, [isSettingsOpen, isActive, recognition]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Touch handlers for mobile
  useEffect(() => {
    let longPressTimer: NodeJS.Timeout;
    let isLongPress = false;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now();
      isLongPress = false;
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        navigator.vibrate?.(50); // Haptic feedback if available
        handleSettingsToggle();
      }, 800);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      clearTimeout(longPressTimer);
      const touchDuration = Date.now() - touchStartTime;
      
      if (!isLongPress && touchDuration < 800 && !isSettingsOpen) {
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

  // Keyboard handlers for desktop
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
      
      {/* Settings Hint - Updated for mobile */}
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
