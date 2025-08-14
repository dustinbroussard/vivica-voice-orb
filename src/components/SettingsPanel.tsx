
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Plus, Trash2, Save, Play } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, className }) => {
  const [activeTab, setActiveTab] = useState('personas');
  const [temperature, setTemperature] = useState([0.7]);

  const tabs = [
    { id: 'personas', label: 'Personas' },
    { id: 'models', label: 'Models' },
    { id: 'tts', label: 'TTS' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className={cn(
      "fixed top-5 right-5 w-[400px] max-w-[90vw] h-[80vh] max-h-[80vh]",
      "vivica-glass rounded-2xl overflow-hidden z-50",
      "transition-all duration-300 ease-out",
      "vivica-slide-in",
      "shadow-2xl shadow-purple-500/20",
      isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none",
      className
    )}>
      {/* Header with close button */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold vivica-text-glow">Settings</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white/70 hover:text-white hover:bg-white/10 p-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 min-w-max px-4 py-3 text-sm font-medium transition-all duration-200",
              "border-b-2 border-transparent hover:text-white",
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
        {activeTab === 'personas' && (
          <div className="space-y-4">
            <div>
              <Label className="text-white/90 font-medium">Select Persona</Label>
              <Select defaultValue="default">
                <SelectTrigger className="vivica-glass border-white/20 text-white">
                  <SelectValue placeholder="Choose persona..." />
                </SelectTrigger>
                <SelectContent className="vivica-glass border-white/20">
                  <SelectItem value="default">Default VIVICA</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Play className="w-4 h-4 mr-1" />
                  Apply
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" className="border-red-400/50 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="persona-name" className="text-white/90 font-medium">Persona Name</Label>
              <Input 
                id="persona-name"
                placeholder="Enter persona name"
                className="vivica-glass border-white/20 text-white placeholder:text-white/50"
                defaultValue="Default VIVICA"
              />
            </div>

            <div>
              <Label htmlFor="system-prompt" className="text-white/90 font-medium">System Prompt</Label>
              <Textarea 
                id="system-prompt"
                placeholder="You are VIVICA, a helpful AI assistant..."
                className="vivica-glass border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
                defaultValue="You are VIVICA, a helpful and friendly AI assistant. Respond conversationally and keep responses concise for voice interaction."
              />
            </div>

            <div>
              <Label className="text-white/90 font-medium">Temperature: {temperature[0]}</Label>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key" className="text-white/90 font-medium">OpenRouter API Key</Label>
              <Input 
                id="api-key"
                type="password"
                placeholder="sk-or-api-key-..."
                className="vivica-glass border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <Label className="text-white/90 font-medium">Active Model</Label>
              <Select>
                <SelectTrigger className="vivica-glass border-white/20 text-white">
                  <SelectValue placeholder="Select a model..." />
                </SelectTrigger>
                <SelectContent className="vivica-glass border-white/20">
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/90 font-medium">Add Custom Model</Label>
              <Input 
                placeholder="Model Name (e.g., My Llama 3)"
                className="vivica-glass border-white/20 text-white placeholder:text-white/50 mb-2"
              />
              <Input 
                placeholder="Model ID (e.g., meta-llama/llama-3.1-8b-instruct)"
                className="vivica-glass border-white/20 text-white placeholder:text-white/50 mb-2"
              />
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-1" />
                Add Model
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'tts' && (
          <div className="space-y-4">
            <div>
              <Label className="text-white/90 font-medium">Text-to-Speech Provider</Label>
              <Select defaultValue="web">
                <SelectTrigger className="vivica-glass border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="vivica-glass border-white/20">
                  <SelectItem value="web">Web Speech API (Default)</SelectItem>
                  <SelectItem value="google">Google Cloud TTS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/90 font-medium">Voice Settings</Label>
              <Select defaultValue="en-US-Wavenet-A">
                <SelectTrigger className="vivica-glass border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="vivica-glass border-white/20">
                  <SelectItem value="en-US-Wavenet-A">English (US) Female A</SelectItem>
                  <SelectItem value="en-US-Wavenet-B">English (US) Male B</SelectItem>
                  <SelectItem value="en-GB-Wavenet-A">English (UK) Female A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div>
              <Label className="text-white/90 font-medium">Conversation History</Label>
              <Button 
                variant="outline" 
                className="w-full border-red-400/50 text-red-400 hover:bg-red-500/10 mt-2"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Conversation History
              </Button>
              <p className="text-xs text-white/50 mt-2">
                Note: Each persona stores its own conversation history.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
