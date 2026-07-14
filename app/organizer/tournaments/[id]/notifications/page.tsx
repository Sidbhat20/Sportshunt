'use client';

import { useParams } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { NotificationFeed } from '@/components/notification-feed';
import { SurfaceCard } from '@/components/ui';

export default function TournamentNotificationsPage() {
  const params = useParams<{ id: string }>();
  const { state } = useApp();
  const tournament = state.tournaments.find((item) => item.id === params.id);
  if (!tournament) return null;

  const notifications = state.notifications
    .filter((item) => item.organizationId === tournament.organizationId)
    .slice(0, 12);

  return (
    <SurfaceCard className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">Organization notifications</h2>
        <p className="mt-1 text-sm text-muted">
          Updates tied to this organizer account and its tournament operations.
        </p>
      </div>
      <NotificationFeed
        notifications={notifications}
        emptyTitle="No notifications"
        emptyBody="Activity from this organization will show up here."
      />
    </SurfaceCard>
  );
}
