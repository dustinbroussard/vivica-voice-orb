
import React, { useState, useEffect, useCallback, useRef } from 'react';
import VoiceOrb from '@/components/VoiceOrb';
import VivicaLogo from '@/components/VivicaLogo';
import ActivationHint from '@/components/ActivationHint';
import SettingsHint from '@/components/SettingsHint';
import SettingsPanel from '@/components/SettingsPanel';
import SplashScreen from '@/components/SplashScreen';

type VivicaState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const Index = () => {
  const [state, setState] = useState<VivicaState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const shouldRestartRef = useRef(true);
  const conversationRef = useRef<ChatMessage[]>([
    {
      role: 'system',
      content:
        'You are VIVICA, a helpful AI assistant. Keep responses concise for voice interaction.',
    },
  ]);

  // Web Speech API
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Load preferred speech synthesis voice (Google voices sound natural on Android)
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return;

    const updateVoices = () => {
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
        || voices.find(v => v.lang.startsWith('en'))
        || null;
      setVoice(preferred);
    };

    updateVoices();
    speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const restartRecognition = useCallback(() => {
    if (recognition && isActive && !isSettingsOpen) {
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to restart recognition:', err);
      }
    }
  }, [recognition, isActive, isSettingsOpen]);

  const speakResponse = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) {
          utterance.voice = voice;
        }
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        speechSynthesis.speak(utterance);
      });
    },
    [voice]
  );

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (
        window as Window & typeof globalThis & {
          webkitSpeechRecognition: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition;
      const speechRecognition = new SpeechRecognitionConstructor();
      // Continuous mode allows for back-to-back conversations without manual restarts
      speechRecognition.continuous = true;
      // Interim results give faster feedback and feel more natural
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-US';

      speechRecognition.onstart = () => {
        setIsListening(true);
        setState('listening');
      };

      speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.resultIndex];
        if (result.isFinal) {
          const transcript = result[0].transcript;
          handleVoiceInput(transcript);
        }
      };

      speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setState('error');
        setIsListening(false);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
        if (isActive && !isSettingsOpen && shouldRestartRef.current) {
          speechRecognition.start();
        } else if (!isActive || isSettingsOpen) {
          setState('idle');
        }
      };

      setRecognition(speechRecognition);
    }
  }, [isActive, isSettingsOpen, handleVoiceInput]);

  const handleVoiceInput = useCallback(async (transcript: string) => {
    setState('processing');
    console.log('User said:', transcript);
    if (recognition) {
      shouldRestartRef.current = false;
      recognition.stop();
    }

    try {
       const response = await makeOpenRouterCall(transcript);
       setState('speaking');
       await speakResponse(response);

      if (isActive && !isSettingsOpen) {
        setState('listening');
        if (recognition) {
          // small delay to avoid capturing synthesized speech
          setTimeout(() => {
            shouldRestartRef.current = true;
            restartRecognition();
          }, 250);
        }
      } else {
        setState('idle');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      setState('error');
    }
  }, [isActive, isSettingsOpen, recognition, restartRecognition, speakResponse]);

  const makeOpenRouterCall = async (message: string): Promise<string> => {
    const apiKey = localStorage.getItem('openrouter_api_key');
    const model = localStorage.getItem('selected_model') || 'openai/gpt-oss-20b:free';
    
    if (!apiKey) {
      throw new Error('Please set your OpenRouter API key in settings');
    }

    conversationRef.current.push({ role: 'user', content: message });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'VIVICA Voice Assistant'
      },
      body: JSON.stringify({
        model: model,
        messages: conversationRef.current,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    conversationRef.current.push({ role: 'assistant', content: reply });
    if (conversationRef.current.length > 10) {
      conversationRef.current.splice(1, conversationRef.current.length - 10); // keep system + last 9 exchanges
    }
    return reply;
  };


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
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
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
