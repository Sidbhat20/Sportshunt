'use client';

import { FormEvent, useState } from 'react';
import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';
import { formatMoney } from '@/lib/utils';

export default function VenueTurfsPage() {
  const { state, session, addTurf, addSlots } = useApp();
  const [message, setMessage] = useState('');
  const [slotMessage, setSlotMessage] = useState('');
  const [selectedTurf, setSelectedTurf] = useState('');
  if (!session) return null;

  const ownTurfs = state.turfs.filter((turf) => turf.ownerId === session.id);

  function submitTurf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = addTurf({
      name: String(data.get('name') ?? ''),
      location: String(data.get('location') ?? ''),
      price: Number(data.get('price') ?? 0),
      sport: String(data.get('sport') ?? ''),
      photo: String(data.get('photo') ?? ''),
      slotsText: String(data.get('slotsText') ?? ''),
    });
    setMessage(result.message);
    if (result.ok) event.currentTarget.reset();
  }

  function submitSlots(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = addSlots(String(data.get('turfId') ?? ''), String(data.get('slotsText') ?? ''));
    setSlotMessage(result.message);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Turfs" copy="Submit new turfs and add time slots to existing venues." />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard>
          <h2 className="text-lg font-semibold text-ink">Add a new turf</h2>
          <form className="mt-4 space-y-3" onSubmit={submitTurf}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Turf name
                </label>
                <input name="name" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Sport
                </label>
                <input name="sport" placeholder="Football / Badminton" required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Location
              </label>
              <input name="location" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Hourly price
                </label>
                <input name="price" type="number" min={0} required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Cover photo URL
                </label>
                <input name="photo" placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Initial slots
              </label>
              <textarea
                name="slotsText"
                rows={4}
                placeholder="Comma-separated: Today · 7 PM - 8 PM, Tomorrow · 8 AM - 9 AM"
                required
              />
            </div>
            <button className="primary-btn w-full">Submit turf for approval</button>
          </form>
          {message ? (
            <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-xs font-medium text-accentDeep">
              {message}
            </p>
          ) : null}
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard>
            <h2 className="text-lg font-semibold text-ink">Add slots</h2>
            <form className="mt-4 space-y-3" onSubmit={submitSlots}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Choose turf
                </label>
                <select
                  name="turfId"
                  value={selectedTurf}
                  onChange={(event) => setSelectedTurf(event.target.value)}
                  required
                >
                  <option value="">Select your turf</option>
                  {ownTurfs.map((turf) => (
                    <option key={turf.id} value={turf.id}>
                      {turf.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  New slots
                </label>
                <textarea
                  name="slotsText"
                  rows={3}
                  placeholder="Comma-separated slot list"
                  required
                />
              </div>
              <button className="secondary-btn w-full">Add slots</button>
            </form>
            {slotMessage ? (
              <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-xs font-medium text-accentDeep">
                {slotMessage}
              </p>
            ) : null}
          </SurfaceCard>

          <SurfaceCard className="space-y-3">
            <h2 className="text-lg font-semibold text-ink">Your turf list</h2>
            {ownTurfs.length ? (
              ownTurfs.map((turf) => (
                <div key={turf.id} className="rounded-xl border border-line bg-canvas p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{turf.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{turf.location}</p>
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
                    {turf.slots.filter((slot) => slot.available).length} open slots •{' '}
                    {formatMoney(turf.price)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No turfs yet"
                body="Submit your first turf using the form on the left."
              />
            )}
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
