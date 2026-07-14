'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WebGLPlayfield } from '@/components/motion/webgl-playfield';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    number: '01',
    eyebrow: 'Discover',
    title: 'Pick your play',
    copy: 'Choose a nearby game, a premium turf, or a tournament worth chasing.',
    href: '/games',
    cta: 'Find a game',
    icon: '⌖',
  },
  {
    number: '02',
    eyebrow: 'Move',
    title: 'Lock your slot',
    copy: 'See what is open, compare the details, and reserve without the usual back-and-forth.',
    href: '/turfs',
    cta: 'Book a turf',
    icon: '↗',
  },
  {
    number: '03',
    eyebrow: 'Compete',
    title: 'Show up & hunt',
    copy: 'Meet your squad, play the match, follow scores, and come back for the next one.',
    href: '/tournaments',
    cta: 'Enter a tournament',
    icon: '★',
  },
];

export function PlayPath() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.play-path-heading > *', {
          opacity: 0,
          y: 28,
          stagger: 0.09,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
        });

        gsap.from('.play-path-card', {
          opacity: 0,
          y: 50,
          rotate: (index) => (index - 1) * 2.5,
          stagger: 0.13,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.play-path-grid', start: 'top 80%', once: true },
        });

        gsap.fromTo(
          '.play-path-line',
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.4,
            ease: 'power2.inOut',
            scrollTrigger: { trigger: '.play-path-grid', start: 'top 72%', once: true },
          },
        );
      });
      return () => media.revert();
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section ref={root} className="relative border-y border-line bg-canvasAlt/60">
      <WebGLPlayfield className="py-16 sm:py-20">
        <div className="page-shell !py-0">
          <div className="play-path-heading mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
              One city · endless play
            </p>
            <h2 className="display mt-4 font-display text-4xl text-ink sm:text-5xl lg:text-6xl">
              From “let’s play” to game on.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Sportshunt turns the messy part of local sport into three quick moves.
            </p>
          </div>

          <div className="play-path-grid relative mt-12 grid gap-5 lg:grid-cols-3">
            <div className="play-path-line absolute left-[16%] right-[16%] top-12 hidden h-1 origin-left bg-gradient-to-r from-accent via-lime to-accent lg:block" />
            {STEPS.map((step) => (
              <article
                key={step.number}
                className="play-path-card group relative overflow-hidden rounded-3xl border-2 border-ink bg-white p-6 shadow-bold transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:shadow-[10px_10px_0_0_#15803d]"
              >
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-lime/25 transition-transform duration-500 group-hover:scale-125" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-lime text-xl font-black text-ink shadow-[3px_3px_0_0_#0a1410]">
                    {step.icon}
                  </div>
                  <p className="scoreboard text-6xl leading-none text-accent/15">{step.number}</p>
                </div>
                <div className="relative mt-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                    {step.eyebrow}
                  </p>
                  <h3 className="display mt-2 font-display text-3xl text-ink">{step.title}</h3>
                  <p className="mt-4 min-h-20 text-sm leading-6 text-muted">{step.copy}</p>
                  <Link href={step.href} className="ghost-btn mt-5 !px-0 text-accent">
                    {step.cta} <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </WebGLPlayfield>
    </section>
  );
}
