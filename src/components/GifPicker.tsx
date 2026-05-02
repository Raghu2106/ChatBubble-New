import React, { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GifPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const GIPHY_API_KEY = 'dc6zaTOxFJmzC'; // Public beta key

export const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`);
        const data = await res.json();
        setGifs(data.data || []);
      } catch (err) {
        console.error('Error fetching trending GIFs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (err) {
      console.error('Error searching GIFs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-full max-w-[350px] bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-3 border-b border-border bg-surface-hover/20 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-brand">Search GIFs</h3>
        <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded-lg text-text-muted">
          <X size={14} />
        </button>
      </div>
      
      <form onSubmit={handleSearch} className="p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Giphy..."
            className="w-full bg-bg border border-border rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
          />
        </div>
      </form>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <Loader2 size={24} className="animate-spin text-brand" />
            <span className="text-[9px] font-black uppercase tracking-widest">Searching...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button 
                key={gif.id}
                onClick={() => onSelect(gif.images.fixed_height.url)}
                className="relative aspect-video rounded-lg overflow-hidden hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <img 
                  src={gif.images.fixed_height.url} 
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        )}
        
        {!loading && gifs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <span className="text-[9px] font-black uppercase tracking-widest">No GIFs found</span>
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-border bg-surface-hover/10 flex justify-center">
        <img src="https://micro-assets.giphy.com/assets/pixel.gif" alt="Powered by Giphy" className="h-4 opacity-50 grayscale" />
        <span className="text-[8px] font-bold text-text-muted">via GIPHY</span>
      </div>
    </div>
  );
};
