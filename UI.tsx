import React, { useState, useRef } from 'react';
import { useStore, TemplateType } from '../store';
import { 
  Heart, 
  Flower, 
  Orbit, 
  Flame, 
  Sparkles, 
  Palette, 
  Hand, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

const UI: React.FC = () => {
  const { 
    currentTemplate, 
    setTemplate, 
    particleColor, 
    setColor, 
    isHandDetected, 
    handTension 
  } = useStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const templates: { id: TemplateType; icon: React.ReactNode; label: string }[] = [
    { id: 'heart', icon: <Heart size={20} />, label: 'Heart' },
    { id: 'flower', icon: <Flower size={20} />, label: 'Flower' },
    { id: 'saturn', icon: <Orbit size={20} />, label: 'Saturn' },
    { id: 'buddha', icon: <Sparkles size={20} />, label: 'Spirit' }, // Renamed Buddha to Spirit for broader appeal/icon match
    { id: 'fireworks', icon: <Flame size={20} />, label: 'Fireworks' },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
      <audio 
        ref={audioRef} 
        src="https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3" 
        loop 
      />

      {/* Header / Status */}
      <div className="flex items-start justify-between">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/30 p-2 pr-4 backdrop-blur-md transition-all hover:bg-black/40">
           <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isHandDetected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} transition-colors`}>
             <Hand size={20} />
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-medium text-white/60">Status</span>
             <span className={`text-sm font-bold ${isHandDetected ? 'text-green-400' : 'text-red-400'}`}>
               {isHandDetected ? 'Hand Detected' : 'No Hand'}
             </span>
           </div>
           {isHandDetected && (
             <div className="ml-2 flex flex-col items-end">
               <span className="text-xs text-white/40">Tension</span>
               <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                   style={{ width: `${handTension * 100}%` }}
                 />
               </div>
             </div>
           )}
        </div>

        <button 
          onClick={toggleAudio}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
        >
          {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      {/* Controls */}
      <div className="pointer-events-auto mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl bg-black/40 p-4 backdrop-blur-xl border border-white/5 shadow-2xl transition-all sm:flex-row sm:items-center sm:justify-between">
        
        {/* Templates */}
        <div className="flex flex-1 justify-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`group flex flex-col items-center gap-1 rounded-2xl p-3 transition-all ${
                currentTemplate === t.id 
                  ? 'bg-white/20 shadow-lg scale-105' 
                  : 'hover:bg-white/10 hover:scale-105'
              }`}
            >
              <div className={`text-white transition-transform duration-300 ${currentTemplate === t.id ? 'scale-110 text-pink-400' : 'group-hover:text-pink-200'}`}>
                {t.icon}
              </div>
              <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="h-px w-full bg-white/10 sm:h-12 sm:w-px" />

        {/* Color Picker */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 pr-4 transition-colors hover:bg-white/10">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 shadow-inner">
               <input 
                 type="color" 
                 value={particleColor}
                 onChange={(e) => setColor(e.target.value)}
                 className="absolute inset-0 h-[150%] w-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0"
               />
               <div 
                 className="absolute inset-0 pointer-events-none"
                 style={{ backgroundColor: particleColor }}
               />
               <Palette size={16} className="pointer-events-none relative z-10 text-white mix-blend-difference" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/60">Color</span>
              <span className="text-xs font-mono text-white">{particleColor}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UI;
