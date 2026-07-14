'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { PublicHeader } from '@/components/layouts/public-header';
import { SurfaceCard } from '@/components/ui';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  );
}

function Callback() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useApp();

  const [status, setStatus] = useState<'working' | 'error'>('working');
  const [message, setMessage] = useState('Finalising your sign-in…');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (!isSupabaseConfigured) {
          throw new Error('Email sign-in is not configured for this deployment.');
        }
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorDescription =
          url.searchParams.get('error_description') ?? url.hash.match(/error_description=([^&]+)/)?.[1];

        if (errorDescription) {
          throw new Error(decodeURIComponent(errorDescription));
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        let sessionResult = await supabase.auth.getSession();
        if (!sessionResult.data.session) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          sessionResult = await supabase.auth.getSession();
        }

        const session = sessionResult.data.session;
        if (!session) {
          throw new Error('Magic link is invalid or has expired. Please request a new one.');
        }

        const supabaseUser = session.user;
        const email = (supabaseUser.email ?? '').trim().toLowerCase();
        if (!email) {
          throw new Error('Could not read your email from Supabase. Please try again.');
        }

        const metaName =
          (supabaseUser.user_metadata?.full_name as string | undefined) ||
          (supabaseUser.user_metadata?.name as string | undefined) ||
          email.split('@')[0];

        const result = login(email, metaName ?? 'Player', 'player');
        if (!result.ok) {
          throw new Error(result.message);
        }

        if (cancelled) return;
        const redirect = params.get('redirect') || '/games';
        const safeRedirect = redirect.startsWith('/') ? redirect : '/games';
        router.replace(safeRedirect);
      } catch (caught) {
        if (cancelled) return;
        const text = caught instanceof Error ? caught.message : 'Sign-in failed.';
        setStatus('error');
        setMessage(text);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [login, params, router]);

  return (
    <>
      <PublicHeader />
      <main className="page-shell grid place-items-center py-20">
        <SurfaceCard className="w-full max-w-md text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Magic link
          </p>
          <h1 className="mt-2 font-display text-2xl text-ink">
            {status === 'working' ? 'Signing you in…' : 'Sign-in failed'}
          </h1>
          <p className="mt-3 text-sm text-muted">{message}</p>
          {status === 'error' ? (
            <Link href="/login?role=player" className="primary-btn mt-6 w-full justify-center">
              Back to login
            </Link>
          ) : null}
        </SurfaceCard>
      </main>
    </>
  );
}
