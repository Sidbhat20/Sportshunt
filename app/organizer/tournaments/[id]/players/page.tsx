'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { EmptyState, StatusPill, SurfaceCard } from '@/components/ui';

export default function TournamentPlayersPage() {
  const params = useParams<{ id: string }>();
  const { state, addTournamentParticipant } = useApp();
  const tournament = state.tournaments.find((item) => item.id === params.id);
  const [message, setMessage] = useState('');
  if (!tournament) return null;

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tournament) return;
    const data = new FormData(event.currentTarget);
    const result = addTournamentParticipant(tournament.id, String(data.get('eventId') ?? ''), {
      participantName: String(data.get('participantName') ?? ''),
      paymentStatus: String(data.get('paymentStatus') ?? 'pending') as 'paid' | 'pending',
    });
    setMessage(result.message);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <SurfaceCard>
        <h2 className="text-lg font-semibold text-ink">Add participant</h2>
        <form className="mt-4 space-y-3" onSubmit={add}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Event
            </label>
            <select name="eventId" required>
              {tournament.events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Participant name
            </label>
            <input name="participantName" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Payment
            </label>
            <select name="paymentStatus">
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <button className="primary-btn w-full">Add participant</button>
        </form>
        {message ? (
          <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-xs font-medium text-accentDeep">
            {message}
          </p>
        ) : null}
      </SurfaceCard>
      <SurfaceCard className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Registered players</h2>
        {tournament.events.length ? (
          tournament.events.map((event) => (
            <div key={event.id} className="space-y-2 rounded-xl bg-canvas p-4">
              <p className="font-medium text-ink">{event.name}</p>
              {tournament.registrations.filter((registration) => registration.eventId === event.id)
                .length ? (
                tournament.registrations
                  .filter((registration) => registration.eventId === event.id)
                  .map((registration) => (
                    <div
                      key={registration.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm"
                    >
                      <span>{registration.participantName}</span>
                      <StatusPill
                        tone={registration.paymentStatus === 'paid' ? 'success' : 'warning'}
                      >
                        {registration.paymentStatus}
                      </StatusPill>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-muted">No registrations yet.</p>
              )}
            </div>
          ))
        ) : (
          <EmptyState title="No events" body="Create event categories first." />
        )}
      </SurfaceCard>
    </div>
  );
}
