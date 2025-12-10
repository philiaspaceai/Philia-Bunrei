import React, { useState, FormEvent } from 'react';
import { Search, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface SearchBoxProps {
  onSearch: (keyword: string) => void;
  isLoading: boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Check for Romaji immediately on submit for UX feedback
    if (/[a-zA-Z]/.test(input)) {
      setValidationError("Mohon gunakan huruf Jepang saja (Kanji, Hiragana, Katakana).");
      return;
    }

    setValidationError(null);
    onSearch(input);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (validationError) setValidationError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 z-10 relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 rounded-2xl blur-xl transition-opacity duration-300 ${input ? 'opacity-100' : 'opacity-0'}`}></div>
        
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={handleChange}
            autoFocus
            placeholder="Cari (cth: 食べる, ぶんぽう...)"
            className="w-full bg-surface border border-zinc-700/50 text-white placeholder-zinc-500 text-lg py-4 pl-12 pr-20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-2xl font-jp tracking-wide"
            disabled={isLoading}
          />
          <div className="absolute left-4 text-zinc-500">
            <Search className="w-5 h-5" />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-800 flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="text-xs font-bold px-2 py-0.5">CARI</span>
            )}
          </button>
        </div>
      </form>
      
      {validationError && (
        <div className="mt-3 flex items-center justify-center gap-2 text-red-400 bg-red-900/10 py-2 px-4 rounded-lg border border-red-900/20 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Community Link */}
      <div className="mt-4 flex justify-center">
        <a 
          href="https://philiaspace.my.id" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-400 transition-colors duration-300 group"
        >
          <span>Dibuat oleh Philia Space Community</span>
          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  );
};