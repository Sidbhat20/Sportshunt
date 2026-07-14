'use client';

import Link from 'next/link';
import { ArrowRight, Buildings, Gavel, ShieldCheck, Trophy } from '@phosphor-icons/react';
import { PublicHeader } from '@/components/layouts/public-header';
import { InteractivePageBanner } from '@/components/motion/interactive-page-banner';

const roles = [
  { title: 'Organizer', body: 'Manage organizations, events, registrations, fixtures, and live tournament operations.', href: '/login?role=organizer', icon: Trophy, tone: 'bg-accent text-white' },
  { title: 'Venue owner', body: 'Control courts, available slots, pricing, bookings, and venue settings.', href: '/login?role=venue-owner', icon: Buildings, tone: 'bg-lime text-ink' },
  { title: 'Super admin', body: 'Review approvals, moderation queues, organizations, and platform activity.', href: '/login?role=admin', icon: ShieldCheck, tone: 'bg-ink text-white' },
  { title: 'Referee', body: 'Open assigned matches, use live scoring controls, and finalize official scorecards.', href: '/login?role=referee', icon: Gavel, tone: 'bg-accentSoft text-accentDeep' },
] as const;

export default function PartnerLoginPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="page-shell">
        <InteractivePageBanner eyebrow="Restricted workspace" title="Choose your Sportshunt role." copy="Each partner workspace is tailored to the work you need to complete." symbol="↗" />

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <Link key={role.title} href={role.href} className="group flex min-h-72 flex-col overflow-hidden rounded-3xl border border-line bg-white p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card sm:p-6">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${role.tone}`}><Icon size={24} weight="bold" /></div>
                <p className="scoreboard mt-8 text-5xl text-accent/10">0{index + 1}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{role.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{role.body}</p>
                <span className="mt-auto flex items-center justify-between border-t border-line pt-5 text-sm font-bold text-accent">Open workspace <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </section>
      </main>
    </>
  );
}
