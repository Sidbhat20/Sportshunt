'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { Role } from '@/types';
import { homeForRole } from '@/lib/roles';

function LoadingShell({ label }: { label: string }) {
  return (
    <div className="dash-shell">
      <div className="rounded-2xl border border-line bg-white p-8 text-sm text-muted shadow-soft">
        {label}
      </div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, session } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace('/');
  }, [ready, router, session]);

  if (!ready || !session) return <LoadingShell label="Loading your Sportshunt session…" />;
  return <>{children}</>;
}

export function RoleGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { ready, session } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session || !allow.includes(session.role)) {
      router.replace('/');
    }
  }, [allow, ready, router, session]);

  if (!ready || !session || !allow.includes(session.role)) {
    return <LoadingShell label="Checking access…" />;
  }
  return <>{children}</>;
}
