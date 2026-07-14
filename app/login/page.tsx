'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, EnvelopeSimple, Eye, EyeSlash, Key, PaperPlaneTilt } from '@phosphor-icons/react';
import { useApp } from '@/components/app-provider';
import { AuthShell } from '@/components/auth/auth-shell';
import { expectedRoleForRoute, getTestingLoginForRole, isTestingCredentialMatch } from '@/lib/auth-config';
import { homeForRole } from '@/lib/roles';
import { supabase } from '@/lib/supabase';
import type { Role } from '@/types';

const PARTNER_ROLES = ['admin', 'organizer', 'organiser', 'venue-owner', 'referee'] as const;
const roleMeta: Record<string, { eyebrow: string; title: string; copy: string }> = {
  player: { eyebrow: 'Player access', title: 'Claim your player pass.', copy: 'One secure email link. Existing players sign in; new players join automatically.' },
  organizer: { eyebrow: 'Organizer workspace', title: 'Enter event control.', copy: 'Manage events, registrations, fixtures, scores, and your organization.' },
  organiser: { eyebrow: 'Organizer workspace', title: 'Enter event control.', copy: 'Manage events, registrations, fixtures, scores, and your organization.' },
  'venue-owner': { eyebrow: 'Venue workspace', title: 'Open venue control.', copy: 'Update courts, availability, venue operations, and incoming reservations.' },
  admin: { eyebrow: 'Platform operations', title: 'Enter command center.', copy: 'Access approvals, moderation, users, organizations, and platform activity.' },
  referee: { eyebrow: 'Referee workspace', title: 'Take the scoreboard.', copy: 'Open assigned matches, record live points, and complete official scorecards.' },
};

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-dvh bg-canvas" />}><LoginContent /></Suspense>;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function LoginContent() {
  const { login } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const isPartner = role && (PARTNER_ROLES as readonly string[]).includes(role);
  const resolvedRole = expectedRoleForRoute(role);
  const meta = useMemo(() => (role && roleMeta[role] ? roleMeta[role] : roleMeta.player), [role]);

  return isPartner ? (
    <PartnerLogin role={resolvedRole} meta={meta} />
  ) : (
    <PlayerMagicLink onLocalLogin={login} router={router} meta={meta} />
  );
}

function FieldShell({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-accent">{icon}</span>
      {children}
    </div>
  );
}

function PartnerLogin({ role, meta }: { role: Role | 'player'; meta: { eyebrow: string; title: string; copy: string } }) {
  const { login } = useApp();
  const router = useRouter();
  const testingCredential = getTestingLoginForRole(role);
  const [email, setEmail] = useState<string>(testingCredential.email);
  const [password, setPassword] = useState<string>(testingCredential.password);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    if (!isTestingCredentialMatch(email, password, role)) {
      setLoading(false);
      setMessage(`Use the current testing credential: ${testingCredential.email}.`);
      return;
    }
    const result = login(testingCredential.email, testingCredential.name, role);
    setLoading(false);
    if (result.ok) router.push(homeForRole(result.role ?? 'user'));
    else setMessage(result.message);
  }

  return (
    <AuthShell eyebrow={meta.eyebrow} title={meta.title} copy={meta.copy} footer={<Link href="/partner-login" className="font-semibold text-accent hover:underline">Choose another workspace</Link>}>
      <div className="mb-5 rounded-2xl border border-accent/20 bg-accentSofter p-4">
        <p className="text-xs font-bold text-accentDeep">Testing access is prefilled</p>
        <p className="mt-1 text-xs leading-5 text-muted">Use the credentials shown below while production authentication is being connected.</p>
      </div>
      <form className="space-y-5" onSubmit={signIn}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Email address</label>
          <FieldShell icon={<EnvelopeSimple size={19} weight="bold" />}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="!min-h-12 !rounded-none !border-ink/25 !bg-transparent !pl-11 focus:!border-accent" autoComplete="email" /></FieldShell>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Password</label>
          <div className="relative">
            <FieldShell icon={<Key size={19} weight="bold" />}><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required className="!min-h-12 !rounded-none !border-ink/25 !bg-transparent !pl-11 !pr-12 focus:!border-accent" autoComplete="current-password" /></FieldShell>
            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-canvasAlt hover:text-ink">{showPassword ? <EyeSlash size={19} /> : <Eye size={19} />}</button>
          </div>
        </div>
        {message ? <p role="alert" className="border-l-4 border-red-600 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{message}</p> : null}
        <button type="submit" className="lime-btn min-h-12 w-full !rounded-none !border-2 !border-ink" disabled={loading}>{loading ? 'Signing in…' : 'Sign in securely'}</button>
      </form>
    </AuthShell>
  );
}

function PlayerMagicLink({ meta, onLocalLogin, router }: { meta: { eyebrow: string; title: string; copy: string }; onLocalLogin: ReturnType<typeof useApp>['login']; router: ReturnType<typeof useRouter> }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent('/games')}` : undefined;
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
    const result = onLocalLogin(cleaned, cleaned.split('@')[0] ?? 'Player', 'player');
    if (!result.ok) {
      setStatus('error');
      setMessage(result.message);
      return;
    }
    router.push('/games');
  }

  return (
    <AuthShell eyebrow={meta.eyebrow} title={meta.title} copy={meta.copy} footer={<>Managing a venue or event? <Link href="/partner-login" className="font-semibold text-accent hover:underline">Partner login</Link></>}>
      {status === 'sent' ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-accent/25 bg-accentSofter p-5">
            <CheckCircle size={34} weight="fill" className="text-accent" />
            <h2 className="mt-4 text-xl font-semibold text-ink">Check your inbox</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{message} Open it on this device to finish signing in.</p>
          </div>
          <button onClick={() => { setStatus('idle'); setMessage(''); }} className="secondary-btn min-h-12 w-full !rounded-none">Use another email</button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={sendMagicLink} noValidate>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Email address</label>
            <FieldShell icon={<EnvelopeSimple size={19} weight="bold" />}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoFocus className="!min-h-12 !rounded-none !border-ink/25 !bg-transparent !pl-11 focus:!border-accent" autoComplete="email" aria-describedby={status === 'error' ? 'email-error' : undefined} /></FieldShell>
            <p className="mt-2 text-xs leading-5 text-muted">No password required. New accounts are created automatically.</p>
          </div>
          {status === 'error' && message ? <p id="email-error" role="alert" className="border-l-4 border-red-600 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{message}</p> : null}
          <button type="submit" className="lime-btn min-h-12 w-full !rounded-none !border-2 !border-ink" disabled={status === 'sending'}><PaperPlaneTilt size={19} weight="bold" /> {status === 'sending' ? 'Sending link…' : 'Email me a sign-in link'}</button>
          <div className="flex items-center gap-3"><span className="h-px flex-1 bg-line" /><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-mutedSoft">Demo environment</span><span className="h-px flex-1 bg-line" /></div>
          <button type="button" onClick={devSkip} className="secondary-btn min-h-12 w-full !rounded-none">Continue with demo access</button>
        </form>
      )}
    </AuthShell>
  );
}
