'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Barcode, Lightning, MapPin, ShieldCheck } from '@phosphor-icons/react';
import { BrandLockup } from '@/components/brand';
import { WebGLPlayfield } from '@/components/motion/webgl-playfield';

export function AuthShell({ eyebrow, title, copy, children, footer }: { eyebrow: string; title: string; copy: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main id="main-content" className="relative min-h-dvh overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="pointer-events-none absolute -right-[0.08em] top-[-12%] hidden select-none font-display text-[36vw] uppercase leading-none text-white/[0.025] lg:block">PLAY</div>

      <header className="relative z-20 mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-7 lg:h-[76px] lg:px-10">
        <BrandLockup href="/" accent="lime" size="sm" className="[&_.display]:!text-white" />
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 border-b border-white/25 text-xs font-bold uppercase tracking-[0.16em] text-white/70 transition hover:border-lime hover:text-lime">
          <ArrowLeft size={16} weight="bold" /> Back
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-68px)] max-w-[1440px] items-center px-4 pb-8 sm:px-7 sm:pb-12 lg:min-h-[calc(100dvh-76px)] lg:grid-cols-[minmax(0,1fr)_minmax(410px,0.66fr)] lg:gap-14 lg:px-10 lg:pb-16 xl:gap-24">
        <WebGLPlayfield className="relative hidden min-h-[630px] overflow-hidden border-r border-white/10 lg:block" canvasClassName="opacity-75" contentClassName="h-full">
          <section className="relative flex min-h-[630px] flex-col justify-center overflow-hidden py-10 pr-14">
            <div className="absolute right-4 top-5 flex items-center gap-2 border border-lime/30 bg-lime/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-lime sm:right-8 lg:right-14">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> Bangalore · Live
            </div>

            <div className="relative max-w-3xl">
              <div className="mb-5 hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[0.26em] text-lime lg:flex">
                <span className="h-px w-14 bg-lime" /> Your city is the arena
              </div>
              <h2 className="display max-w-[8ch] font-display text-[clamp(5.8rem,8vw,8.7rem)] leading-[0.84] text-white">
                Your next game starts here.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/60 sm:text-base lg:mt-7 lg:leading-7">
                One player pass for open games, trusted turfs, and local tournaments.
              </p>
            </div>

            <div className="mt-7 grid max-w-xl grid-cols-3 border-y border-white/15 py-4">
              <div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Discover</p><p className="mt-1 text-sm font-semibold">Nearby games</p></div>
              <div className="border-x border-white/15 px-5"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Reserve</p><p className="mt-1 text-sm font-semibold">Real venues</p></div>
              <div className="pl-5"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Compete</p><p className="mt-1 text-sm font-semibold">Local events</p></div>
            </div>
          </section>
        </WebGLPlayfield>

        <section className="relative mx-auto w-full max-w-[510px] text-ink">
          <div className="absolute -left-2 top-12 hidden h-5 w-5 -translate-x-1/2 rounded-full bg-ink lg:block" />
          <div className="absolute -right-2 top-12 hidden h-5 w-5 translate-x-1/2 rounded-full bg-ink lg:block" />
          <div className="relative overflow-hidden bg-[#f8fbf6] shadow-[14px_14px_0_0_#a3e635] sm:shadow-[18px_18px_0_0_#a3e635]">
            <div className="flex items-center justify-between border-b-2 border-dashed border-ink/20 bg-lime px-5 py-3 text-ink sm:px-7">
              <div className="flex items-center gap-2"><Lightning size={17} weight="fill" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Sportshunt player pass</span></div>
              <span className="scoreboard text-sm">SH / 01</span>
            </div>

            <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
              <h1 className="display mt-3 font-display text-[2.45rem] leading-[0.92] text-ink sm:text-[2.8rem] lg:text-[3.15rem]">{title}</h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted">{copy}</p>

              <div className="mt-6">{children}</div>

              <div className="mt-7 flex items-start gap-3 border-t border-ink/10 pt-5 text-xs leading-5 text-muted">
                <ShieldCheck size={19} weight="fill" className="mt-0.5 shrink-0 text-accent" />
                <p>Secure access. No marketing spam. Your game activity stays connected to this account.</p>
              </div>
              {footer ? <div className="mt-5 text-center text-sm text-muted">{footer}</div> : null}
            </div>

            <div className="flex items-end justify-between border-t-2 border-dashed border-ink/20 px-5 py-4 sm:px-8">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-muted"><MapPin size={15} weight="fill" className="text-accent" /> Bengaluru, India</div>
              <Barcode size={72} height={30} weight="bold" className="text-ink" aria-hidden />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
