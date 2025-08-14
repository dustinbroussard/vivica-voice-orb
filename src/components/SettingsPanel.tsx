
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { X, Save } from 'lucide-react';
import ModelSelect from '@/components/ModelSelect';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, className }) => {
  const [activeTab, setActiveTab] = useState('models');
  const [temperature, setTemperature] = useState([0.7]);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-20b:free');
  const [systemPrompt, setSystemPrompt] = useState('You are VIVICA, a helpful AI assistant. Keep responses concise for voice interaction.');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key') || '';
    const savedModel = localStorage.getItem('selected_model') || 'openai/gpt-oss-20b:free';
    const savedTemp = parseFloat(localStorage.getItem('temperature') || '0.7');
    const savedPrompt = localStorage.getItem('system_prompt') || 'You are VIVICA, a helpful AI assistant. Keep responses concise for voice interaction.';

    setApiKey(savedApiKey);
    setSelectedModel(savedModel);
    setTemperature([savedTemp]);
    setSystemPrompt(savedPrompt);
  }, [isOpen]);

  const saveSettings = () => {
    localStorage.setItem('openrouter_api_key', apiKey);
    localStorage.setItem('selected_model', selectedModel);
    localStorage.setItem('temperature', temperature[0].toString());
    localStorage.setItem('system_prompt', systemPrompt);
    
    // Show feedback
    navigator.vibrate?.(100);
    onClose();
  };

  const tabs = [
    { id: 'models', label: 'Models' },
    { id: 'persona', label: 'Persona' },
    { id: 'voice', label: 'Voice' },
  ];

  return (
    <div className={cn(
      "fixed inset-0 z-50",
      "transition-all duration-300 ease-out",
      isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none",
      className
    )}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={cn(
        "absolute right-0 top-0 h-full w-full sm:max-w-md",
        "bg-black/95 backdrop-blur-md border-l border-white/20",
        "flex flex-col overflow-hidden"
      )}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={saveSettings}
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10 min-h-[44px] min-w-[44px]"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 min-w-max px-4 py-4 text-sm font-medium transition-all duration-200 min-h-[52px]",
                "border-b-2 border-transparent hover:text-white touch-manipulation",
                activeTab === tab.id
                  ? "text-white border-b-purple-500 bg-white/5"
                  : "text-white/70 hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div>
                <Label className="text-white/90 font-medium text-base mb-3 block">OpenRouter API Key</Label>
                <Input 
                  type="password"
                  placeholder="sk-or-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-base"
                />
                <p className="text-sm text-white/50 mt-2">
                  Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">openrouter.ai</a>
                </p>
              </div>

              <div>
                <Label className="text-white/90 font-medium text-base mb-3 block">Select Model</Label>
                <ModelSelect
                  value={selectedModel}
                  onChange={setSelectedModel}
                />
              </div>

              <div>
                <Label className="text-white/90 font-medium text-base mb-3 block">
                  Temperature: {temperature[0].toFixed(1)}
                </Label>
                <div className="px-2">
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={1}
                    min={0}
                    step={0.1}
                    className="h-8"
                  />
                </div>
                <p className="text-sm text-white/50 mt-2">
                  Higher values make responses more creative
                </p>
              </div>
            </div>
          )}

          {activeTab === 'persona' && (
            <div className="space-y-6">
              <div>
                <Label className="text-white/90 font-medium text-base mb-3 block">System Prompt</Label>
                <Textarea 
                  placeholder="You are VIVICA, a helpful AI assistant..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[160px] text-base resize-none"
                />
                <p className="text-sm text-white/50 mt-2">
                  This defines VIVICA's personality and behavior
                </p>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div>
                <Label className="text-white/90 font-medium text-base mb-3 block">Voice Settings</Label>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white/70 text-base leading-relaxed">
                    Voice settings are handled by your device's speech synthesis. 
                    You can adjust voice, speed, and other settings in your device's accessibility options.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
