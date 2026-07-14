'use client';

/**
 * Sportshunt motion primitives.
 *
 * Small, reduced-motion-aware building blocks layered on top of the existing
 * white + pitch-green brand. These add entrance/scroll/number polish only —
 * they never change colors, fonts, spacing, or layout.
 *
 * Easing mirrors the brand's existing CSS: cubic-bezier(0.22, 1, 0.36, 1).
 */

import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
  type Transition,
  type Variants,
} from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Brand easing — matches `fade-up` / `fade-in` in tailwind.config.ts + globals.css
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Crisp, premium spring for interactions (hover / press). Never bouncy.
export const SPRING: Transition = { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 };
export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 };

/** Spreadable props for a fade + rise entrance that fires when scrolled into view. */
export function useRevealProps({
  y = 24,
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.2,
}: {
  y?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
} = {}): HTMLMotionProps<'div'> {
  const reduce = useReducedMotion();
  if (reduce) return {};
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once, amount, margin: '0px 0px -8% 0px' },
    transition: { duration, ease: EASE_OUT, delay },
  };
}

/**
 * Section / element scroll reveal — fades and rises gently into view, once.
 * Renders a motion.div, so it's a drop-in for an existing wrapper <div>.
 */
export function Reveal({
  children,
  className,
  y,
  delay,
  duration,
  once,
  amount,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
} & HTMLMotionProps<'div'>) {
  const revealProps = useRevealProps({ y, delay, duration, once, amount });
  return (
    <motion.div className={className} {...revealProps} {...rest}>
      {children}
    </motion.div>
  );
}

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

