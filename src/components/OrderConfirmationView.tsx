import { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

interface OrderConfirmationViewProps {
  onContinueShopping: () => void;
  orderNumber: string;
}

export default function OrderConfirmationView({
  onContinueShopping,
  orderNumber,
}: OrderConfirmationViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Watch for resize events
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Establish colorful custom confetti particle classes
    interface ConfettiType {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    const confettis: ConfettiType[] = [];
    const colors = ['#E94560', '#0F3460', '#FFD700', '#00E676', '#E040FB', '#00B0FF'];

    // Burst 150 confettis from the center of the viewport
    for (let i = 0; i < 160; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      confettis.push({
        x: width / 2,
        y: height / 2 - 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 5, // Push upward bias
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
      });
    }

    const startTime = Date.now();

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Stop confetti calculation after 4.5 seconds
      const elapsed = Date.now() - startTime;
      if (elapsed > 4500) {
        cancelAnimationFrame(animFrame);
        return;
      }

      confettis.forEach((p) => {
        // Physics logic: gravity and wind friction
        p.vx *= 0.98;
        p.vy += 0.35; // Gravity pull

        p.x += p.vx;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - (elapsed - 1500) / 3000); // Fade gently after 1.5s

        // Drawing shapes
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Draw rectangle or triangle dynamically
        if (p.size % 2 === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      animFrame = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden select-none">
      
      {/* Background visual layering */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />

      <div className="max-w-xl mx-auto px-6 text-center space-y-8 z-20 flex flex-col items-center justify-center animate-scale-up">
        
        {/* ANIMATED SVG CHECKMARK DRAW */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <svg className="w-12 h-12 text-emerald-400 stroke-current animate-checkmark" fill="none" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" className="checkmark-poly" />
          </svg>
        </div>

        <div className="space-y-3.5">
          <div className="inline-flex items-center gap-1.5 text-[#FFD700] bg-[#FFD700]/5 border border-[#FFD700]/15 px-3.5 py-1 text-[10px] font-mono tracking-widest uppercase font-bold rounded-none">
            <Sparkles className="w-3.5 h-3.5" />
            Transaction Cleared Successfully
          </div>
          
          <h2 className="text-white font-serif text-3xl sm:text-4xl font-semibold tracking-wide uppercase leading-tight">
            Order Dispatched!
          </h2>
          
          <p className="text-stone-500 text-xs sm:text-sm font-sans tracking-widest uppercase mb-1">
            THANK YOU FOR SUPPORTING OBSIDIAN COUTURE
          </p>
        </div>

        {/* RECEIPT SUMMARY CARD */}
        <div className="bg-[#11111A]/60 border border-white/5 p-5 w-full uppercase max-w-sm font-mono text-xs text-stone-400 space-y-3.5 backdrop-blur-md">
          <div className="flex justify-between border-b border-white/5 pb-2.5">
            <span>RECEIPT CODES:</span>
            <span className="text-white font-bold tracking-wider">{orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2.5">
            <span>METHOD:</span>
            <span className="text-white">COURIER DISPATCH</span>
          </div>
          <div className="flex justify-between">
            <span>ARRIVAL ESTIMATE:</span>
            <span className="text-emerald-400 font-bold">3 - 5 BUSY DAYS</span>
          </div>
        </div>

        <p className="text-stone-500 text-xs uppercase max-w-sm leading-relaxed font-sans tracking-wide">
          An automated invoice and real-time delivery tracking credentials have been transmitted directly to your secure email inbox address.
        </p>

        {/* CTA TO SHOP */}
        <button
          onClick={onContinueShopping}
          className="px-8 py-4 bg-white text-black font-sans text-xs tracking-[0.25em] font-bold uppercase hover:bg-[#E94560] hover:text-white hover:shadow-[0_0_20px_rgba(233,69,96,0.3)] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
        >
          <span>Continue Styling</span>
          <ArrowRight className="w-4 h-4 animate-pulse" />
        </button>
      </div>
    </div>
  );
}
