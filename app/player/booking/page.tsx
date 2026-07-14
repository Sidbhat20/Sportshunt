'use client';

import { TurfBrowser } from '@/components/turf-browser';
import { PageHeader } from '@/components/ui';

export default function PlayerBookingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Book a turf"
        copy="Short, clean booking flow: filter venues, open turf details, choose slots, and continue to payment."
      />
      <TurfBrowser ctaLabel="Select slots" />
    </div>
  );
}
