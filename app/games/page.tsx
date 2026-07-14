'use client';

import { PublicHeader } from '@/components/layouts/public-header';
import { HuntersHub } from '@/components/hunters-hub';
import { InteractivePageBanner } from '@/components/motion/interactive-page-banner';

export default function GamesPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="page-shell">
        <InteractivePageBanner
          eyebrow="Players wanted"
          title="Find your squad. Start the game."
          copy="Join an open Hunt nearby or create one and fill the missing spots before kickoff."
          symbol="⚡"
        />
        <HuntersHub />
      </main>
    </>
  );
}
