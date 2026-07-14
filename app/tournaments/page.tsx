'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { PublicHeader } from '@/components/layouts/public-header';
import { InteractivePageBanner } from '@/components/motion/interactive-page-banner';
import { PlayerAuthModal } from '@/components/player-auth-modal';
import { TournamentRegistrationPanel } from '@/components/tournament/tournament-registration-panel';
import { StatusPill, SurfaceCard } from '@/components/ui';
import { useApp } from '@/components/app-provider';
import { Confetti, RevealImage } from '@/components/motion/primitives';
import { useToast } from '@/components/motion/toast';
import { getSportImage } from '@/lib/turf-booking';
import { formatDate } from '@/lib/utils';

export default function TournamentsPage() {
  const { state, session, joinTournamentEvent } = useApp();
  const tournaments = state.tournaments.filter(
    (item) => item.approvalStatus === 'approved' && item.publicStatus === 'live',
  );
  const [selectedId, setSelectedId] = useState(tournaments[0]?.id ?? '');
  const [sportFilter, setSportFilter] = useState('all');
  const [openAuth, setOpenAuth] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<{
    tournamentId: string;
    eventId: string;
    participantName: string;
  } | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const toast = useToast();

  const sports = Array.from(new Set(tournaments.map((tournament) => tournament.sport)));
  const filteredTournaments = useMemo(
    () =>
      tournaments.filter((tournament) => sportFilter === 'all' || tournament.sport === sportFilter),
    [sportFilter, tournaments],
  );

  useEffect(() => {
    if (!filteredTournaments.some((tournament) => tournament.id === selectedId)) {
      setSelectedId(filteredTournaments[0]?.id ?? '');
    }
  }, [filteredTournaments, selectedId]);

  const selectedTournament =
    filteredTournaments.find((tournament) => tournament.id === selectedId) ??
    filteredTournaments[0] ??
    null;

  const [listRef] = useAutoAnimate<HTMLDivElement>();

  function submitRegistration(tournamentId: string, eventId: string, participantName: string) {
    const result = joinTournamentEvent(tournamentId, eventId, { participantName });
    if (result.ok) {
      toast.success(result.message);
      setPendingEvent(null);
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 1600);
    } else {
      toast.error(result.message);
    }
  }

  function handleRegister(payload: {
    tournamentId: string;
    eventId: string;
    participantName: string;
  }) {
    if (!session) {
      setPendingEvent(payload);
      setOpenAuth(true);
      return;
    }
    submitRegistration(payload.tournamentId, payload.eventId, payload.participantName);
  }

  useEffect(() => {
    if (!session || !pendingEvent) return;
    submitRegistration(
      pendingEvent.tournamentId,
      pendingEvent.eventId,
      pendingEvent.participantName,
    );
  }, [pendingEvent, session]);

  return (
    <>
      <Confetti fire={celebrate} />
      <PublicHeader />
      <main id="main-content" className="page-shell space-y-6">
        <InteractivePageBanner
          eyebrow="The bigger stage"
          title="Enter the bracket. Chase the moment."
          copy="Discover approved competitions, compare categories, and register for the tournament that fits your game."
          symbol="★"
        />

        <SurfaceCard>
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Sport
              </label>
              <select value={sportFilter} onChange={(event) => setSportFilter(event.target.value)}>
                <option value="all">All sports</option>
                {sports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl bg-canvas px-4 py-3 text-sm text-muted">
              <span className="font-semibold text-ink">{filteredTournaments.length}</span>{' '}
              tournament(s) available
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div ref={listRef} className="grid gap-4">
            {filteredTournaments.map((tournament) => (
              <SurfaceCard
                key={tournament.id}
                className={selectedTournament?.id === tournament.id ? 'ring-2 ring-accent/20' : ''}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">{tournament.name}</h2>
                    <p className="mt-1 text-xs text-muted">
                      {tournament.venue} • {formatDate(tournament.startDate)}
                    </p>
                  </div>
                  <StatusPill tone="accent">{tournament.sport}</StatusPill>
                </div>
                <RevealImage
                  src={tournament.poster || getSportImage(tournament.sport, tournament.id)}
                  alt={`${tournament.name} ${tournament.sport} tournament`}
                  className="mt-4 h-48 w-full rounded-2xl"
                  imgClassName="h-full w-full object-cover saturate-[1.08] contrast-[1.04]"
                  onError={(event) => {
                    event.currentTarget.src = getSportImage(tournament.sport, tournament.id);
                  }}
                />
                <div className="mt-4 flex items-center justify-between text-sm text-muted">
                  <span>{tournament.events.length} event(s)</span>
                  <span>{tournament.registrations.length} registered</span>
                </div>
                <button
                  onClick={() => setSelectedId(tournament.id)}
                  className="secondary-btn mt-4 w-full"
                >
                  View details
                </button>
              </SurfaceCard>
            ))}
          </div>

          <TournamentRegistrationPanel
            tournament={selectedTournament}
            onRegister={({ eventId, participantName }) =>
              selectedTournament
                ? handleRegister({
                    tournamentId: selectedTournament.id,
                    eventId,
                    participantName,
                  })
                : undefined
            }
          />
        </div>

      </main>
      <PlayerAuthModal
        open={openAuth}
        onClose={() => {
          setOpenAuth(false);
          setPendingEvent(null);
        }}
        title="Login to register for this tournament"
      />
    </>
  );
}