/**
 * Stagger container — orchestrates a cascade of <StaggerItem> children as the
 * group scrolls into view. Use for card grids and lists.
 */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0.05,
  amount = 0.15,
  once = true,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
  once?: boolean;
} & HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} {...(rest as Record<string, unknown>)}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** A single staggered child. Renders a motion.div that becomes the grid/flex cell. */
export function StaggerItem({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} {...(rest as Record<string, unknown>)}>
        {children}
      </div>
    );
  }
  return (
    <motion.div className={className} variants={staggerItemVariants} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * Smooth number count-up that runs once when scrolled into view.
 * Respects reduced motion (renders the final value immediately).
 */
export function CountUp({
  value,
  duration = 1.2,
  className,
  format,
}: {
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [inView, value, reduce, duration]);

  const text = format ? format(display) : Math.round(display).toLocaleString();
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/**
 * Pressable — wraps interactive content with a crafted hover lift + press scale
 * using spring physics. Use for cards / CTAs where a real spring is wanted.
 * Renders a motion.div; pass `className` so it inherits the cell's layout.
 */
export function Pressable({
  children,
  className,
  lift = -4,
  scale = 0.97,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
} & HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} {...(rest as Record<string, unknown>)}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      whileHover={{ y: lift }}
      whileTap={{ scale }}
      transition={SPRING}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * RevealImage — a drop-in for <img> that reveals with a subtle scale + fade
 * instead of a hard pop-in. The entrance animates the WRAPPER (opacity/scale),
 * leaving the <img>'s own transform free for existing group-hover zoom effects.
 */
export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
  onError,
  vtName,
}: {
  src: string;
  alt: string;
  /** wrapper classes — usually layout/size (e.g. "h-full w-full") */
  className?: string;
  /** image classes — usually object-fit + any group-hover zoom */
  imgClassName?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  /** view-transition-name for shared-element morphs (destination hero) */
  vtName?: string;
}) {
  const reduce = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cached images may already be complete before React attaches onLoad — never
  // leave the shimmer covering a loaded image.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  // A green-tinted shimmer placeholder that fades out once the image loads.
  const shimmer = (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 bg-canvasAlt transition-opacity duration-500',
        loaded ? 'opacity-0' : 'opacity-100',
        !reduce && !loaded && 'shimmer',
      )}
    />
  );

  const img = (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={imgClassName}
      style={vtName ? { viewTransitionName: vtName } : undefined}
      onLoad={() => setLoaded(true)}
      onError={(event) => {
        setLoaded(true);
        onError?.(event);
      }}
    />
  );

  if (reduce) {
    return (
      <div className={cn('relative', className)} style={{ overflow: 'hidden' }}>
        {img}
        {shimmer}
      </div>
    );
  }
  return (
    <motion.div
      className={cn('relative', className)}
      style={{ overflow: 'hidden' }}
      initial={{ opacity: 0, scale: 1.05 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
    >
      {img}
      {shimmer}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Track 1 — Scoreboard numbers
 * ------------------------------------------------------------------ */

/**
 * FlipValue — a scoreboard-style vertical flip. When `value` changes, the old
 * value slides up and out while the new value slides up into place. Use for
 * live, changing values (e.g. a rotating live score). Reduced-motion safe.
 */
export function FlipValue({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{value}</span>;
  return (
    <span className={cn('relative inline-flex overflow-hidden', className)}>
      {/* keep layout height while children are absolutely swapped */}
      <span className="invisible" aria-hidden>
        {value}
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={String(value)}
          className="absolute inset-0 inline-flex items-center justify-center"
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-110%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * ProgressRing — an SVG ring that sweeps from empty to `value`% when it scrolls
 * into view. Uses only currentColor classes so it stays on-brand. Reduced-motion
 * safe (renders the final ring instantly).
 */
export function ProgressRing({
  value,
  size = 48,
  stroke = 4,
  className,
  trackClassName = 'text-line',
  barClassName = 'text-accent',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <span className={cn('relative inline-grid place-items-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={trackClassName}
          stroke="currentColor"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={barClassName}
          stroke="currentColor"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduce ? offset : circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, ease: EASE_OUT }}
        />
      </svg>
      {children ? <span className="absolute inset-0 grid place-items-center">{children}</span> : null}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Track 3 — Pointer depth (tilt + spotlight)
 * ------------------------------------------------------------------ */

/**
 * Tilt — a subtle 3D parallax tilt toward the cursor, with spring physics.
 * Pointer-fine devices only; disabled under reduced motion and on touch.
 */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), SPRING_SOFT);
  const rotateY = useSpring(useMotionValue(0), SPRING_SOFT);

  if (reduce) return <div className={className}>{children}</div>;

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * max * 2);
    rotateX.set(-py * max * 2);
  }
  function reset() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Spotlight — a soft radial glow (existing pitch-green by default) that follows
 * the cursor across the surface. Adds depth without touching layout/colors.
 * The wrapper is positioned relative; the glow is a pointer-events-none overlay.
 */
export function Spotlight({
  children,
  className,
  color = 'rgba(21, 128, 61, 0.18)',
  radius = 240,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  radius?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  if (reduce) return <div className={className}>{children}</div>;

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      onPointerMove={handleMove}
      onPointerEnter={(e) => e.pointerType !== 'touch' && setActive(true)}
      onPointerLeave={() => setActive(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(${radius}px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Track 4 — Moments & feedback
 * ------------------------------------------------------------------ */

/** SuccessCheck — a checkmark that draws itself inside a popping green ring. */
export function SuccessCheck({ size = 56, className }: { size?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      className={className}
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
    >
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-accent"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      />
      <motion.path
        d="M16 27 l7 7 l14 -15"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.35 }}
      />
    </motion.svg>
  );
}

const CONFETTI_COLORS = ['#15803d', '#a3e635', '#65a30d', '#0a1410'];

/**
 * Confetti — a one-shot, restrained burst in the brand palette. Render it when
 * `fire` is true (e.g. on booking/registration success). Self-contained,
 * pointer-events-none, and skipped entirely under reduced motion.
 */
export function Confetti({
  fire,
  count = 70,
  className,
}: {
  fire: boolean;
  count?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const baseId = useId();
  if (reduce || !fire) return null;

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 z-[120] overflow-hidden', className)}
    >
      {Array.from({ length: count }).map((_, i) => {
        // Deterministic-ish spread derived from the index (no Math.random needed).
        const left = (i * 137) % 100;
        const delay = (i % 10) * 0.03;
        const drift = ((i * 53) % 120) - 60;
        const rotate = ((i * 71) % 720) - 360;
        const duration = 1.1 + ((i * 17) % 60) / 100;
        const size = 6 + ((i * 13) % 6);
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        return (
          <motion.span
            key={`${baseId}-${i}`}
            className="absolute top-[-5%] rounded-[2px]"
            style={{ left: `${left}%`, width: size, height: size * 1.6, background: color }}
            initial={{ y: '-10vh', x: 0, opacity: 1, rotate: 0 }}
            animate={{ y: '110vh', x: drift, opacity: [1, 1, 0], rotate }}
            transition={{ duration, ease: 'easeIn', delay }}
          />
        );
      })}
    </div>
  );
}

/** Skeleton — a green-tinted shimmer block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span
      aria-hidden
      className={cn('block rounded-xl bg-canvasAlt', !reduce && 'shimmer', className)}
    />
  );
}
