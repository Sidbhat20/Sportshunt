'use client';

/**
 * Lenis smooth-scroll provider.
 *
 * Mounted once at the app root (inside AppProvider). Lenis smooths the native
 * window scroll without transforming the page, so existing `position: sticky`
 * headers/sidebars and nested `overflow-auto` panels keep working untouched.
 *
 * Honors prefers-reduced-motion: when reduced motion is requested we render
 * children with the browser's native scroll and never instantiate Lenis.
 */

import { ReactLenis } from 'lenis/react';
import { useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

export function LenisProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        // Snappy-but-premium: a sports brand should feel energetic, not heavy.
        lerp: 0.1,
        duration: 1.05,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        // Let touch devices keep their fast native scroll feel.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
