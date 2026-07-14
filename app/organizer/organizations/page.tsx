'use client';

import { FormEvent, useState } from 'react';
import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';

export default function OrganizerOrganizationsPage() {
  const { state, session, createOrganization, myOrganizations, setCurrentOrganization } = useApp();
  const [message, setMessage] = useState('');
  if (!session) return null;

  const allMineOrPending = state.organizations.filter(
    (organization) =>
      organization.ownerId === session.id ||
      organization.members.some((member) => member.userId === session.id),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = createOrganization({
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      country: String(formData.get('country') ?? ''),
    });
    setMessage(result.message);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        copy="Operate through one or more organizations. Each one is reviewed by super admin before going live."
      />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <h2 className="text-lg font-semibold text-ink">Create organization</h2>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Name
              </label>
              <input name="name" placeholder="Breathe, Velocity, etc." required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Email
                </label>
                <input name="email" type="email" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Phone
                </label>
                <input name="phone" required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Country
              </label>
              <input name="country" placeholder="India" required />
            </div>
            <button className="primary-btn w-full">Submit for approval</button>
          </form>
          {message ? (
            <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-xs font-medium text-accentDeep">
              {message}
            </p>
          ) : null}
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard className="space-y-3">
            <h2 className="text-lg font-semibold text-ink">Approved organizations</h2>
            {myOrganizations.length ? (
              myOrganizations.map((organization) => (
                <div key={organization.id} className="rounded-xl bg-canvas p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{organization.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {organization.email} • {organization.members.length} members
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill tone="success">{organization.status}</StatusPill>
                      <button
                        onClick={() => setCurrentOrganization(organization.id)}
                        className="secondary-btn"
                      >
                        Switch to
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No approved organizations"
                body="Submit one and wait for admin approval."
              />
            )}
          </SurfaceCard>

          <SurfaceCard className="space-y-3">
            <h2 className="text-lg font-semibold text-ink">All requests</h2>
            {allMineOrPending.map((organization) => (
              <div
                key={organization.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-canvas p-3"
              >
                <div>
                  <p className="font-medium text-ink">{organization.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {organization.country} • {organization.phone}
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
            ))}
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
