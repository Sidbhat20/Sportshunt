'use client';

import { FormEvent, useState } from 'react';
import { AuthGuard } from '@/components/guards';
import { useApp } from '@/components/app-provider';
import { PublicHeader } from '@/components/layouts/public-header';
import { SectionHeading, SurfaceCard } from '@/components/ui';

export default function VenueOwnerApplyPage() {
  return (
    <>
      <PublicHeader />
      <AuthGuard>
        <VenueOwnerApplyContent />
      </AuthGuard>
    </>
  );
}

function VenueOwnerApplyContent() {
  const { applyForRole } = useApp();
  const [message, setMessage] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = applyForRole('venue', {
      turfName: String(formData.get('turfName') ?? ''),
      location: String(formData.get('location') ?? ''),
      photos: String(formData.get('photos') ?? ''),
      pricing: String(formData.get('pricing') ?? ''),
    });
    setMessage(result.message);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <main className="page-shell grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <SectionHeading
        eyebrow="Venue owner approval"
        title="Apply once, then manage your turf professionally"
        copy="Owners must be approved before listings go live."
      />
      <SurfaceCard className="p-6">
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Turf name
            </label>
            <input name="turfName" placeholder="Example: South City Arena" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Location
            </label>
            <input name="location" placeholder="Area, city" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Photo links
            </label>
            <input name="photos" placeholder="Paste 1-2 image URLs" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Pricing
            </label>
            <input name="pricing" placeholder="Example: ₹1800/hour" required />
          </div>
          <button className="primary-btn w-full">Submit application</button>
        </form>
        {message ? (
          <p className="mt-3 rounded-xl bg-accentSoft px-3 py-2 text-sm font-medium text-accentDeep">
            {message}
          </p>
        ) : null}
      </SurfaceCard>
    </main>
  );
}
