'use client';

import Link from 'next/link';
import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatCard, StatusPill, SurfaceCard } from '@/components/ui';
import { formatDate, formatMoney } from '@/lib/utils';

export default function VenueDashboardPage() {
  const { state, session } = useApp();
  if (!session) return null;

  const ownTurfs = state.turfs.filter((turf) => turf.ownerId === session.id);
  const approvedTurfs = ownTurfs.filter((turf) => turf.approved);
  const pendingTurfs = ownTurfs.filter((turf) => turf.moderationStatus === 'pending');
  const bookings = state.bookings.filter((booking) =>
    ownTurfs.some((turf) => turf.id === booking.turfId),
  );
  const estimatedEarnings = bookings.length * 1200;
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Venue dashboard"
        copy={`Welcome, ${session.name}. Manage your turfs, slots, and bookings.`}
        action={
          <Link href="/venue/turfs" className="primary-btn">
            Add a turf
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total turfs" value={ownTurfs.length} />
        <StatCard label="Approved" value={approvedTurfs.length} tone="accent" />
        <StatCard label="Bookings" value={bookings.length} />
        <StatCard
          label="Est. earnings"
          value={formatMoney(estimatedEarnings)}
          hint="Placeholder until payments connect"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Your turfs</h2>
            <Link href="/venue/turfs" className="text-sm font-medium text-accent hover:underline">
              Manage all
            </Link>
          </div>
          {ownTurfs.length ? (
            ownTurfs.slice(0, 5).map((turf) => (
              <div key={turf.id} className="rounded-xl border border-line bg-canvas p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{turf.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {turf.location} • {formatMoney(turf.price)}
                    </p>
                  </div>
                  <StatusPill
                    tone={
                      turf.moderationStatus === 'approved'
                        ? 'success'
                        : turf.moderationStatus === 'pending'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {turf.moderationStatus}
                  </StatusPill>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {turf.slots.filter((slot) => slot.available).length} open slots
                </p>
              </div>
            ))
          ) : (
            <EmptyState
              title="No turfs yet"
              body="Submit your first turf for approval."
              action={
                <Link href="/venue/turfs" className="primary-btn">
                  Add turf
                </Link>
              }
            />
          )}
          {pendingTurfs.length ? (
            <p className="text-xs text-amber-700">
              {pendingTurfs.length} turf(s) waiting for admin approval.
            </p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Recent bookings</h2>
            <Link
              href="/venue/bookings"
              className="text-sm font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          {recentBookings.length ? (
            recentBookings.map((booking) => (
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
                  {booking.makePublic ? 'Public' : 'Private'}
                </StatusPill>
              </div>
            ))
          ) : (
            <EmptyState
              title="No bookings yet"
              body="Bookings appear here as players claim slots."
            />
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
