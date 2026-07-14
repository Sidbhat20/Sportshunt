'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { WebGLPlayfield } from '@/components/motion/webgl-playfield';

export function InteractivePageBanner({
  eyebrow,
  title,
  copy,
  symbol,
  children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  symbol: string;
  children?: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.page-banner-copy > *', {
          opacity: 0,
          x: -24,
          stagger: 0.08,
          duration: 0.65,
          ease: 'power3.out',
        });
        gsap.from('.page-banner-symbol', {
          opacity: 0,
          scale: 0.65,
          rotate: -18,
          duration: 0.9,
          ease: 'back.out(1.5)',
        });
        gsap.to('.page-banner-symbol', {
          y: -8,
          rotate: 4,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
      return () => media.revert();
    }, root);
    return () => context.revert();
  }, []);

  return (
    <div ref={root} className="mb-8">
      <WebGLPlayfield className="rounded-[2rem] border-2 border-ink bg-ink shadow-boldGreen">
        <div className="relative overflow-hidden px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="page-banner-copy max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-lime">{eyebrow}</p>
              <h1 className="display mt-3 font-display text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">{copy}</p>
              {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
            </div>
            <div className="page-banner-symbol hidden h-32 w-32 items-center justify-center rounded-full border-2 border-white bg-lime text-6xl font-black text-ink shadow-[7px_7px_0_0_#15803d] md:flex lg:h-40 lg:w-40 lg:text-7xl">
              {symbol}
            </div>
          </div>
        </div>
      </WebGLPlayfield>
    </div>
  );
}
