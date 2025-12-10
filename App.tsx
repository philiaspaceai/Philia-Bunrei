import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchBox } from './components/SearchBox';
import { SentenceCard } from './components/SentenceCard';
import { EmptyState } from './components/EmptyState';
import { searchSentences } from './services/sentenceService';
import { SearchState } from './types';
import { BookMarked } from 'lucide-react';

function App() {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  const handleSearch = async (keyword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, query: keyword }));
    
    try {
      const results = await searchSentences(keyword);
      setState({
        query: keyword,
        results,
        isLoading: false,
        error: null,
        hasSearched: true,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui',
        hasSearched: true,
        results: []
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Background ambient glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] opacity-30"></div>
            <div className="absolute top-20 right-0 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px] opacity-20"></div>
            <div className="absolute bottom-0 left-20 w-[20rem] h-[20rem] bg-teal-600/10 rounded-full blur-[80px] opacity-20"></div>
        </div>

      <div className="relative z-10 max-w-4xl mx-auto pb-20">
        <Header />
        
        <SearchBox onSearch={handleSearch} isLoading={state.isLoading} />

        <main className="mt-12 px-4">
          {state.error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-xl text-center mb-8 animate-fade-in">
              Terjadi kesalahan: {state.error}
            </div>
          )}

          {!state.isLoading && state.hasSearched && state.results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-zinc-500 text-sm mb-4 px-2">
                 <span>Ditemukan {state.results.length} contoh untuk "<span className="text-emerald-400 font-jp">{state.query}</span>"</span>
                 <BookMarked className="w-4 h-4 opacity-50"/>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {state.results.map((sentence, index) => (
                  <SentenceCard 
                    key={sentence.id} 
                    sentence={sentence} 
                    index={index} 
                    highlightKeyword={state.query}
                  />
                ))}
              </div>
              
              {state.results.length >= 50 && (
                <div className="text-center py-8 text-zinc-500 text-sm italic">
                  Menampilkan 50 hasil teratas untuk menjaga performa.
                </div>
              )}
            </div>
          )}

          {!state.isLoading && state.results.length === 0 && (
            <EmptyState hasSearched={state.hasSearched} query={state.query} />
          )}
        </main>
      </div>
      
      <footer className="fixed bottom-0 w-full py-4 text-center text-zinc-600 text-xs bg-background/80 backdrop-blur-md border-t border-white/5 z-20">
        <p>© {new Date().getFullYear()} Philia Bunrei. Database memuat 180k+ entri.</p>
      </footer>
    </div>
  );
}

export default App;