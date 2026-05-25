import { useState, useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  onExploreClick: () => void;
}

export default function Hero({ onShopClick, onExploreClick }: HeroProps) {
  const [typedText, setTypedText] = useState('');
  const textOptions = [
    'EXQUISITE TAILORING FOR THE ULTRA-MODERN SPHERE.',
    'AESTHETIC ESSENTIALS BORN OF SHADOWED LUXURY.',
    'EMBRACE THE CALMING INTENSITY OF THE VOID.'
  ];
  const [optionIdx, setOptionIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Typewriter effect lifecycle
  useEffect(() => {
    let timer: number;
    const currentFullStr = textOptions[optionIdx];
    
    if (isDeleting) {
      timer = window.setTimeout(() => {
        setTypedText((prev) => prev.slice(0, -1));
      }, 35);
    } else {
      timer = window.setTimeout(() => {
        setTypedText(currentFullStr.slice(0, typedText.length + 1));
      }, 70);
    }

    if (!isDeleting && typedText === currentFullStr) {
      // Pause before erasing
      timer = window.setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && typedText === '') {
      setIsDeleting(false);
      setOptionIdx((prev) => (prev + 1) % textOptions.length);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, optionIdx]);

  // Subtle Mouse-Move Content Shifter (Parallax effect)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: MouseEvent) => {
    const ox = (e.clientX - window.innerWidth / 2) * 0.02; // max offset 10px
    const oy = (e.clientY - window.innerHeight / 2) * 0.02;
    setMouseOffset({ x: ox, y: oy });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={parallaxRef}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden select-none"
    >
      {/* Dynamic background lighting layers */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F3460]/20 rounded-full blur-3xl -z-10 animate-pulse duration-4000" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#E94560]/10 rounded-full blur-3xl -z-10 animate-pulse duration-6000" />

      {/* Floating abstract graphic grid blocks */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Hero central layout core */}
      <div
        className="max-w-5xl mx-auto px-6 text-center space-y-8 flex flex-col items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        }}
      >
        {/* Brand visual header badge */}
        <div className="animate-fade-in inline-flex items-center gap-2 mb-2">
          <span className="w-8 h-[1px] bg-[#FFD700]"></span>
          <span className="text-[#FFD700] text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold font-sans">
            Autumn Drop &rsquo;26
          </span>
        </div>

        {/* Playfair title with clip entry */}
        <h1 className="text-white font-serif leading-[0.9] select-text">
          <span className="block text-[60px] sm:text-[90px] lg:text-[110px] font-bold tracking-tight drop-shadow-2xl animate-scale-up">
            Obsidian
          </span>
          <span className="block text-[50px] sm:text-[80px] lg:text-[100px] font-light italic text-white/90 mt-2 tracking-wide font-serif animate-scale-up">
            Essence
          </span>
        </h1>

        {/* Dynamic Typewriter description box */}
        <div className="h-10 flex items-center justify-center">
          <p className="text-stone-400 font-mono text-xs sm:text-sm tracking-[0.2em] font-medium max-w-2xl leading-relaxed uppercase">
            {typedText}
            <span className="inline-block w-1.5 h-4 bg-[#E94560] ml-1 animate-pulse" />
          </p>
        </div>

        {/* Primary CTA double action layout */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
          <button
            onClick={onShopClick}
            className="px-10 py-4 w-52 bg-white text-black font-sans text-xs tracking-[0.25em] font-bold uppercase hover:bg-[#E94560] hover:text-white hover:shadow-[0_0_25px_rgba(233,69,96,0.3)] transition-all duration-300 transform active:scale-95 cursor-pointer shadow-lg"
          >
            Shop Collection
          </button>
          
          <button
            onClick={onExploreClick}
            className="px-10 py-4 w-52 bg-transparent text-white border border-white/25 backdrop-blur-sm font-sans text-xs tracking-[0.25em] font-bold uppercase hover:bg-white/10 hover:border-white transition-all transform active:scale-95 cursor-pointer"
          >
            Launch Lookbook
          </button>
        </div>
      </div>

      {/* Floating graphic scroll reminder */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={onExploreClick}>
        <span className="font-sans text-[10px] tracking-[0.4em] text-stone-500 uppercase">
          SCROLL TO EXPLORE
        </span>
        <ArrowDown className="w-4 h-4 text-[#E94560] animate-bounce" />
      </div>
    </section>
  );
}
