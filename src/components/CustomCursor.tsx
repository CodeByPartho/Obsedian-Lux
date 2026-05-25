import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    dotX: 0, dotY: 0,
    ringX: 0, ringY: 0,
    targetX: 0, targetY: 0,
    hoveredType: '' as '' | 'link' | 'view' | 'buy' | 'add' | 'drag',
  });

  const [hoverState, setHoverState] = useState<'' | 'link' | 'view' | 'buy' | 'add' | 'drag'>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      stateRef.current.targetX = e.clientX;
      stateRef.current.targetY = e.clientY;
      setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    // Scan the page for interactive targets
    const updateHoverEvents = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, [role="button"], input, select, textarea, .cursor-target-view, .cursor-target-buy, .cursor-target-add'
      );

      interactiveElements.forEach((el) => {
        const handleMouseEnter = () => {
          if (el.classList.contains('cursor-target-view')) {
            stateRef.current.hoveredType = 'view';
          } else if (el.classList.contains('cursor-target-buy')) {
            stateRef.current.hoveredType = 'buy';
          } else if (el.classList.contains('cursor-target-add')) {
            stateRef.current.hoveredType = 'add';
          } else {
            stateRef.current.hoveredType = 'link';
          }
          setHoverState(stateRef.current.hoveredType);
        };

        const handleMouseLeave = () => {
          stateRef.current.hoveredType = '';
          setHoverState('');
        };

        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    // Run initially
    updateHoverEvents();

    // Re-check periodically since items might inject dynamically
    const mutationObserver = new MutationObserver(updateHoverEvents);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Performance optimized requestAnimationFrame loop
    let animFrame: number;
    const tick = () => {
      const state = stateRef.current;
      
      // Instant mouse dot follow
      state.dotX += (state.targetX - state.dotX);
      state.dotY += (state.targetY - state.dotY);
      
      // Lerp/lag follow for outer ring
      state.ringX += (state.targetX - state.ringX) * 0.15;
      state.ringY += (state.targetY - state.ringY) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${state.dotX}px, ${state.dotY}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${state.ringX}px, ${state.ringY}px, 0)`;
      }

      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      mutationObserver.disconnect();
      cancelAnimationFrame(animFrame);
    };
  }, []);

  if (!isVisible) return null;

  const isTextCursor = ['view', 'buy', 'add', 'drag'].includes(hoverState);

  return (
    <>
      {/* Tiny internal target pointer */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 bg-[#E94560] rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${
          hoverState ? 'scale-0' : 'scale-100'
        }`}
      />

      {/* Lag follower ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[99998] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-out border font-sans font-bold uppercase tracking-wider text-[9px] ${
          isTextCursor
            ? 'w-16 h-16 bg-[#E94560] text-white border-transparent shadow-[0_0_20px_rgba(233,69,96,0.6)]'
            : hoverState === 'link'
            ? 'w-12 h-12 bg-white/10 border-white/40 backdrop-blur-[1px] shadow-[0_0_12px_rgba(255,255,255,0.2)]'
            : 'w-8 h-8 bg-transparent border-[#E94560]/50 shadow-[0_0_8px_rgba(233,69,96,0.15)]'
        }`}
      >
        {isTextCursor && (
          <span className="animate-fade-in text-[10px]">
            {hoverState}
          </span>
        )}
      </div>
    </>
  );
}
