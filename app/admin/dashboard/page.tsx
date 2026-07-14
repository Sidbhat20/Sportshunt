'use client';

import Link from 'next/link';
import { useApp } from '@/components/app-provider';
import { PageHeader, StatCard, StatusPill, SurfaceCard } from '@/components/ui';

export default function AdminDashboardPage() {
  const { state } = useApp();

  const pendingOrgs = state.organizations.filter(
    (organization) => organization.status === 'pending',
  ).length;
  const pendingTournaments = state.tournaments.filter(
    (tournament) => tournament.approvalStatus === 'pending',
  ).length;
  const pendingTurfs = state.turfs.filter((turf) => turf.moderationStatus === 'pending').length;
  const pendingApplications = state.applications.filter(
    (application) => application.status === 'pending',
  ).length;
  const liveGames = state.games.filter((game) => game.status === 'open').length;
  const liveTournaments = state.tournaments.filter((tournament) => tournament.status === 'ongoing');
  const completedTournaments = state.tournaments.filter(
    (tournament) => tournament.status === 'completed',
  );
  const recentTournaments = state.tournaments.slice(0, 5);
  const organizations = state.organizations.slice(0, 5);
  const recentUsers = state.users.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Super admin"
        copy="Platform-wide trust, moderation, approvals, and live operations."
      />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
        <StatCard label="Users" value={state.users.length} />
        <StatCard label="Organizations" value={state.organizations.length} />
        <StatCard label="Pending orgs" value={pendingOrgs} tone="warning" />
        <StatCard label="Pending tournaments" value={pendingTournaments} tone="warning" />
        <StatCard label="Live tournaments" value={liveTournaments.length} tone="accent" />
        <StatCard label="Completed tournaments" value={completedTournaments.length} />
        <StatCard label="Live hunts" value={liveGames} tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SurfaceCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Approval queue</h2>
            <Link
              href="/admin/approvals"
              className="text-sm font-medium text-accent hover:underline"
            >
              Open queue
            </Link>
          </div>
          <div className="grid gap-3">
            <QueueItem label="Organizations" hint="Awaiting review" value={pendingOrgs} />
            <QueueItem label="Venues" hint="Turf moderation" value={pendingTurfs} />
            <QueueItem
              label="Role applications"
              hint="Venue / organizer requests"
              value={pendingApplications}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Organizations</h2>
            <Link
              href="/admin/organizations"
              className="text-sm font-medium text-accent hover:underline"
            >
              All organizations
            </Link>
          </div>
          {organizations.length ? (
            organizations.map((organization) => (
              <div key={organization.id} className="rounded-xl bg-canvas p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{organization.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {organization.email} • {organization.members.length} members
                    </p>
                  </div>
                  <StatusPill
                    tone={
                      organization.status === 'approved'
                        ? 'success'
                        : organization.status === 'pending'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {organization.status}
                  </StatusPill>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No organizations yet.</p>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Recent tournaments</h2>
            <Link
              href="/admin/tournaments"
              className="text-sm font-medium text-accent hover:underline"
            >
              All tournaments
            </Link>
          </div>
          {recentTournaments.length ? (
            recentTournaments.map((tournament) => (
              <div key={tournament.id} className="rounded-xl bg-canvas p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{tournament.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {tournament.status} • {tournament.events.length} events •{' '}
                      {tournament.registrations.length} registrations
                    </p>
                  </div>
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
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No tournaments yet.</p>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">All users snapshot</h2>
          <Link href="/admin/users" className="text-sm font-medium text-accent hover:underline">
            All users
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {recentUsers.length ? (
            recentUsers.map((user) => (
              <div key={user.id} className="rounded-xl bg-canvas p-3">
                <p className="font-medium text-ink">{user.name}</p>
                <p className="mt-0.5 text-xs text-muted">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusPill tone="accent">{user.role.replace('_', ' ')}</StatusPill>
                  <StatusPill
                    tone={
                      user.status === 'active'
                        ? 'success'
                        : user.status === 'suspended'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {user.status}
                  </StatusPill>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No users yet.</p>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}

function QueueItem({ label, hint, value }: { label: string; hint: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-canvas p-3">
      <div>
        <p className="font-medium text-ink">{label}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <StatusPill tone={value ? 'warning' : 'success'}>{value}</StatusPill>
    </div>
  );
}
