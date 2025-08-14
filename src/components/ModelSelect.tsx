import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const OPENROUTER_MODELS = [
  // OpenAI Models
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  
  // Anthropic Models
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  
  // Google Models
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
  
  // Meta Models
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta' },
  
  // Mistral Models
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', provider: 'Mistral' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'Mistral' },
  
  // Other Popular Models
  { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere' },
  { id: 'perplexity/llama-3.1-sonar-huge-128k-online', name: 'Sonar Huge 128K', provider: 'Perplexity' },
];

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = useMemo(() => {
    if (!searchQuery) return OPENROUTER_MODELS;
    
    const query = searchQuery.toLowerCase();
    return OPENROUTER_MODELS.filter(
      model =>
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedModel = OPENROUTER_MODELS.find(model => model.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/15 h-12 text-base"
        >
          <div className="flex flex-col items-start max-w-[calc(100%-24px)]">
            <span className="truncate">
              {selectedModel ? selectedModel.name : 'Select model...'}
            </span>
            {selectedModel && (
              <span className="text-xs text-white/50 truncate">
                {selectedModel.provider}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-black/95 backdrop-blur-md border-white/20" side="bottom" align="start">
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-10"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-1">
            {filteredModels.length === 0 ? (
              <div className="px-3 py-6 text-center text-white/50 text-sm">
                No models found
              </div>
            ) : (
              filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onChange(model.id);
                    setOpen(false);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-3 text-left rounded-md transition-colors touch-manipulation",
                    "hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                    value === model.id && "bg-white/10"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">
                      {model.name}
                    </span>
                    <span className="text-white/50 text-xs">
                      {model.provider}
                    </span>
                  </div>
                  {value === model.id && (
                    <Check className="h-4 w-4 text-green-400" />
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default ModelSelect;
