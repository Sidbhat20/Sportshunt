'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/components/app-provider';
import { TournamentRegistrationPanel } from '@/components/tournament/tournament-registration-panel';
import { RevealImage } from '@/components/motion/primitives';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';
import { getSportImage } from '@/lib/turf-booking';
import { formatDate } from '@/lib/utils';

export default function PlayerTournamentsPage() {
  const { state, joinTournamentEvent } = useApp();
  const tournaments = state.tournaments.filter(
    (item) => item.approvalStatus === 'approved' && item.publicStatus === 'live',
  );
  const [selectedId, setSelectedId] = useState(tournaments[0]?.id ?? '');
  const [message, setMessage] = useState('');

  const sports = Array.from(new Set(tournaments.map((tournament) => tournament.sport)));
  const [sportFilter, setSportFilter] = useState('all');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tournaments"
        copy="Open a tournament, select the category, fill required details, and continue to payment."
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
            <span className="font-semibold text-ink">{filteredTournaments.length}</span> tournament(s)
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="grid gap-4">
          {filteredTournaments.length ? (
            filteredTournaments.map((tournament) => (
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
                <button onClick={() => setSelectedId(tournament.id)} className="secondary-btn mt-4 w-full">
                  View details
                </button>
              </SurfaceCard>
            ))
          ) : (
            <EmptyState title="No live tournaments" body="Admin-approved tournaments will appear here." />
          )}
        </div>

        <TournamentRegistrationPanel
          tournament={selectedTournament}
          onRegister={({ eventId, participantName }) => {
            if (!selectedTournament) return;
            setMessage(
              joinTournamentEvent(selectedTournament.id, eventId, { participantName }).message,
            );
          }}
        />
      </div>
      {message ? (
        <p className="rounded-xl bg-accentSoft px-3 py-2 text-sm font-medium text-accentDeep">
          {message}
        </p>
      ) : null}
    </div>
  );
}
