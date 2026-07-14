'use client';

import { useEffect, useState } from 'react';
import { GoogleMapsPreview } from '@/components/google-maps-preview';

export function MapLocationField({
  value,
  onChange,
  venue,
  label = 'Google Maps location',
  placeholder = 'Search place name, address, or lat,long',
}: {
  value: string;
  onChange: (value: string) => void;
  venue: string;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!open) setDraft(value);
  }, [open, value]);

  function confirmSelection() {
    onChange(draft.trim());
    setOpen(false);
  }

  return (
    <>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          <button type="button" onClick={() => setOpen(true)} className="secondary-btn sm:shrink-0">
            Pick on map
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          Open the in-page picker, search for the venue, preview it, and confirm without leaving
          Sportshunt.
        </p>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/50 px-4 py-6">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-line bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Map picker
                </p>
                <h3 className="mt-1 font-display text-2xl font-light text-ink">
                  Choose tournament location
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Search the location below, confirm the preview, and Sportshunt will save it
                  directly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-sm text-muted hover:bg-canvas hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Search location
                </label>
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={placeholder}
                />
              </div>

              <GoogleMapsPreview
                venue={venue}
                mapLocation={draft}
                title="Location picker preview"
                heightClassName="h-72"
                showExternalLink={false}
              />

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setOpen(false)} className="secondary-btn">
                  Cancel
                </button>
                <button type="button" onClick={confirmSelection} className="primary-btn">
                  Use this location
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
