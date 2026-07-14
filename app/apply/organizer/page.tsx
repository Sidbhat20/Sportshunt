'use client';

import { FormEvent, useState } from 'react';
import { AuthGuard } from '@/components/guards';
import { useApp } from '@/components/app-provider';
import { PublicHeader } from '@/components/layouts/public-header';
import { SectionHeading, SurfaceCard } from '@/components/ui';

export default function OrganizerApplyPage() {
  return (
    <>
      <PublicHeader />
      <AuthGuard>
        <OrganizerApplyContent />
      </AuthGuard>
    </>
  );
}

function OrganizerApplyContent() {
  const { applyForRole } = useApp();
  const [message, setMessage] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = applyForRole('organizer', {
      city: String(formData.get('city') ?? ''),
      experience: String(formData.get('experience') ?? ''),
      sports: String(formData.get('sports') ?? ''),
    });
    setMessage(result.message);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <main className="page-shell grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <SectionHeading
        eyebrow="Organizer approval"
        title="Run tournaments after admin approval"
        copy="Submit a few signals and we'll unlock organizer features after review."
      />
      <SurfaceCard className="p-6">
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              City
            </label>
            <input name="city" placeholder="Where do you organize?" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Sports you handle
            </label>
            <input name="sports" placeholder="Badminton, Football, Pickleball..." required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Experience
            </label>
            <textarea
              name="experience"
              rows={5}
              placeholder="Tell us about your event or community experience"
              required
            />
          </div>
          <button className="primary-btn w-full">Submit organizer request</button>
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
