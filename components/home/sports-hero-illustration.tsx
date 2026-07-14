'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { WebGLPlayfield } from '@/components/motion/webgl-playfield';

type SportsHeroIllustrationProps = {
  games: number;
  turfs: number;
  tournaments: number;
};

export function SportsHeroIllustration({
  games,
  turfs,
  tournaments,
}: SportsHeroIllustrationProps) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

        timeline
          .from('.hero-poster', { opacity: 0, y: 28, rotate: 1.5, duration: 0.8 })
          .from('.hero-sun', { scale: 0.65, opacity: 0, duration: 0.65 }, '-=0.55')
          .from('.hero-athlete-part', { opacity: 0, y: 20, stagger: 0.055, duration: 0.45 }, '-=0.45')
          .from('.hero-ball', { opacity: 0, x: -55, y: 42, rotate: -160, duration: 0.75 }, '-=0.2')
          .from('.hero-speed-line', { scaleX: 0, transformOrigin: 'right center', stagger: 0.06, duration: 0.35 }, '-=0.5')
          .from('.hero-stat', { opacity: 0, y: 14, stagger: 0.09, duration: 0.4 }, '-=0.35');

        gsap.to('.hero-ball', {
          y: -7,
          rotate: 9,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to('.hero-float-a', {
          y: -8,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to('.hero-float-b', {
          y: 7,
          duration: 3.1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, root);

    return () => {
      context.revert();
      media.revert();
    };
  }, []);

  return (
    <div ref={root} className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
      <WebGLPlayfield className="hero-poster relative aspect-[5/6] rounded-[2rem] border-2 border-ink bg-ink shadow-[10px_10px_0_0_#15803d] sm:aspect-[6/5] lg:aspect-[5/6]" canvasClassName="z-[1] opacity-70" contentClassName="h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(163,230,53,0.24),transparent_25%),linear-gradient(145deg,#0a1410_0%,#10291d_55%,#064e3b_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="hero-sun absolute -right-12 top-10 h-56 w-56 rounded-full border-[18px] border-lime/25 bg-lime" />
        <div className="absolute -left-16 bottom-16 h-56 w-56 rounded-full border-[28px] border-accent/60" />

        <svg
          viewBox="0 0 500 570"
          role="img"
          aria-label="A dynamic illustrated football player kicking a ball"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <filter id="poster-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="7" dy="9" stdDeviation="0" floodColor="#15803d" />
            </filter>
            <pattern id="poster-dots" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="#ffffff" opacity="0.17" />
            </pattern>
          </defs>

          <path d="M30 500 Q250 400 470 500" fill="none" stroke="#ffffff" strokeOpacity=".28" strokeWidth="3" />
          <path d="M90 520 Q250 445 410 520" fill="none" stroke="#a3e635" strokeOpacity=".7" strokeWidth="3" strokeDasharray="10 12" />
          <path d="M250 443 L250 552" stroke="#ffffff" strokeOpacity=".2" strokeWidth="2" />

          <g className="hero-speed-line" stroke="#a3e635" strokeLinecap="round">
            <path d="M32 186 H152" strokeWidth="10" />
            <path d="M60 215 H168" strokeWidth="5" />
            <path d="M20 241 H132" strokeWidth="3" />
          </g>

          <g filter="url(#poster-shadow)">
            <circle className="hero-athlete-part" cx="255" cy="111" r="39" fill="#f3f8f1" stroke="#0a1410" strokeWidth="8" />
            <path className="hero-athlete-part" d="M226 155 Q263 137 302 164 L322 289 Q270 321 211 287 Z" fill="#15803d" stroke="#0a1410" strokeWidth="9" strokeLinejoin="round" />
            <path className="hero-athlete-part" d="M230 160 L156 232 L116 195" fill="none" stroke="#f3f8f1" strokeWidth="27" strokeLinecap="round" strokeLinejoin="round" />
            <path className="hero-athlete-part" d="M298 169 L370 222 L417 180" fill="none" stroke="#f3f8f1" strokeWidth="27" strokeLinecap="round" strokeLinejoin="round" />
            <path className="hero-athlete-part" d="M238 291 L189 397 L112 463" fill="none" stroke="#f3f8f1" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" />
            <path className="hero-athlete-part" d="M293 293 L342 391 L426 421" fill="none" stroke="#f3f8f1" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" />
            <path className="hero-athlete-part" d="M78 469 Q116 443 147 460 L124 490 L77 491 Z" fill="#a3e635" stroke="#0a1410" strokeWidth="8" strokeLinejoin="round" />
            <path className="hero-athlete-part" d="M413 402 Q447 413 461 445 L424 453 L393 426 Z" fill="#a3e635" stroke="#0a1410" strokeWidth="8" strokeLinejoin="round" />
            <path className="hero-athlete-part" d="M244 83 Q267 61 296 82" fill="none" stroke="#0a1410" strokeWidth="13" strokeLinecap="round" />
            <path className="hero-athlete-part" d="M235 195 Q267 216 306 193" fill="none" stroke="#a3e635" strokeWidth="7" strokeLinecap="round" />
            <text className="hero-athlete-part" x="267" y="263" textAnchor="middle" fill="#ffffff" fontSize="68" fontWeight="900" fontFamily="Impact, sans-serif">7</text>
          </g>

          <g className="hero-ball" transform="translate(370 352)">
            <circle r="44" fill="#ffffff" stroke="#0a1410" strokeWidth="8" />
            <path d="M0-16 15-5 9 13-9 13-15-5Z" fill="#0a1410" />
            <path d="M0-16 0-38M15-5 36-13M9 13 22 33M-9 13-22 33M-15-5-36-13" stroke="#0a1410" strokeWidth="5" />
          </g>

          <path d="M0 0H500V570H0Z" fill="url(#poster-dots)" />
        </svg>

        <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
          Play your city
        </div>

        <div className="hero-float-a absolute right-4 top-[38%] rotate-2 rounded-xl border-2 border-ink bg-lime px-4 py-3 text-ink shadow-[4px_4px_0_0_#0a1410]">
          <p className="text-[9px] font-black uppercase tracking-[0.18em]">Open tonight</p>
          <p className="scoreboard mt-0.5 text-3xl">{String(turfs).padStart(2, '0')}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider">turfs</p>
        </div>

        <div className="hero-float-b absolute bottom-5 left-4 rounded-xl border-2 border-ink bg-white px-4 py-3 text-ink shadow-[4px_4px_0_0_#15803d]">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-accent">Players wanted</p>
          <p className="scoreboard mt-0.5 text-3xl">{String(games).padStart(2, '0')}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider">live hunts</p>
        </div>

        <div className="hero-float-a absolute bottom-6 right-5 rounded-full border-2 border-white bg-accent px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_0_#a3e635]">
          {tournaments} tourneys
        </div>
      </WebGLPlayfield>

      <div className="hero-stat absolute -left-3 top-[27%] hidden -rotate-3 rounded-full border-2 border-ink bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-ink shadow-[4px_4px_0_0_#a3e635] sm:block">
        Get · Set · Hunt
      </div>
      <div className="hero-stat absolute -right-2 top-8 h-12 w-12 rotate-12 items-center justify-center rounded-full border-2 border-ink bg-accent text-xl text-white shadow-[3px_3px_0_0_#a3e635] sm:flex" aria-hidden>
        ⚡
      </div>
    </div>
  );
}
