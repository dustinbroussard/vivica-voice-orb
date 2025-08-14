
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

interface ModelSelectProps {
  value: string;
  onChange: (modelId: string) => void;
  className?: string;
}

const OPENROUTER_MODELS: ModelOption[] = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Latest GPT-4 model' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster, cheaper GPT-4' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Latest Claude model' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast Claude model' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', description: 'Google\'s flagship model' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Open source model' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'Larger Llama model' },
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', description: 'Efficient open model' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', description: 'Mixture of experts' },
];

const ModelSelect: React.FC<ModelSelectProps> = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredModels, setFilteredModels] = useState(OPENROUTER_MODELS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter models based on search term
  useEffect(() => {
    const filtered = OPENROUTER_MODELS.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (model.description && model.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredModels(filtered);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedModel = OPENROUTER_MODELS.find(model => model.id === value);

  const handleModelSelect = (modelId: string) => {
    onChange(modelId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/15 transition-colors"
      >
        <span className="text-left truncate">
          {selectedModel ? selectedModel.name : 'Select a model...'}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/50 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Model List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleModelSelect(model.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0",
                    value === model.id && "bg-purple-500/20 text-purple-300"
                  )}
                >
                  <div className="font-medium text-white">{model.name}</div>
                  {model.description && (
                    <div className="text-sm text-white/70 mt-1">{model.description}</div>
                  )}
                  <div className="text-xs text-white/50 mt-1 font-mono">{model.id}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-white/50">
                No models found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelect;
