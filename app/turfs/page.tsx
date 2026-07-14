'use client';

import { Suspense } from 'react';
import { PublicHeader } from '@/components/layouts/public-header';
import { TurfBrowser } from '@/components/turf-browser';
import { InteractivePageBanner } from '@/components/motion/interactive-page-banner';

export default function TurfsPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="page-shell">
        <InteractivePageBanner
          eyebrow="Book · Play · Repeat"
          title="Your next field is waiting."
          copy="Find an eye-catching venue, check live availability, and lock the right slot for your squad."
          symbol="●"
        />
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-canvasAlt" />}>
          <TurfBrowser />
        </Suspense>
      </main>
    </>
  );
}
