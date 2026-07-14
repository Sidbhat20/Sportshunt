'use client';

import Link from 'next/link';
import { AuthGuard } from '@/components/guards';
import { useApp } from '@/components/app-provider';
import { NotificationFeed } from '@/components/notification-feed';
import { PageHeader, StatCard, SurfaceCard } from '@/components/ui';
import { homeForRole } from '@/lib/roles';

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  );
}

function NotificationsContent() {
  const { state, session, myOrganizations, markNotificationsRead } = useApp();
  if (!session) return null;
  const notifications = state.notifications.filter(
    (notification) =>
      (!notification.userId || notification.userId === session.id) &&
      (!notification.organizationId ||
        myOrganizations.some((organization) => organization.id === notification.organizationId)),
  );

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const organizationCount = notifications.filter(
    (notification) => notification.organizationId,
  ).length;

  return (
    <div className="dash-shell space-y-6">
      <PageHeader
        title="Notifications"
        copy="Your bookings, registrations, approvals, and team activity — all in one clean feed."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={homeForRole(session.role)} className="secondary-btn">
              Back to dashboard
            </Link>
            <button onClick={markNotificationsRead} className="primary-btn">
              Mark all as read
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total updates" value={notifications.length} />
        <StatCard
          label="Unread"
          value={unreadCount}
          tone="accent"
          hint="Fresh items waiting for you"
        />
        <StatCard
          label="Team activity"
          value={organizationCount}
          hint="Organization-related updates"
        />
      </div>

      <SurfaceCard className="overflow-hidden border-none bg-gradient-to-br from-accent/10 via-white to-emerald-50/80 p-0">
        <div className="border-b border-line/70 px-5 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Activity feed
          </p>
          <h2 className="mt-1 font-display text-2xl font-light text-ink">
            Built for quick scanning, not clutter.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            The latest updates are grouped visually so approvals, confirmations, and action items
            are easier to spot at a glance.
          </p>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <NotificationFeed
            notifications={notifications}
            emptyTitle="All caught up"
            emptyBody="You don't have any notifications right now."
          />
        </div>
      </SurfaceCard>
    </div>
  );
}
