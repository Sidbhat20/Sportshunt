'use client';

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { CountUp, EASE_OUT, SPRING_SOFT, useRevealProps } from '@/components/motion/primitives';

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  align?: 'left' | 'center';
}) {
  const revealProps = useRevealProps({ y: 20 });
  return (
    <motion.div
      className={cn('space-y-3', align === 'center' && 'mx-auto max-w-2xl text-center')}
      {...revealProps}
    >
      {eyebrow ? (
        <p
          className={cn(
            'inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-accent',
            align === 'center' && 'justify-center',
          )}
        >
          <span className="h-[2px] w-8 bg-accent" />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="display font-display text-3xl text-ink sm:text-4xl lg:text-5xl">{title}</h2>
      {copy ? <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">{copy}</p> : null}
    </motion.div>
  );
}

export function PageHeader({
  title,
  copy,
  action,
}: {
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const entrance = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: EASE_OUT },
      };
  return (
    <motion.header
      className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6"
      {...entrance}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <h1 className="display font-display text-2xl text-ink sm:text-3xl lg:text-4xl">{title}</h1>
        {copy ? <p className="text-sm leading-6 text-muted">{copy}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.header>
  );
}

export function SurfaceCard({
  className,
  children,
  interactive = false,
}: {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={!reduce && interactive ? { y: -4 } : undefined}
      transition={SPRING_SOFT}
      className={cn(
        'rounded-2xl border border-line bg-white p-5 shadow-soft transition-[box-shadow,border-color] duration-300',
        interactive && 'hover:border-accent/30 hover:shadow-card',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'accent' | 'warning' | 'live';
}) {
  const accents = {
    default: 'text-ink',
    accent: 'text-accent',
    warning: 'text-amber-600',
    live: 'text-live',
  } as const;
  return (
    <SurfaceCard className="p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className={cn('scoreboard mt-2 text-4xl', accents[tone])}>
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </SurfaceCard>
  );
}

export function StatusPill({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'live' | 'danger' | 'lime';
}) {
  const tones = {
    default: 'bg-canvasAlt text-ink ring-line',
    accent: 'bg-accentSoft text-accent ring-accent/25',
    success: 'bg-accentSoft text-accentDeep ring-accent/25',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    live: 'bg-red-50 text-red-700 ring-red-200',
    danger: 'bg-red-50 text-red-700 ring-red-200',
    lime: 'bg-limeSoft text-limeDeep ring-limeDeep/30',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-chalk p-6 text-center sm:p-12"
    >
      <span aria-hidden className="relative grid h-10 w-10 place-items-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent/15 animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      <p className="display font-display text-xl text-ink">{title}</p>
      {body ? <p className="max-w-md text-sm leading-6 text-muted">{body}</p> : null}
      {action}
    </motion.div>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft">
      {children}
    </div>
  );
}
