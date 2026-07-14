'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { EmptyState, StatusPill, SurfaceCard } from '@/components/ui';
import { formatMoney } from '@/lib/utils';

export default function TournamentEventsPage() {
  const params = useParams<{ id: string }>();
  const { state, createTournamentEvent } = useApp();
  const tournament = state.tournaments.find((item) => item.id === params.id);
  const [message, setMessage] = useState('');
  if (!tournament) return null;

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tournament) return;
    const data = new FormData(event.currentTarget);
    const result = createTournamentEvent(tournament.id, {
      name: String(data.get('name') ?? ''),
      entryFee: Number(data.get('entryFee') ?? 0),
      maxParticipants: Number(data.get('maxParticipants') ?? 0),
    });
    setMessage(result.message);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <SurfaceCard>
        <h2 className="text-lg font-semibold text-ink">Create event category</h2>
        <form className="mt-4 space-y-3" onSubmit={add}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Event name
            </label>
            <input name="name" placeholder="Under 11 / Men's Singles" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Entry fee
              </label>
              <input type="number" name="entryFee" min={0} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Max participants
              </label>
              <input type="number" name="maxParticipants" min={2} required />
            </div>
          </div>
          <button className="primary-btn w-full">Add event</button>
        </form>
        {tournament.categories.length ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Planned tournament categories
            </p>
            <div className="flex flex-wrap gap-2">
              {tournament.categories.map((category) => (
                <StatusPill key={category} tone="accent">
                  {category}
                </StatusPill>
              ))}
            </div>
          </div>
        ) : null}
        {message ? (
          <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-xs font-medium text-accentDeep">
            {message}
          </p>
        ) : null}
      </SurfaceCard>
      <SurfaceCard className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Current events</h2>
        {tournament.events.length ? (
          tournament.events.map((event) => (
            <div key={event.id} className="rounded-xl bg-canvas p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{event.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {event.registrationIds.length}/{event.maxParticipants} participants
                  </p>
                </div>
                <p className="text-sm font-semibold text-ink">{formatMoney(event.entryFee)}</p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No events yet"
            body="Add at least one event to start collecting registrations."
          />
        )}
      </SurfaceCard>
    </div>
  );
}
