'use client';

import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';

export default function AdminOrganizationsPage() {
  const { state, reviewOrganization } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        copy="See every organization, ownership details, approval state, and member count in one place."
      />

      <SurfaceCard className="space-y-3">
        {state.organizations.length ? (
          state.organizations.map((organization) => (
            <div key={organization.id} className="rounded-xl bg-canvas p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{organization.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {organization.email} • {organization.phone} • {organization.country}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Owner ID: {organization.ownerId} • {organization.members.length} members
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
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

              {organization.members.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {organization.members.map((member) => (
                    <StatusPill
                      key={member.id}
                      tone={member.status === 'active' ? 'success' : 'warning'}
                    >
                      {member.name} • {member.role}
                    </StatusPill>
                  ))}
                </div>
              ) : null}

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
          <EmptyState
            title="No organizations yet"
            body="Organizations will appear here once created."
          />
        )}
      </SurfaceCard>
    </div>
  );
}
