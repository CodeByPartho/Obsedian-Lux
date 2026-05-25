import { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [rendered, setRendered] = useState(true);

  useEffect(() => {
    let current = 0;
    // Progress calculation spanning roughly 2.6 seconds
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 4) + 1;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        // Completed loading, enter exit phase
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setRendered(false);
            onComplete();
          }, 800); // Wipe exit duration
        }, 400);
      }
      setProgress(current);
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!rendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090D] select-none transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
        isExiting ? 'translate-y-[-100%]' : 'translate-y-0'
      }`}
    >
      {/* Wipe element bands sliding across the screen during loading exit */}
      <div
        className={`fixed inset-0 bg-[#E94560] opacity-90 transition-transform duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? 'translate-y-[-102%]' : '-translate-y-full'
        }`}
        style={{ transitionDelay: '0.1s' }}
      />
      <div
        className={`fixed inset-0 bg-[#0F3460] opacity-80 transition-transform duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? 'translate-y-[-104%]' : '-translate-y-full'
        }`}
        style={{ transitionDelay: '0.2s' }}
      />

      <div className="relative flex flex-col items-center max-w-lg px-6 text-center">
        {/* Animated ambient backdrop pulse */}
        <div className="absolute w-72 h-72 bg-[#E94560]/10 rounded-full blur-3xl -z-10 animate-pulse duration-2000" />
        
        {/* Deluxe Geometric Logo Core */}
        <div className="mb-8 relative flex items-center justify-center w-20 h-20 border border-[#E94560]/30 rounded-none rotate-45 group overflow-hidden">
          <div className="absolute inset-1 border border-white/10 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="w-8 h-8 bg-gradient-to-br from-[#E94560] to-[#0F3460] -rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(233,69,96,0.3)]">
            <span className="text-white font-sans text-xs font-bold tracking-widest">O</span>
          </div>
        </div>

        {/* Brand Header */}
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-white tracking-[0.25em] uppercase mb-3">
          Obsidian <span className="text-[#E94560]">Lux</span>
        </h1>

        {/* Luxury concept tagline */}
        <p className="text-xs text-stone-500 font-sans tracking-[0.4em] uppercase mb-8 ml-1">
          REDEFINE YOUR HARMONY
        </p>

        {/* Interactive progress indicators */}
        <div className="w-56 h-[2px] bg-stone-900 overflow-hidden relative mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#0F3460] via-[#E94560] to-[#FFD700] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Live counter status metric */}
        <div className="text-sm font-mono tracking-widest text-[#E94560]">
          {progress.toString().padStart(3, '0')}%
        </div>
      </div>
    </div>
  );
}
