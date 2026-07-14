'use client';

import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatCard, StatusPill, SurfaceCard } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function VenueBookingsPage() {
  const { state, session } = useApp();
  if (!session) return null;

  const ownTurfs = state.turfs.filter((turf) => turf.ownerId === session.id);
  const bookings = state.bookings.filter((booking) =>
    ownTurfs.some((turf) => turf.id === booking.turfId),
  );
  const publicBookings = bookings.filter((booking) => booking.makePublic).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        copy="Every confirmed slot across your venues, with a live snapshot of who booked what."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total bookings" value={bookings.length} />
        <StatCard label="Public games created" value={publicBookings} tone="accent" />
        <StatCard label="Active turfs" value={ownTurfs.filter((turf) => turf.approved).length} />
      </div>

      <SurfaceCard className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">All bookings</h2>
        {bookings.length ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col gap-1 rounded-xl bg-canvas p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-ink">{booking.turfName}</p>
                <p className="text-xs text-muted">
                  {booking.userName} • {booking.slotLabel}
                </p>
                <p className="text-[11px] text-muted">{formatDate(booking.createdAt)}</p>
              </div>
              <StatusPill tone={booking.makePublic ? 'accent' : 'success'}>
                {booking.makePublic ? 'Public booking' : 'Private booking'}
              </StatusPill>
            </div>
          ))
        ) : (
          <EmptyState
            title="No bookings yet"
            body="As players book your slots they'll show up here."
          />
        )}
      </SurfaceCard>
    </div>
  );
}
