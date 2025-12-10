import React, { useState, useEffect, useRef } from 'react';
import { Sentence } from '../types';
import { Eye, EyeOff, Volume2, StopCircle, Loader2 } from 'lucide-react';
import { GEMINI_TTS_URL } from '../constants';

interface SentenceCardProps {
  sentence: Sentence;
  index: number;
  highlightKeyword?: string;
}

export const SentenceCard: React.FC<SentenceCardProps> = ({ sentence, index, highlightKeyword }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Refs for audio management
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  // Stagger animation based on index
  const animationDelay = `${index * 0.05}s`;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    // 1. Stop Standard TTS
    window.speechSynthesis.cancel();
    
    // 2. Stop Gemini Audio
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      audioSourceRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }

    setIsPlaying(false);
    setIsLoadingAudio(false);
  };

  const decodeGeminiPCM = (base64Data: string, ctx: AudioContext): AudioBuffer => {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Gemini 2.5 Flash TTS returns raw PCM 16-bit Little Endian
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    
    for (let i = 0; i < int16Data.length; i++) {
      // Convert Int16 to Float32 (-1.0 to 1.0)
      float32Data[i] = int16Data[i] / 32768.0;
    }

    // Create buffer: 1 Channel (Mono), 24kHz (Gemini Standard)
    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);
    return buffer;
  };

  const playGeminiTTS = async () => {
    try {
      setIsLoadingAudio(true);
      
      const payload = {
        contents: [{ parts: [{ text: sentence.jp }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" } // Options: Kore, Puck, Charon, Fenrir, Zephyr
            }
          }
        }
      };

      const response = await fetch(GEMINI_TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`);
      }

      const data = await response.json();
      const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("No audio data received from Gemini");
      }

      // Initialize Audio Context (must be user triggered)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const audioBuffer = decodeGeminiPCM(base64Audio, ctx);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };

      audioSourceRef.current = source;
      source.start(0);
      setIsPlaying(true);
      setIsLoadingAudio(false);

    } catch (error) {
      console.warn("Gemini TTS Failed, switching to fallback:", error);
      // Clean up failed context
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
      playStandardTTS(); // FALLBACK
    }
  };

  const playStandardTTS = () => {
    setIsLoadingAudio(false); // Ensure loading state is off
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(sentence.jp);
    utteranceRef.current = utterance;

    utterance.lang = 'ja-JP';
    utterance.rate = 0.8; 
    utterance.pitch = 1.0;

    const setVoice = () => {
      const voices = synth.getVoices();
      const japaneseVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("ja")) ||
                            voices.find(v => v.lang.includes("ja"));
      if (japaneseVoice) utterance.voice = japaneseVoice;
    };

    if (synth.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoice();
        synth.speak(utterance);
      };
    } else {
      setVoice();
      synth.speak(utterance);
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
        setIsPlaying(false);
        utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
  };

  const handleSpeak = () => {
    if (isPlaying || isLoadingAudio) {
      stopAllAudio();
      return;
    }
    // Try Gemini First
    playGeminiTTS();
  };

  // Text Highlighting Logic
  const renderHighlightedText = (text: string) => {
    if (!highlightKeyword || !highlightKeyword.trim()) return text;
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(`(${escapeRegExp(highlightKeyword)})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) => {
        const match = part.toLowerCase() === highlightKeyword.toLowerCase();
        return match ? (
          <span key={i} className="text-emerald-300 font-bold bg-emerald-500/20 px-1 mx-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-emerald-500/30">
            {part}
          </span>
        ) : (<span key={i}>{part}</span>);
      });
    } catch { return text; }
  };

  return (
    <div 
      className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:bg-zinc-800/50 hover:border-emerald-500/30 transition-all duration-300 animate-slide-up group relative"
      style={{ animationDelay }}
    >
      <div className="flex flex-col gap-4">
        {/* Japanese Sentence Area */}
        <div className="flex items-start gap-4">
            <div className="flex flex-col gap-3 mt-1 min-w-[32px] items-center">
                 <span className="flex items-center justify-center w-8 h-6 rounded bg-emerald-900/30 text-emerald-500 text-xs font-mono font-bold">JP</span>
                 
                 {/* Audio Button */}
                 <button 
                  onClick={handleSpeak}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 outline-none
                    ${isPlaying || isLoadingAudio
                        ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50' 
                        : 'bg-zinc-800/50 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 cursor-pointer'}
                  `}
                  aria-label={isPlaying ? "Hentikan audio" : "Putar audio"}
                  title={isPlaying ? "Stop" : "Dengarkan (AI)"}
                 >
                    {isLoadingAudio ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPlaying ? (
                        <StopCircle className="w-4 h-4" />
                    ) : (
                        <Volume2 className="w-4 h-4" />
                    )}
                 </button>
            </div>
            
            <div className="flex-1 pt-0.5 min-h-[3rem] flex items-center">
                <p className="text-xl md:text-2xl font-jp font-medium text-zinc-100 leading-relaxed selection:bg-emerald-500/30">
                    {renderHighlightedText(sentence.jp)}
                </p>
            </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-800/50 w-full my-1 ml-12"></div>

        {/* Indonesian Translation */}
        <div className="relative min-h-[3rem] flex items-center">
             <div className="absolute left-0 top-0 mt-1 min-w-[32px] flex justify-center">
                 <span className="flex items-center justify-center w-8 h-6 rounded bg-indigo-900/30 text-indigo-400 text-xs font-mono font-bold">ID</span>
            </div>
            
          <div className={`pl-12 transition-all duration-500 ease-in-out w-full ${isRevealed ? 'opacity-100 blur-0 translate-y-0' : 'opacity-40 blur-sm translate-y-1'}`}>
            <p className="text-zinc-300 font-sans leading-relaxed text-lg">
              {sentence.idn}
            </p>
          </div>

          {/* Mask / Reveal Button */}
          {!isRevealed && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/10 backdrop-blur-[2px] rounded transition-all z-10">
              <button
                onClick={() => setIsRevealed(true)}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-emerald-900/20 border border-zinc-700 hover:border-emerald-500/50"
              >
                <Eye className="w-4 h-4" />
                <span>Lihat Terjemahan</span>
              </button>
            </div>
          )}
          
          {isRevealed && (
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsRevealed(false);
                }}
                className="absolute right-0 top-0 text-zinc-600 hover:text-zinc-400 transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                title="Sembunyikan"
              >
                <EyeOff className="w-4 h-4" />
              </button>
          )}
        </div>
      </div>
    </div>
  );
};