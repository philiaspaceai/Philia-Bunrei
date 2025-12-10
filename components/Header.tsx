import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="flex flex-col items-center justify-center py-12 md:py-20 text-center animate-fade-in select-none">
      
      {/* Animated Icon Container */}
      <div className="relative group mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        {/* Increased size to w-20 h-20 (from w-16 h-16) to give more breathing room */}
        <div className="relative bg-zinc-900/80 backdrop-blur-md border border-emerald-500/30 w-20 h-20 flex items-center justify-center rounded-xl animate-border-glow shadow-2xl">
          <span className="font-jp font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 via-teal-200 to-indigo-400 animate-text-shimmer">
            文例
          </span>
        </div>
      </div>

      {/* Title with Fluid Gradient Animation */}
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-500 animate-text-shimmer bg-[length:200%_auto]">
          Philia Bunrei
        </span>
      </h1>

      {/* Indonesian Subtitle */}
      <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto leading-relaxed px-4">
        Kumpulan contoh kalimat bahasa Jepang pilihan. <br/>
        Ketik <span className="text-emerald-400 font-semibold">Hiragana, Katakana, atau Kanji</span> untuk melihat penggunaannya.
      </p>
    </header>
  );
};