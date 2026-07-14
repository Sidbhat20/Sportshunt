'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle, EnvelopeSimple, PaperPlaneTilt, X } from '@phosphor-icons/react';
import { useApp } from '@/components/app-provider';
import { SPRING_SOFT } from '@/components/motion/primitives';
import { supabase } from '@/lib/supabase';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function PlayerAuthModal({ open, onClose, title = 'Join the game' }: { open: boolean; onClose: () => void; title?: string }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setMessage('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [onClose, open]);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const cleaned = email.trim().toLowerCase();
    if (!isValidEmail(cleaned)) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }
    setStatus('sending');
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}` : undefined;
    const { error } = await supabase.auth.signInWithOtp({ email: cleaned, options: { shouldCreateUser: true, emailRedirectTo: redirectTo } });
    if (error) {
      setStatus('error');
      setMessage(error.message || 'We could not send the sign-in link. Try again.');
      return;
    }
    setStatus('sent');
    setMessage(`We sent a secure link to ${cleaned}.`);
  }

  function devSkip() {
    const cleaned = email.trim().toLowerCase();
    if (!isValidEmail(cleaned)) {
      setStatus('error');
      setMessage('Enter your email before using demo access.');
      return;
    }
    const result = login(cleaned, cleaned.split('@')[0] ?? 'Player', 'player');
    if (!result.ok) {
      setStatus('error');
      setMessage(result.message);
      return;
    }
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:px-4 sm:py-6" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} role="dialog" aria-modal="true" aria-labelledby="player-auth-title">
          <motion.button aria-label="Close sign-in" className="absolute inset-0 h-full w-full bg-ink/65 backdrop-blur-sm" onClick={onClose} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-line bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-card sm:max-w-md sm:rounded-[2rem] sm:p-7" initial={reduce ? false : { opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 16 }} transition={reduce ? { duration: 0.15 } : SPRING_SOFT}>
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Player access</p>
                <h2 id="player-auth-title" className="display mt-2 font-display text-3xl text-ink">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">Sign in or create your player account with one secure email link.</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-accent hover:text-ink"><X size={20} weight="bold" /></button>
            </div>

            {status === 'sent' ? (
              <div className="mt-7 space-y-4">
                <div className="rounded-2xl border border-accent/25 bg-accentSofter p-5"><CheckCircle size={32} weight="fill" className="text-accent" /><p className="mt-3 font-semibold text-ink">Check your inbox</p><p className="mt-1 text-sm leading-6 text-muted">{message} Open it on this device to continue.</p></div>
                <button onClick={() => { setStatus('idle'); setMessage(''); }} className="secondary-btn min-h-12 w-full !rounded-xl">Use another email</button>
              </div>
            ) : (
              <form className="mt-7 space-y-4" onSubmit={sendMagicLink} noValidate>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">Email address</label>
                  <div className="relative"><EnvelopeSimple size={19} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoFocus className="!min-h-12 !pl-11" autoComplete="email" /></div>
                  <p className="mt-2 text-xs text-muted">No password required.</p>
                </div>
                {status === 'error' && message ? <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{message}</p> : null}
                <button type="submit" className="accent-btn min-h-12 w-full !rounded-xl" disabled={status === 'sending'}><PaperPlaneTilt size={18} weight="bold" /> {status === 'sending' ? 'Sending link…' : 'Email me a sign-in link'}</button>
                <button type="button" onClick={devSkip} className="ghost-btn min-h-11 w-full">Continue with demo access</button>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
