'use client';

import { useState } from 'react';
import { useApp } from '@/components/app-provider';
import { PageHeader, StatusPill, SurfaceCard } from '@/components/ui';
import { Role, UserStatus } from '@/types';

const roles: ('all' | Role)[] = [
  'all',
  'user',
  'venue_owner',
  'organizer',
  'referee',
  'super_admin',
];

export default function AdminUsersPage() {
  const { state, moderateUser } = useApp();
  const [filter, setFilter] = useState<'all' | Role>('all');
  const [query, setQuery] = useState('');

  const users = state.users.filter(
    (user) =>
      (filter === 'all' || user.role === filter) &&
      (!query ||
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        copy="Search, filter, and moderate any user account on the platform."
      />

      <SurfaceCard className="flex flex-wrap items-center gap-3 p-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={filter === role ? 'primary-btn' : 'secondary-btn'}
            >
              {role === 'all' ? 'All' : role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-xl bg-canvas p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{user.name}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {user.email} • {user.role.replace('_', ' ')}
                </p>
              </div>
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
            {user.role !== 'super_admin' ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {(['active', 'suspended', 'banned'] as UserStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => moderateUser(user.id, status)}
                    className={user.status === status ? 'primary-btn' : 'secondary-btn'}
                  >
                    {status}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </SurfaceCard>
    </div>
  );
}
