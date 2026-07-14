'use client';

/**
 * Route transition. Next.js re-mounts template.tsx on every navigation, so this
 * gives each page a quick cross-fade entrance. We animate OPACITY ONLY on purpose
 * — a transform/filter here would create a containing block and break the app's
 * `position: fixed` overlays (mobile menu, dashboard drawer) and sticky headers.
 */

import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from '@/components/motion/primitives';

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
