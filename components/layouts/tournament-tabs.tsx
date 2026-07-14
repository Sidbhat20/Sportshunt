'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { StatusPill, SurfaceCard } from '@/components/ui';
import { Tournament } from '@/types';

const tabs = [
  { key: 'basic-info', label: 'Basic info' },
  { key: 'events', label: 'Events' },
  { key: 'players', label: 'Players' },
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'matches', label: 'Matches' },
  { key: 'payments', label: 'Payments' },
  { key: 'notifications', label: 'Notifications' },
];

export function TournamentTabs({ tournament }: { tournament: Tournament }) {
  const pathname = usePathname();
  const base = `/organizer/tournaments/${tournament.id}`;

  return (
    <SurfaceCard className="flex flex-wrap items-center justify-between gap-4 p-3">
      <nav className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const href = `${base}/${tab.key}`;
          const active = pathname === href;
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                active
                  ? 'bg-accent text-white shadow-soft'
                  : 'text-muted hover:bg-canvas hover:text-ink',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-wrap gap-2">
        <StatusPill
          tone={
            tournament.approvalStatus === 'approved'
              ? 'success'
              : tournament.approvalStatus === 'pending'
                ? 'warning'
                : 'danger'
          }
        >
          {tournament.approvalStatus}
        </StatusPill>
        <StatusPill tone="accent">{tournament.status}</StatusPill>
      </div>
    </SurfaceCard>
  );
}
