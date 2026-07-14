'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { APP_ROUTES, homeForRole } from '@/lib/routes';

export function LegacyRedirect({ fallback = APP_ROUTES.home }: { fallback?: string }) {
  const router = useRouter();
  const { ready, session } = useApp();

  useEffect(() => {
    if (!ready) return;
    router.replace(session ? homeForRole(session.role) : fallback);
  }, [fallback, ready, router, session]);

  return (
    <div className="dash-shell">
      <div className="rounded-2xl border border-line bg-white p-8 text-sm text-muted shadow-soft">
        Redirecting…
      </div>
    </div>
  );
}
