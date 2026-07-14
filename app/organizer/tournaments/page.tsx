'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/app-provider';
import { CategoryManager } from '@/components/category-manager';
import { GoogleMapsPreview } from '@/components/google-maps-preview';
import { MapLocationField } from '@/components/map-location-field';
import { PosterUploadField } from '@/components/poster-upload-field';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';
import { TOURNAMENT_SPORT_OPTIONS } from '@/lib/sports';
import { formatDate } from '@/lib/utils';

export default function OrganizerTournamentsPage() {
  const { state, currentOrganization, createTournament } = useApp();
  const [message, setMessage] = useState('');
  const [venuePreview, setVenuePreview] = useState('');
  const [mapPreview, setMapPreview] = useState('');
  const [posterPreview, setPosterPreview] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tournaments"
          copy="Create an organization first to start managing tournaments."
        />
        <EmptyState
          title="No organization selected"
          body="Use the Organizations tab to create one and wait for admin approval."
          action={
            <Link href="/organizer/organizations" className="primary-btn">
              Go to organizations
            </Link>
          }
        />
      </div>
    );
  }

  const tournaments = state.tournaments.filter(
    (item) => item.organizationId === currentOrganization.id,
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentOrganization) return;
    const data = new FormData(event.currentTarget);
    const result = createTournament(currentOrganization.id, {
      name: String(data.get('name') ?? ''),
      sport: String(data.get('sport') ?? ''),
      description: String(data.get('description') ?? ''),
      rules: String(data.get('rules') ?? ''),
      startDate: String(data.get('startDate') ?? ''),
      endDate: String(data.get('endDate') ?? ''),
      venue: String(data.get('venue') ?? ''),
      mapLocation: mapPreview,
      poster: posterPreview,
      categories,
    });
    setMessage(result.message);
    if (result.ok) {
      event.currentTarget.reset();
      setVenuePreview('');
      setMapPreview('');
      setPosterPreview('');
      setCategories([]);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tournaments"
        copy={`Create and manage tournaments under ${currentOrganization.name}.`}
      />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <h2 className="text-lg font-semibold text-ink">New tournament</h2>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Name
              </label>
              <input name="name" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Sport
                </label>
                <select name="sport" defaultValue={TOURNAMENT_SPORT_OPTIONS[0]} required>
                  {TOURNAMENT_SPORT_OPTIONS.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Venue
                </label>
                <input
                  name="venue"
                  required
                  placeholder="Venue name or address"
                  onChange={(event) => setVenuePreview(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Start date
                </label>
                <input type="datetime-local" name="startDate" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  End date
                </label>
                <input type="datetime-local" name="endDate" required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Description
              </label>
              <textarea name="description" rows={3} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Rules
              </label>
              <textarea name="rules" rows={3} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MapLocationField value={mapPreview} onChange={setMapPreview} venue={venuePreview} />
              <PosterUploadField value={posterPreview} onChange={setPosterPreview} />
            </div>
            <CategoryManager
              categories={categories}
              onChange={setCategories}
              helperText="Add all tournament categories before approval so the admin can review the full structure."
            />
            <GoogleMapsPreview
              venue={venuePreview}
              mapLocation={mapPreview}
              title="Tournament venue preview"
              showExternalLink={false}
            />
            <button className="primary-btn w-full">Submit tournament</button>
          </form>
          {message ? (
            <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-xs font-medium text-accentDeep">
              {message}
            </p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">
            Tournaments in {currentOrganization.name}
          </h2>
          {tournaments.length ? (
            tournaments.map((tournament) => (
              <div key={tournament.id} className="rounded-xl bg-canvas p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{tournament.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(tournament.startDate)} • {tournament.venue}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill
                      tone={
                        tournament.approvalStatus === 'approved'
                          ? 'success'
                          : tournament.approvalStatus === 'pending'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {tournament.approvalStatus}
                    </StatusPill>
                    <StatusPill tone="accent">{tournament.status}</StatusPill>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {tournament.categories.length} categories • {tournament.events.length} events •{' '}
                  {tournament.matches.length} matches • {tournament.registrations.length}{' '}
                  registrations
                </p>
                {tournament.categories.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tournament.categories.map((category) => (
                      <StatusPill key={category} tone="accent">
                        {category}
                      </StatusPill>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/organizer/tournaments/${tournament.id}/basic-info`}
                    className="secondary-btn"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No tournaments"
              body="Create your first tournament using the form on the left."
            />
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
