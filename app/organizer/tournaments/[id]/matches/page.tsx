'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { EmptyState, StatusPill, SurfaceCard } from '@/components/ui';

export default function TournamentMatchesPage() {
  const params = useParams<{ id: string }>();
  const { state, updateMatchStatus, verifyMatch } = useApp();
  const tournament = state.tournaments.find((item) => item.id === params.id);
  const [selectedEventId, setSelectedEventId] = useState('');
  if (!tournament) return null;

  const selectedEvent = tournament.events.find(
    (event) => event.id === (selectedEventId || tournament.events[0]?.id),
  );
  const eventMatches = selectedEvent
    ? tournament.matches.filter((match) => match.eventId === selectedEvent.id)
    : [];
  const grouped = useMemo(
    () => ({
      scheduled: eventMatches.filter((match) => match.status === 'scheduled'),
      live: eventMatches.filter((match) => match.status === 'live'),
      completed: eventMatches.filter((match) => match.status === 'completed'),
      verified: eventMatches.filter((match) => match.status === 'verified'),
    }),
    [eventMatches],
  );

  return (
    <div className="space-y-6">
      <SurfaceCard className="flex flex-wrap items-center gap-3 p-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">Event</label>
        <select
          value={selectedEvent?.id ?? ''}
          onChange={(event) => setSelectedEventId(event.target.value)}
          className="max-w-xs rounded-xl"
        >
          {tournament.events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </SurfaceCard>

      {tournament.events.length === 0 ? (
        <EmptyState
          title="No events yet"
          body="Create event categories and generate fixtures to populate matches."
        />
      ) : null}

      {Object.entries(grouped).map(([status, matches]) => (
        <SurfaceCard key={status} className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold capitalize text-ink">
            {status === 'live' ? <span className="live-dot" aria-hidden /> : null}
            {status}
            <span className="text-xs font-normal text-muted">({matches.length})</span>
          </h2>
          {matches.length ? (
            matches.map((match) => (
              <div key={match.id} className="rounded-xl bg-canvas p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">
                      {match.participantAName || 'TBD'} vs {match.participantBName || 'TBD'}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {match.roundLabel} • {match.phase}
                    </p>
                    {match.refereeAssignment ? (
                      <p className="mt-1 text-xs text-muted">
                        Referee court: {match.refereeAssignment.court}
                      </p>
                    ) : null}
                    {match.scorecard?.summary ? (
                      <p className="mt-1 text-xs text-muted">Score: {match.scorecard.summary}</p>
                    ) : typeof match.scoreA === 'number' && typeof match.scoreB === 'number' ? (
                      <p className="mt-1 text-xs text-muted">
                        Score: {match.scoreA} – {match.scoreB}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.status !== 'verified' ? (
                      <button
                        onClick={() => updateMatchStatus(tournament.id, match.id, 'live')}
                        className="secondary-btn"
                      >
                        Go live
                      </button>
                    ) : null}
                    {match.status === 'completed' ? (
                      <button
                        onClick={() => verifyMatch(tournament.id, match.id)}
                        className="primary-btn"
                      >
                        Verify
                      </button>
                    ) : null}
                    {match.status === 'verified' ? (
                      <StatusPill tone="success">Winner: {match.winnerName}</StatusPill>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted">No matches in this state.</p>
          )}
        </SurfaceCard>
      ))}
    </div>
  );
}
