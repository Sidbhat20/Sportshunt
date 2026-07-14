'use client';

import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';

export default function AdminTournamentsPage() {
  const { state, reviewTournament, moderateTournament } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tournaments"
        copy="Approve, moderate, and adjust the lifecycle of every tournament."
      />

      <SurfaceCard className="space-y-3">
        {state.tournaments.length ? (
          state.tournaments.map((tournament) => (
            <div key={tournament.id} className="rounded-xl bg-canvas p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{tournament.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {tournament.sport} • {tournament.venue} • {tournament.categories.length}{' '}
                    categories • {tournament.events.length} events •{' '}
                    {tournament.registrations.length} registrations
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Public: {tournament.publicStatus} • Lifecycle: {tournament.status} • Matches:{' '}
                    {tournament.matches.length}
                  </p>
                  {tournament.categories.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tournament.categories.map((category) => (
                        <StatusPill key={category} tone="accent">
                          {category}
                        </StatusPill>
                      ))}
                    </div>
                  ) : null}
                </div>
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
                  <StatusPill tone={tournament.publicStatus === 'live' ? 'live' : 'default'}>
                    {tournament.publicStatus}
                  </StatusPill>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tournament.approvalStatus === 'pending' ? (
                  <>
                    <button
                      onClick={() => reviewTournament(tournament.id, 'approved')}
                      className="primary-btn"
                    >
                      Approve & go live
                    </button>
                    <button
                      onClick={() => reviewTournament(tournament.id, 'rejected')}
                      className="danger-btn"
                    >
                      Reject
                    </button>
                  </>
                ) : null}
                <button
                  onClick={() => moderateTournament(tournament.id, 'upcoming')}
                  className="secondary-btn"
                >
                  Upcoming
                </button>
                <button
                  onClick={() => moderateTournament(tournament.id, 'ongoing')}
                  className="secondary-btn"
                >
                  Ongoing
                </button>
                <button
                  onClick={() => moderateTournament(tournament.id, 'completed')}
                  className="secondary-btn"
                >
                  Completed
                </button>
                <button
                  onClick={() => moderateTournament(tournament.id, 'suspended')}
                  className="danger-btn"
                >
                  Suspend
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No tournaments yet"
            body="Submitted tournaments appear here for review."
          />
        )}
      </SurfaceCard>
    </div>
  );
}
