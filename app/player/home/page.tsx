'use client';

import Link from 'next/link';
import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatCard, StatusPill, SurfaceCard } from '@/components/ui';
import { RevealImage, Stagger, StaggerItem } from '@/components/motion/primitives';
import { formatDate, formatMoney } from '@/lib/utils';

export default function PlayerHomePage() {
  const { state, session } = useApp();
  if (!session) return null;

  const myBookings = state.bookings.filter((booking) => booking.userId === session.id).slice(0, 4);
  const myGames = state.games
    .filter((game) => game.players.some((player) => player.id === session.id))
    .slice(0, 4);
  const myRegistrations = state.tournaments
    .flatMap((tournament) =>
      tournament.registrations
        .filter((registration) => registration.userId === session.id)
        .map((registration) => ({ ...registration, tournamentName: tournament.name })),
    )
    .slice(0, 4);
  const liveTurfs = state.turfs.filter((turf) => turf.approved).slice(0, 3);
  const openGames = state.games.filter((game) => game.status === 'open').slice(0, 3);
  const liveTournaments = state.tournaments
    .filter((item) => item.approvalStatus === 'approved' && item.publicStatus === 'live')
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hey, ${session.name.split(' ')[0]}`}
        copy="Book a turf, jump into an open game, or register for a tournament — all in one place."
        action={
          <Link href="/player/booking" className="primary-btn">
            Book a turf
          </Link>
        }
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" amount={0.3}>
        <StaggerItem>
          <StatCard label="Upcoming bookings" value={myBookings.length} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Hunts joined" value={myGames.length} tone="accent" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Tournament entries" value={myRegistrations.length} />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Active hunts nearby"
            value={openGames.length}
            hint="Across approved venues"
          />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Nearby turfs</h2>
            <Link
              href="/player/booking"
              className="text-sm font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-3">
            {liveTurfs.length ? (
              liveTurfs.map((turf) => (
                <Link
                  key={turf.id}
                  href={`/turf/${turf.id}`}
                  className="flex items-center gap-4 rounded-xl border border-line bg-canvas p-3 hover:border-accent"
                >
                  <RevealImage
                    src={turf.photos[0]}
                    alt={`${turf.name} ${turf.sport} venue`}
                    className="h-16 w-16 shrink-0 rounded-lg sm:w-20"
                    imgClassName="h-full w-full object-cover saturate-[1.08] contrast-[1.04]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{turf.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{turf.location}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-ink">{formatMoney(turf.price)}</p>
                    <StatusPill tone="success">
                      {turf.slots.filter((slot) => slot.available).length} open
                    </StatusPill>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState title="No turfs yet" body="Approved venues will appear here." />
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Active hunts</h2>
            <Link href="/player/games" className="text-sm font-medium text-accent hover:underline">
              Browse all
            </Link>
          </div>
          {openGames.length ? (
            openGames.map((game) => (
              <div key={game.id} className="rounded-xl border border-line bg-canvas p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">{game.turfName}</p>
                    <p className="mt-1 text-xs text-muted">
                      {game.sport} • {game.slotLabel}
                    </p>
                  </div>
                  <StatusPill tone="accent">
                    {game.players.length}/{game.maxPlayers}
                  </StatusPill>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No active hunts" body="Create one from the Hunters tab." />
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Live tournaments</h2>
          <Link
            href="/player/tournaments"
            className="text-sm font-medium text-accent hover:underline"
          >
            All tournaments
          </Link>
        </div>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {liveTournaments.length ? (
            liveTournaments.map((tournament) => (
              <StaggerItem key={tournament.id}>
              <Link
                href="/player/tournaments"
                className="block h-full overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-accent"
              >
                <RevealImage
                  src={tournament.poster}
                  alt={`${tournament.name} ${tournament.sport} tournament`}
                  className="h-32 w-full"
                  imgClassName="h-full w-full object-cover saturate-[1.08] contrast-[1.04]"
                />
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <StatusPill tone="accent">{tournament.sport}</StatusPill>
                    <span className="text-xs text-muted">{formatDate(tournament.startDate)}</span>
                  </div>
                  <p className="font-semibold text-ink">{tournament.name}</p>
                  <p className="text-xs text-muted">
                    {tournament.events.length} events • {tournament.registrations.length} registered
                  </p>
                </div>
              </Link>
              </StaggerItem>
            ))
          ) : (
            <EmptyState
              title="No live tournaments"
              body="Check back soon — admin-approved events will appear here."
            />
          )}
        </Stagger>
      </SurfaceCard>

      {myRegistrations.length ? (
        <SurfaceCard className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">Your registrations</h2>
          {myRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="flex flex-col gap-1 rounded-xl bg-canvas p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-ink">{registration.tournamentName}</p>
                <p className="text-xs text-muted">{formatDate(registration.createdAt)}</p>
              </div>
              <StatusPill tone={registration.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {registration.paymentStatus}
              </StatusPill>
            </div>
          ))}
        </SurfaceCard>
      ) : null}
    </div>
  );
}
