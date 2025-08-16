import React, { useState, useMemo, useEffect } from 'react';
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

interface OpenRouterModel {
  id: string;
  name: string;
  provider: string;
}

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
        try {
          const res = await fetch('https://openrouter.ai/api/v1/models');
          const data = await res.json();
          const parsed = (data.data || []).map(
            (model: { id: string; name?: string }) => ({
              id: model.id,
              name: model.name || model.id,
              provider: model.id.split('/')[0],
            })
          );
          setModels(parsed);
        } catch (err) {
          console.error('Failed to fetch models', err);
        } finally {
          setLoading(false);
        }
      };

    fetchModels();
  }, []);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;

    const query = searchQuery.toLowerCase();
    return models.filter(
      model =>
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query)
    );
  }, [searchQuery, models]);

  const selectedModel = models.find(model => model.id === value);

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
            {loading ? (
              <div className="px-3 py-6 text-center text-white/50 text-sm">
                Loading models...
              </div>
            ) : filteredModels.length === 0 ? (
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
