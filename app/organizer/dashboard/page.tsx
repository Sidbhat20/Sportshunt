'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useApp } from '@/components/app-provider';
import { NotificationFeed } from '@/components/notification-feed';
import { EmptyState, PageHeader, StatCard, StatusPill, SurfaceCard } from '@/components/ui';
import { formatDate, formatMoney } from '@/lib/utils';


export default function OrganizerDashboardPage() {
  const { state, currentOrganization, myOrganizations } = useApp();
  const orgTournaments = currentOrganization
    ? state.tournaments.filter((tournament) => tournament.organizationId === currentOrganization.id)
    : [];
  const allOrgTournaments = state.tournaments.filter((tournament) =>
    myOrganizations.some((organization) => organization.id === tournament.organizationId),
  );
  const liveTournaments = orgTournaments.filter(
    (item) => item.approvalStatus === 'approved' && item.publicStatus === 'live',
  );
  const pendingTournaments = orgTournaments.filter((item) => item.approvalStatus === 'pending');
  const revenue = orgTournaments.reduce(
    (sum, tournament) =>
      sum +
      tournament.registrations
        .filter((registration) => registration.paymentStatus === 'paid')
        .reduce((acc, registration) => {
          const event = tournament.events.find((item) => item.id === registration.eventId);
          return acc + (event?.entryFee ?? 0);
        }, 0),
    0,
  );
  const recentNotifications = currentOrganization
    ? state.notifications
        .filter((item) => item.organizationId === currentOrganization.id)
        .slice(0, 5)
    : [];
  const courtBoard = useMemo(() => {
    const scheduledMatches = orgTournaments
      .flatMap((tournament) =>
        tournament.matches
          .filter((match) => match.refereeAssignment)
          .map((match) => ({ match, tournament })),
      )
      .sort(
        (left, right) =>
          new Date(left.match.refereeAssignment?.createdAt ?? 0).getTime() -
          new Date(right.match.refereeAssignment?.createdAt ?? 0).getTime(),
      );

    const courts = new Map<
      string,
      {
        court: string;
        live?: (typeof scheduledMatches)[number];
        nextUp?: (typeof scheduledMatches)[number];
        completed?: (typeof scheduledMatches)[number];
      }
    >();

    scheduledMatches.forEach((entry) => {
      const court = entry.match.refereeAssignment?.court ?? 'Unassigned court';
      const current = courts.get(court) ?? { court };

      if (entry.match.status === 'live' && !current.live) current.live = entry;
      if (!current.nextUp && entry.match.status === 'scheduled') {
        current.nextUp = entry;
      }
      if (
        ['completed', 'verified'].includes(entry.match.status) &&
        (!current.completed ||
          new Date(entry.match.refereeAssignment?.createdAt ?? 0).getTime() >
            new Date(current.completed.match.refereeAssignment?.createdAt ?? 0).getTime())
      ) {
        current.completed = entry;
      }

      courts.set(court, current);
    });

    return Array.from(courts.values()).sort((left, right) => left.court.localeCompare(right.court));
  }, [orgTournaments]);

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organizer dashboard"
          copy="You don't have any approved organizations yet."
        />
        <EmptyState
          title="Create an organization"
          body="Operate as a team — every tournament lives inside an organization. Submit one for admin approval to get started."
          action={
            <Link href="/organizer/organizations" className="primary-btn">
              Create organization
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={currentOrganization.name}
        copy="Operate tournaments end-to-end. The org switcher in the top bar changes which organization you're managing."
        action={
          <Link href="/organizer/tournaments" className="primary-btn">
            Create tournament
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tournaments" value={orgTournaments.length} />
        <StatCard label="Live" value={liveTournaments.length} tone="accent" />
        <StatCard label="Pending approval" value={pendingTournaments.length} tone="warning" />
        <StatCard label="Revenue" value={formatMoney(revenue)} hint="Paid registrations only" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Tournament pipeline</h2>
            <Link
              href="/organizer/tournaments"
              className="text-sm font-medium text-accent hover:underline"
            >
              All tournaments
            </Link>
          </div>
          {orgTournaments.length ? (
            orgTournaments.slice(0, 5).map((tournament) => (
              <Link
                key={tournament.id}
                href={`/organizer/tournaments/${tournament.id}/basic-info`}
                className="block rounded-xl border border-line bg-canvas p-4 hover:border-accent"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{tournament.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {tournament.events.length} events • {tournament.registrations.length}{' '}
                      registrations • {formatDate(tournament.startDate)}
                    </p>
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
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              title="No tournaments yet"
              body="Create your first tournament from the Tournaments tab."
            />
          )}
          <p className="text-xs text-muted">
            Across all organizations: {allOrgTournaments.length} tournaments.
          </p>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Recent activity</h2>
              <p className="mt-1 text-sm text-muted">
                A quick view of what your team and tournaments have been doing.
              </p>
            </div>
            <Link href="/notifications" className="text-sm font-medium text-accent hover:underline">
              Open full feed
            </Link>
          </div>
          <NotificationFeed
            notifications={recentNotifications}
            emptyTitle="All quiet"
            emptyBody="Updates from registrations, approvals, and matches show up here."
          />
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Live court board</h2>
            <p className="mt-1 text-sm text-muted">
              Court-by-court view of live play, completed results, and the next scheduled match.
            </p>
          </div>
          <Link
            href="/organizer/tournaments"
            className="text-sm font-medium text-accent hover:underline"
          >
            Open fixtures
          </Link>
        </div>

        {courtBoard.length ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {courtBoard.map((court) => (
              <div key={court.court} className="rounded-2xl border border-line bg-canvas p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                      {court.court}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-ink">Court operations</h3>
                  </div>
                  <StatusPill tone={court.live ? 'live' : 'accent'}>
                    {court.live ? 'Live' : 'Standing by'}
                  </StatusPill>
                </div>

                <div className="mt-4 space-y-3">
                  <CourtSlot
                    label="Live"
                    tone="live"
                    entry={court.live}
                    empty="No live match on this court right now."
                  />
                  <CourtSlot
                    label="Completed"
                    tone="success"
                    entry={court.completed}
                    empty="No completed match yet."
                  />
                  <CourtSlot
                    label="Next up"
                    tone="accent"
                    entry={court.nextUp}
                    empty="No upcoming scheduled match."
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No court scheduling yet"
            body="Schedule matches in Fixtures to build a live court board for referees and organizers."
          />
        )}
      </SurfaceCard>
    </div>
  );
}

function CourtSlot({
  label,
  tone,
  entry,
  empty,
}: {
  label: string;
  tone: 'live' | 'success' | 'accent';
  entry?: {
    match: {
      participantAName?: string;
      participantBName?: string;
      roundLabel: string;
      scorecard?: { summary: string };
      scoreA?: number;
      scoreB?: number;
      refereeAssignment?: { court: string; createdAt: string };
    };
    tournament: { id: string; name: string };
  };
  empty: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
        <StatusPill tone={tone}>{entry ? label : 'Empty'}</StatusPill>
      </div>
      {entry ? (
        <>
          <p className="mt-2 font-medium text-ink">
            {entry.match.participantAName || 'TBD'} vs {entry.match.participantBName || 'TBD'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {entry.tournament.name} • {entry.match.roundLabel}
          </p>
          <p className="mt-1 text-xs text-muted">
            {entry.match.scorecard?.summary
              ? entry.match.scorecard.summary
              : typeof entry.match.scoreA === 'number' && typeof entry.match.scoreB === 'number'
                ? `${entry.match.scoreA} - ${entry.match.scoreB}`
                : entry.match.refereeAssignment?.court}
          </p>
          <Link
            href={`/organizer/tournaments/${entry.tournament.id}/fixtures`}
            className="mt-3 inline-flex text-xs font-semibold text-accent hover:underline"
          >
            Open fixture →
          </Link>
        </>
      ) : (
        <p className="mt-2 text-xs text-muted">{empty}</p>
      )}
    </div>
  );
}
