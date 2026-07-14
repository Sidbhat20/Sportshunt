'use client';

/**
 * Shared-element navigation using the native View Transitions API. When a card
 * is tapped we tag its image with a `view-transition-name`, then drive the
 * client navigation inside `document.startViewTransition` so the browser morphs
 * the card image into the matching hero on the destination page.
 *
 * Graceful fallback: browsers without the API (or users with reduced motion)
 * just get a normal, instant navigation — no breakage.
 */

import { useRouter } from 'next/navigation';

type DocWithVT = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => unknown;
};

export function useViewTransitionNav() {
  const router = useRouter();

  return (href: string, beforeStart?: () => void) => {
    if (typeof document === 'undefined') return;
    const doc = document as DocWithVT;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof doc.startViewTransition !== 'function' || prefersReduced) {
      beforeStart?.();
      router.push(href);
      return;
    }

    beforeStart?.();
    doc.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          router.push(href);
          // Give React two frames to commit the destination route before the
          // browser snapshots the "new" state for the morph.
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
  };
}
