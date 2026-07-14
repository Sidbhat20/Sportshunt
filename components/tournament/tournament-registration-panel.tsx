'use client';

import { useEffect, useState } from 'react';
import { EmptyState, StatusPill, SurfaceCard } from '@/components/ui';
import { RevealImage } from '@/components/motion/primitives';
import type { Tournament } from '@/types';
import { getSportImage } from '@/lib/turf-booking';
import { formatDate, formatMoney } from '@/lib/utils';

export function TournamentRegistrationPanel({
  tournament,
  onRegister,
}: {
  tournament: Tournament | null;
  onRegister: (payload: { eventId: string; participantName: string }) => void;
}) {
  const [eventId, setEventId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setEventId(tournament?.events[0]?.id ?? '');
    setParticipantName('');
    setPhone('');
    setCity('');
    setNotes('');
  }, [tournament?.id]);

  if (!tournament) {
    return (
      <SurfaceCard>
        <p className="text-sm text-muted">No tournaments match your current filters.</p>
      </SurfaceCard>
    );
  }

  const selectedEvent = tournament.events.find((event) => event.id === eventId) ?? tournament.events[0];
  const registrations = selectedEvent
    ? tournament.registrations.filter((registration) => registration.eventId === selectedEvent.id)
    : [];

  function submit() {
    if (!selectedEvent) return;
    if (!participantName.trim() || !phone.trim() || !city.trim()) return;
    onRegister({ eventId: selectedEvent.id, participantName: participantName.trim() });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <SurfaceCard className="h-fit space-y-4 xl:sticky xl:top-24">
        <RevealImage
          src={tournament.poster || getSportImage(tournament.sport, tournament.id)}
          alt={`${tournament.name} ${tournament.sport} tournament`}
          className="h-80 w-full rounded-3xl border border-line"
          imgClassName="h-full w-full object-cover saturate-[1.08] contrast-[1.04]"
          onError={(event) => {
            event.currentTarget.src = getSportImage(tournament.sport, tournament.id);
          }}
        />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">{tournament.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {tournament.venue} • {formatDate(tournament.startDate)}
            </p>
          </div>
          <StatusPill tone="accent">{tournament.sport}</StatusPill>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl bg-canvas p-4 text-sm text-muted">
            <p className="font-semibold text-ink">About</p>
            <p className="mt-2 leading-6">{tournament.description}</p>
          </div>
          <div className="rounded-2xl bg-canvas p-4 text-sm text-muted">
            <p className="font-semibold text-ink">Rules</p>
            <p className="mt-2 leading-6">{tournament.rules}</p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Tournament registration
          </p>
          <h3 className="mt-1 text-xl font-semibold text-ink">Choose category and continue to payment</h3>
          <p className="mt-1 text-sm text-muted">
            Fill the required player details first. Payment is the next step in this demo flow.
          </p>
        </div>

        {tournament.events.length ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Category name
                </label>
                <select value={selectedEvent?.id ?? ''} onChange={(event) => setEventId(event.target.value)}>
                  {tournament.events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-2xl bg-canvas px-4 py-3 text-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Entry fee</p>
                <p className="mt-1 font-semibold text-ink">{selectedEvent ? formatMoney(selectedEvent.entryFee) : '—'}</p>
                <p className="mt-1 text-xs text-muted">
                  {registrations.length}/{selectedEvent?.maxParticipants ?? 0} registered
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Player / team name
                </label>
                <input value={participantName} onChange={(event) => setParticipantName(event.target.value)} placeholder="Enter participant name" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Phone number
                </label>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Enter contact number" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  City
                </label>
                <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Your city" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Notes
                </label>
                <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional note / teammate info" />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-canvas p-4 text-sm text-muted">
              <p className="font-semibold text-ink">Registration preview</p>
              <p className="mt-2">Tournament: {tournament.name}</p>
              <p className="mt-1">Category: {selectedEvent?.name ?? 'Select a category'}</p>
              <p className="mt-1">Participant: {participantName || 'Enter participant name'}</p>
              <p className="mt-1">Phone: {phone || 'Enter contact number'}</p>
              <p className="mt-1">City: {city || 'Enter city'}</p>
              <p className="mt-1">Payment step next: {selectedEvent ? formatMoney(selectedEvent.entryFee) : '—'}</p>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Recent registrations</p>
              <div className="flex flex-wrap gap-1.5">
                {registrations.slice(0, 8).map((registration) => (
                  <span key={registration.id} className="rounded-full bg-canvas px-2.5 py-1 text-[11px] text-ink">
                    {registration.participantName}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={submit}
              className="primary-btn w-full justify-center"
              disabled={!selectedEvent || !participantName.trim() || !phone.trim() || !city.trim()}
              type="button"
            >
              Continue to payment
            </button>
          </>
        ) : (
          <EmptyState title="No categories yet" body="This tournament has no event categories yet." />
        )}
      </SurfaceCard>
    </div>
  );
}
