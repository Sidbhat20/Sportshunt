'use client';

import { useParams } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { EmptyState, StatusPill, SurfaceCard } from '@/components/ui';
import { formatMoney } from '@/lib/utils';

export default function TournamentPaymentsPage() {
  const params = useParams<{ id: string }>();
  const { state } = useApp();
  const tournament = state.tournaments.find((item) => item.id === params.id);
  if (!tournament) return null;

  const rows = tournament.registrations.map((registration) => {
    const event = tournament.events.find((item) => item.id === registration.eventId);
    return { ...registration, eventName: event?.name ?? 'Unknown', entryFee: event?.entryFee ?? 0 };
  });
  const totalRevenue = rows
    .filter((row) => row.paymentStatus === 'paid')
    .reduce((sum, row) => sum + row.entryFee, 0);

  return (
    <SurfaceCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Payments</h2>
        <StatusPill tone="accent">Total revenue {formatMoney(totalRevenue)}</StatusPill>
      </div>
      {rows.length ? (
        rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-2 rounded-xl bg-canvas p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-ink">{row.participantName}</p>
              <p className="text-xs text-muted">{row.eventName}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-ink">{formatMoney(row.entryFee)}</span>
              <StatusPill tone={row.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {row.paymentStatus}
              </StatusPill>
            </div>
          </div>
        ))
      ) : (
        <EmptyState
          title="No registrations yet"
          body="Once players register, payments appear here."
        />
      )}
    </SurfaceCard>
  );
}
