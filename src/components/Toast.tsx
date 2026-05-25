import React, { useEffect, useState } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

// Global hook/helper setup for ease of integration
let toastListeners: Array<(toast: ToastItem) => void> = [];

export function toast(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
  const newToast: ToastItem = {
    id: Math.random().toString(36).substring(2, 9),
    message,
    type,
    duration,
  };
  toastListeners.forEach((listener) => listener(newToast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleNewToast = (item: ToastItem) => {
      setToasts((prev) => [...prev, item]);
    };
    toastListeners.push(handleNewToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handleNewToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-24 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void; key?: string }) {
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    const duration = item.duration || 3000;

    // Timeout to trigger the actual dismiss after the duration
    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, duration);

    // Interval to smoothly update the progress bar at ~60fps (16ms)
    const interval = 16;
    const step = (interval / duration) * 100;
    const progressTimer = setInterval(() => {
      setPercent((prev) => Math.max(0, prev - step));
    }, interval);

    return () => {
      clearTimeout(dismissTimer);
      clearInterval(progressTimer);
    };
  }, [item, onDismiss]);

  const colors = {
    success: {
      bg: 'bg-stone-900/95 border-emerald-500/30 text-white',
      accent: 'bg-emerald-500',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-stone-900/95 border-rose-500/30 text-white',
      accent: 'bg-rose-500',
      icon: (
        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-stone-900/95 border-cyan-500/30 text-white',
      accent: 'bg-cyan-500',
      icon: (
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }[item.type];

  return (
    <div
      onClick={onDismiss}
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-none border backdrop-blur-md shadow-2xl animate-slide-in cursor-pointer group transition-all duration-300 hover:-translate-x-1 ${colors.bg}`}
      style={{
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.7)',
      }}
    >
      <div className="flex items-center gap-4 px-4 py-3.5">
        <div className="flex-shrink-0">{colors.icon}</div>
        <p className="flex-grow font-sans text-sm tracking-wide font-medium">{item.message}</p>
        <button className="flex-shrink-0 text-stone-500 group-hover:text-white transition-colors duration-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="w-full h-[3px] bg-stone-900">
        <div
          className={`h-full opacity-80 ${colors.accent}`}
          style={{ width: `${percent}%`, transition: 'width 10ms linear' }}
        />
      </div>
    </div>
  );
}
