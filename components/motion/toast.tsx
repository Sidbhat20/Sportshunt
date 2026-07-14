'use client';

/**
 * App-wide toast system. Replaces scattered inline message boxes with a single
 * animated, auto-dismissing stack in the bottom corner. Mounted once in
 * AppProvider; any client component can call useToast().
 */

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'error' | 'info';
type ToastItem = { id: number; message: string; tone: ToastTone };

type ToastApi = {
  toast: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-accent/30',
  error: 'border-red-200',
  info: 'border-line',
};
const TONE_DOT: Record<ToastTone, string> = {
  success: 'bg-accent text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-ink text-white',
};
const TONE_ICON: Record<ToastTone, string> = { success: '✓', error: '!', info: 'i' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const reduce = useReducedMotion();

  const remove = useCallback(
    (id: number) => setItems((current) => current.filter((item) => item.id !== id)),
    [],
  );

  const toast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = (counter.current += 1);
      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => remove(id), 3800);
    },
    [remove],
  );

  const api: ToastApi = {
    toast,
    success: (message) => toast(message, 'success'),
    error: (message) => toast(message, 'error'),
    info: (message) => toast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[150] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={() => remove(item.id)}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm cursor-pointer items-start gap-3 rounded-2xl border bg-white px-4 py-3 text-ink shadow-card',
                TONE_STYLES[item.tone],
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                  TONE_DOT[item.tone],
                )}
              >
                {TONE_ICON[item.tone]}
              </span>
              <p className="text-sm font-medium leading-6">{item.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
