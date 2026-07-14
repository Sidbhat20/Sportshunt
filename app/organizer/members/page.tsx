'use client';

import { FormEvent, useState } from 'react';
import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';

export default function OrganizerMembersPage() {
  const { currentOrganization, inviteMember, updateMemberRole, removeMember } = useApp();
  const [message, setMessage] = useState('');

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <PageHeader title="Members" copy="Pick or create an organization to manage its members." />
        <EmptyState title="No organization selected" body="Use the Organizations tab." />
      </div>
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentOrganization) return;
    const data = new FormData(event.currentTarget);
    const result = inviteMember(currentOrganization.id, {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      role: String(data.get('role') ?? 'viewer') as 'admin' | 'manager' | 'viewer',
    });
    setMessage(result.message);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Members" copy={`Manage who can access ${currentOrganization.name}.`} />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard>
          <h2 className="text-lg font-semibold text-ink">Invite member</h2>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Full name
              </label>
              <input name="name" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Email
              </label>
              <input name="email" type="email" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Role
              </label>
              <select name="role" defaultValue="viewer">
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button className="primary-btn w-full">Send invite</button>
          </form>
          {message ? (
            <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-xs font-medium text-accentDeep">
              {message}
            </p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">Members list</h2>
          {currentOrganization.members.map((member) => (
            <div key={member.id} className="rounded-xl bg-canvas p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{member.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{member.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={member.status === 'active' ? 'success' : 'warning'}>
                    {member.status}
                  </StatusPill>
                  <select
                    value={member.role}
                    onChange={(event) =>
                      updateMemberRole(
                        currentOrganization.id,
                        member.id,
                        event.target.value as 'admin' | 'manager' | 'viewer',
                      )
                    }
                    className="max-w-32 rounded-xl"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => removeMember(currentOrganization.id, member.id)}
                    className="danger-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </SurfaceCard>
      </div>
    </div>
  );
}
