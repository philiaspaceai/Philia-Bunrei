import React from 'react';
import { SearchX, Keyboard } from 'lucide-react';

interface EmptyStateProps {
  hasSearched: boolean;
  query?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasSearched, query }) => {
  if (!hasSearched) {
    return (
      <div className="mt-16 text-center text-zinc-600 animate-fade-in flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900/50 mb-6 border border-zinc-800">
            <Keyboard className="w-8 h-8 opacity-50" />
        </div>
        
        <div className="space-y-1 mb-6">
            <p className="text-lg text-zinc-300">Ketik kata dalam bahasa Jepang</p>
            <p className="text-lg text-zinc-400">
                lalu tekan <span className="font-mono text-zinc-300 border border-zinc-700 rounded px-1.5 py-0.5 text-sm bg-zinc-800 mx-1">Enter</span> untuk mencari
            </p>
            <p className="text-lg text-zinc-400">penggunaan kosakata & bunpou</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-full px-6 py-2 text-sm text-zinc-500">
            Contoh: 勉強、食べる、が、のは、dan lain lain
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/10 mb-4 border border-red-900/20">
        <SearchX className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-xl font-medium text-zinc-300 mb-2">Tidak ditemukan hasil</h3>
      <p className="text-zinc-500">
        Kami tidak dapat menemukan contoh kalimat untuk "<span className="text-zinc-300 font-jp">{query}</span>".
      </p>
      <p className="text-zinc-600 text-sm mt-4">
        Coba cari kata dasar yang lebih sederhana atau pastikan tidak menggunakan Romaji.
      </p>
    </div>
  );
};