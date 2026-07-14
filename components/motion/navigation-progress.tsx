'use client';

/**
 * A thin pitch-green → lime progress bar that sweeps across the top on every
 * route change. Driven by pathname changes (App Router has no global router
 * events), so it reads as "fast and responsive" without tracking real load time.
 * Skipped entirely under reduced motion.
 */

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export function NavigationProgress() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 650);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="nav-progress"
          className="fixed left-0 top-0 z-[200] h-[3px] rounded-r-full"
          style={{ background: 'linear-gradient(90deg, #15803d, #a3e635)' }}
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: '100%' }}
          exit={{ opacity: 0 }}
          transition={{ width: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }}
        />
      ) : null}
    </AnimatePresence>
  );
}
