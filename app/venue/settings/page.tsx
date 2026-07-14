'use client';

import { useApp } from '@/components/app-provider';
import { PageHeader, SurfaceCard } from '@/components/ui';

export default function VenueSettingsPage() {
  const { session } = useApp();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        copy="Account and venue identity. Editing connects to admin review."
      />

      <SurfaceCard>
        <h2 className="text-lg font-semibold text-ink">Account</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-canvas p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">Name</p>
            <p className="mt-1 font-medium text-ink">{session.name}</p>
          </div>
          <div className="rounded-xl bg-canvas p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">Email</p>
            <p className="mt-1 font-medium text-ink">{session.email}</p>
          </div>
          <div className="rounded-xl bg-canvas p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">City</p>
            <p className="mt-1 font-medium text-ink">{session.city}</p>
          </div>
          <div className="rounded-xl bg-canvas p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">Role</p>
            <p className="mt-1 font-medium capitalize text-ink">{session.role.replace('_', ' ')}</p>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
