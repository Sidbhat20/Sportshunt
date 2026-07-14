'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { CategoryManager } from '@/components/category-manager';
import { GoogleMapsPreview } from '@/components/google-maps-preview';
import { MapLocationField } from '@/components/map-location-field';
import { PosterUploadField } from '@/components/poster-upload-field';
import { SurfaceCard } from '@/components/ui';
import { TOURNAMENT_SPORT_OPTIONS } from '@/lib/sports';

export default function TournamentBasicInfoPage() {
  const params = useParams<{ id: string }>();
  const { state, updateTournamentBasicInfo } = useApp();
  const tournament = state.tournaments.find((item) => item.id === params.id);
  const [message, setMessage] = useState('');
  const [venuePreview, setVenuePreview] = useState(tournament?.venue ?? '');
  const [mapPreview, setMapPreview] = useState(tournament?.mapLocation ?? '');
  const [posterPreview, setPosterPreview] = useState(tournament?.poster ?? '');
  const [categories, setCategories] = useState<string[]>(tournament?.categories ?? []);
  if (!tournament) return null;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tournament) return;
    const data = new FormData(event.currentTarget);
    updateTournamentBasicInfo(tournament.id, {
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
    setMessage('Basic info updated.');
  }

  return (
    <SurfaceCard>
      <h2 className="text-lg font-semibold text-ink">Basic info</h2>
      <form className="mt-4 space-y-3" onSubmit={save}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Name
            </label>
            <input name="name" defaultValue={tournament.name} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Sport
            </label>
            <select name="sport" defaultValue={tournament.sport}>
              {TOURNAMENT_SPORT_OPTIONS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Description
          </label>
          <textarea name="description" rows={3} defaultValue={tournament.description} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Rules
          </label>
          <textarea name="rules" rows={3} defaultValue={tournament.rules} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Start date
            </label>
            <input
              type="datetime-local"
              name="startDate"
              defaultValue={tournament.startDate.slice(0, 16)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              End date
            </label>
            <input
              type="datetime-local"
              name="endDate"
              defaultValue={tournament.endDate.slice(0, 16)}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Venue
            </label>
            <input
              name="venue"
              defaultValue={tournament.venue}
              onChange={(event) => setVenuePreview(event.target.value)}
            />
          </div>
          <MapLocationField value={mapPreview} onChange={setMapPreview} venue={venuePreview} />
        </div>
        <CategoryManager
          categories={categories}
          onChange={setCategories}
          helperText="Keep your age-group / gender categories updated before the tournament goes live."
        />
        <GoogleMapsPreview
          venue={venuePreview}
          mapLocation={mapPreview}
          title="Tournament venue preview"
          showExternalLink={false}
        />
        <PosterUploadField value={posterPreview} onChange={setPosterPreview} />
        <button className="primary-btn">Save changes</button>
      </form>
      {message ? (
        <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-xs font-medium text-accentDeep">
          {message}
        </p>
      ) : null}
    </SurfaceCard>
  );
}
