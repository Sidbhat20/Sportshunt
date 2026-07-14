'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { RefereeConfigPanel } from '@/components/referee-config-panel';
import { BracketBoard } from '@/components/tournament/bracket-board';
import { EmptyState, StatusPill, SurfaceCard } from '@/components/ui';
import { getDefaultRefereeConfig, getMetaLine } from '@/lib/referee-engine';
import { computeStandings } from '@/lib/tournament-logic';
import { FixtureType, TournamentMatch } from '@/types';


export default function TournamentFixturesPage() {
  const params = useParams<{ id: string }>();
  const {
    state,
    generateFixtures,
    generateRefereeOtp,
    scheduleMatch,
    updateMatchStatus,
  } = useApp();
  const tournament = state.tournaments.find((item) => item.id === params.id);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [message, setMessage] = useState('');
  const [fixtureMode, setFixtureMode] = useState<'auto' | 'manual'>('auto');
  const [manualOrder, setManualOrder] = useState<string[]>([]);
  const [scheduleMatchId, setScheduleMatchId] = useState<string | null>(null);
  const [scheduleCourt, setScheduleCourt] = useState('Court 1');
  const [scheduleConfig, setScheduleConfig] = useState(getDefaultRefereeConfig('badminton'));

  if (!tournament) return null;

  const selectedEvent = tournament.events.find(
    (event) => event.id === (selectedEventId || tournament.events[0]?.id),
  );
  const eventMatches = selectedEvent
    ? tournament.matches.filter((match) => match.eventId === selectedEvent.id)
    : [];
  const previewMatches = useMemo(
    () =>
      [...eventMatches].sort(
        (a, b) => a.roundNumber - b.roundNumber || a.matchNumber - b.matchNumber,
      ),
    [eventMatches],
  );
  const eventRegistrations = selectedEvent
    ? selectedEvent.registrationIds
        .map((registrationId) =>
          tournament.registrations.find((registration) => registration.id === registrationId),
        )
        .filter(Boolean)
    : [];

  const standings = useMemo(
    () =>
      computeStandings(
        previewMatches.filter((match) => ['group', 'championship'].includes(match.phase)),
      ),
    [previewMatches],
  );

  useEffect(() => {
    if (!selectedEvent) {
      setManualOrder([]);
      return;
    }
    setManualOrder(selectedEvent.registrationIds);
  }, [selectedEvent?.id]);

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tournament) return;
    const data = new FormData(event.currentTarget);
    const eventId = String(data.get('eventId') ?? '');
    const fixtureType = String(data.get('fixtureType') ?? 'knockout') as FixtureType;
    const participantOrder = fixtureMode === 'manual' ? manualOrder.filter(Boolean) : undefined;
    const result = generateFixtures(tournament.id, eventId, fixtureType, participantOrder);
    setMessage(result.message);
  }

  function createOtp() {
    if (!selectedEvent || !tournament) return;
    const result = generateRefereeOtp(tournament.id, selectedEvent.id);
    setMessage(result.ok && result.otp ? `Referee OTP: ${result.otp}` : result.message);
  }

  function openSchedule(match: TournamentMatch) {
    setScheduleMatchId(match.id);
    setScheduleCourt(match.refereeAssignment?.court ?? 'Court 1');
    setScheduleConfig(
      match.refereeAssignment?.config ?? getDefaultRefereeConfig(tournament!.sport),
    );
  }

  function saveSchedule() {
    if (!tournament || !scheduleMatchId) return;
    const result = scheduleMatch(tournament.id, scheduleMatchId, {
      court: scheduleCourt,
      config: scheduleConfig,
    });
    setMessage(result.message);
    if (result.ok) setScheduleMatchId(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <SurfaceCard>
          <h2 className="text-lg font-semibold text-ink">Generate fixtures</h2>
          <form className="mt-4 space-y-3" onSubmit={create}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Event
              </label>
              <select
                name="eventId"
                value={selectedEvent?.id ?? ''}
                onChange={(event) => setSelectedEventId(event.target.value)}
              >
                {tournament.events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Fixture type
              </label>
              <select name="fixtureType">
                <option value="knockout">Knockout</option>
                <option value="round_robin">Round Robin</option>
                <option value="round_robin_knockout">Round Robin + Knockout</option>
                <option value="knockout_round_robin">Knockout + Round Robin</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Pairing mode
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFixtureMode('auto')}
                  className={fixtureMode === 'auto' ? 'primary-btn' : 'secondary-btn'}
                >
                  Auto generate
                </button>
                <button
                  type="button"
                  onClick={() => setFixtureMode('manual')}
                  className={fixtureMode === 'manual' ? 'primary-btn' : 'secondary-btn'}
                >
                  Manual order
                </button>
              </div>
            </div>
            {fixtureMode === 'manual' && eventRegistrations.length ? (
              <div className="space-y-2 rounded-2xl bg-canvas p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Manual pairing order
                </p>
                <p className="text-xs text-muted">
                  Arrange the player order. Fixtures will use this order for first-round pairings.
                </p>
                <div className="space-y-2">
                  {manualOrder.map((registrationId, index) => (
                    <div key={`${registrationId}-${index}`} className="flex items-center gap-2">
                      <span className="w-14 text-xs font-semibold text-muted">Seed {index + 1}</span>
                      <select
                        value={registrationId}
                        onChange={(event) => {
                          const next = [...manualOrder];
                          next[index] = event.target.value;
                          setManualOrder(next);
                        }}
                      >
                        {eventRegistrations.map((registration) => (
                          <option key={registration!.id} value={registration!.id}>
                            {registration!.participantName}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <button className="primary-btn w-full">Generate fixtures</button>
          </form>
          <button onClick={createOtp} className="secondary-btn mt-3 w-full">
            Generate referee OTP for scheduled matches
          </button>
          <p className="mt-3 text-xs text-muted">
            Go live pushes a match to the home page. Schedule is a separate referee workflow where
            you lock the court plus scoring rules first.
          </p>
          {message ? (
            <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-xs font-medium text-accentDeep">
              {message}
            </p>
          ) : null}
        </SurfaceCard>

        {scheduleMatchId ? (
          <SurfaceCard className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                Referee scheduling
              </p>
              <h2 className="mt-1 text-lg font-semibold text-ink">Set match rules before referee assignment</h2>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Court
              </label>
              <input
                value={scheduleCourt}
                onChange={(event) => setScheduleCourt(event.target.value)}
                placeholder="Court 1"
              />
            </div>
            <RefereeConfigPanel config={scheduleConfig} onChange={setScheduleConfig} locked={false} />
            <div className="flex flex-wrap gap-2">
              <button onClick={saveSchedule} className="primary-btn" type="button">
                Save schedule
              </button>
              <button onClick={() => setScheduleMatchId(null)} className="secondary-btn" type="button">
                Cancel
              </button>
            </div>
          </SurfaceCard>
        ) : null}

        {standings.length ? (
          <SurfaceCard className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Round-robin table</h2>
              <p className="mt-1 text-xs text-muted">
                Organizer view of matches played, wins, losses, and point difference.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-4">Player / Team</th>
                    <th className="py-2 pr-4">M</th>
                    <th className="py-2 pr-4">W</th>
                    <th className="py-2 pr-4">L</th>
                    <th className="py-2 pr-4">For</th>
                    <th className="py-2 pr-4">Against</th>
                    <th className="py-2 pr-4">Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr key={row.id} className="border-b border-line/70 text-ink">
                      <td className="py-3 pr-4 font-medium">{row.name}</td>
                      <td className="py-3 pr-4">{row.played}</td>
                      <td className="py-3 pr-4">{row.wins}</td>
                      <td className="py-3 pr-4">{row.losses}</td>
                      <td className="py-3 pr-4">{row.scored}</td>
                      <td className="py-3 pr-4">{row.conceded}</td>
                      <td className="py-3 pr-4">{row.scored - row.conceded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        ) : null}
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-ink">Fixture preview</h2>
            <p className="mt-1 text-xs text-muted">
              Schedule matches for referee operations, then use Go live only when they should be visible on the home page.
            </p>
          </div>
          {selectedEvent ? (
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="accent">
                {selectedEvent.fixtureType?.replaceAll('_', ' ') || 'Not generated'}
              </StatusPill>
              <StatusPill tone={tournament.approvalStatus === 'approved' ? 'success' : 'warning'}>
                {tournament.approvalStatus}
              </StatusPill>
            </div>
          ) : null}
        </div>

        {selectedEvent ? (
          <>
            <p className="text-xs text-muted">Matches: {previewMatches.length}</p>
            {previewMatches.length ? (
              <div className="space-y-3">
                {previewMatches.map((match) => (
                  <div key={match.id} className="rounded-xl border border-line bg-white p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink">
                          {match.participantAName || 'TBD'} vs {match.participantBName || 'TBD'}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {match.roundLabel} #{match.matchNumber} • {match.phase}
                        </p>
                        {match.refereeAssignment ? (
                          <div className="mt-2 space-y-1 text-xs text-muted">
                            <p>Referee court: {match.refereeAssignment.court}</p>
                            <p>{getMetaLine({
                              teamA: match.participantAName || 'A',
                              teamB: match.participantBName || 'B',
                              sport: match.refereeAssignment.config.sport,
                              config: match.refereeAssignment.config,
                              scoreA: 0,
                              scoreB: 0,
                              matchA: 0,
                              matchB: 0,
                              currentSegment: 1,
                              currentSegmentA: 0,
                              currentSegmentB: 0,
                              segments: [],
                              timerRunning: false,
                              timerMs: 0,
                              shotClockMs: null,
                              completed: false,
                            })}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill
                          tone={
                            match.status === 'live'
                              ? 'live'
                              : match.status === 'verified'
                                ? 'success'
                                : 'default'
                          }
                        >
                          {match.status}
                        </StatusPill>
                        {match.refereeAssignment ? (
                          <StatusPill tone="accent">Scheduled</StatusPill>
                        ) : null}
                        {match.participantAName && match.participantBName ? (
                          <button onClick={() => openSchedule(match)} className="secondary-btn" type="button">
                            {match.refereeAssignment ? 'Edit schedule' : 'Schedule'}
                          </button>
                        ) : null}
                        {match.status !== 'live' && match.participantAName && match.participantBName ? (
                          <button
                            onClick={() => {
                              updateMatchStatus(tournament.id, match.id, 'live');
                              setMessage(
                                tournament.approvalStatus === 'approved'
                                  ? 'Match is now live and will appear on the Sportshunt home page.'
                                  : 'Match marked live. It will appear on the home page after the tournament is approved.',
                              );
                            }}
                            className="primary-btn"
                            type="button"
                          >
                            Go live
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No fixtures yet"
                body="Generate fixtures to preview, schedule for referee, and publish matches."
              />
            )}

            <BracketBoard matches={previewMatches} />
          </>
        ) : (
          <EmptyState
            title="Create an event first"
            body="Add at least one event category before generating fixtures."
          />
        )}
      </SurfaceCard>
    </div>
  );
}
