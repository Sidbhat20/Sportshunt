'use client';

import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';

export default function AdminApprovalsPage() {
  const { state, reviewApplication, reviewOrganization, reviewTournament, reviewTurf } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        copy="Review pending organizations, venues, and role applications."
      />

      <SurfaceCard className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Organizations</h2>
        {state.organizations.length ? (
          state.organizations.map((organization) => (
            <div key={organization.id} className="rounded-xl bg-canvas p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{organization.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {organization.email} • {organization.country}
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
              {organization.status === 'pending' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => reviewOrganization(organization.id, 'approved')}
                    className="primary-btn"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reviewOrganization(organization.id, 'rejected')}
                    className="danger-btn"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <EmptyState title="No organizations" body="Submitted organizations will appear here." />
        )}
      </SurfaceCard>

      <SurfaceCard className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Pending tournament submissions</h2>
        {state.tournaments.filter((tournament) => tournament.approvalStatus === 'pending')
          .length ? (
          state.tournaments
            .filter((tournament) => tournament.approvalStatus === 'pending')
            .map((tournament) => (
              <div key={tournament.id} className="rounded-xl bg-canvas p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{tournament.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {tournament.categories.length} categories • {tournament.events.length} events
                      • {tournament.venue}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => reviewTournament(tournament.id, 'approved')}
                      className="primary-btn"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reviewTournament(tournament.id, 'rejected')}
                      className="danger-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <EmptyState title="No pending tournaments" body="All clear." />
        )}
      </SurfaceCard>

      <SurfaceCard className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Pending venue submissions</h2>
        {state.turfs.filter((turf) => turf.moderationStatus === 'pending').length ? (
          state.turfs
            .filter((turf) => turf.moderationStatus === 'pending')
            .map((turf) => (
              <div key={turf.id} className="rounded-xl bg-canvas p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{turf.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {turf.location} • {turf.sport}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => reviewTurf(turf.id, 'approved')} className="primary-btn">
                      Approve
                    </button>
                    <button onClick={() => reviewTurf(turf.id, 'rejected')} className="danger-btn">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <EmptyState title="No pending venues" body="All clear." />
        )}
      </SurfaceCard>

      <SurfaceCard className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Role applications</h2>
        {state.applications.length ? (
          state.applications.map((application) => (
            <div key={application.id} className="rounded-xl bg-canvas p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium capitalize text-ink">{application.type} application</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {application.userName} • {application.userEmail}
                  </p>
                </div>
                <StatusPill
                  tone={
                    application.status === 'approved'
                      ? 'success'
                      : application.status === 'pending'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {application.status}
                </StatusPill>
              </div>
              {application.status === 'pending' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => reviewApplication(application.id, 'approved')}
                    className="primary-btn"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reviewApplication(application.id, 'rejected')}
                    className="danger-btn"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <EmptyState
            title="No applications"
            body="Player upgrades to organizer / venue will appear here."
          />
        )}
      </SurfaceCard>
    </div>
  );
}
