import type { Metadata } from 'next';
import { PublicHeader } from '@/components/layouts/public-header';
import { PublicFooter } from '@/components/layouts/public-footer';
import { SectionHeading, SurfaceCard } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Cancellation Policy | Sportshunt',
  description: 'Read the Sportshunt cancellation and refund policy for venue bookings, tournaments, platform fees, and failed transactions.',
};

const CANCELLATION_SECTIONS = [
  {
    number: '3.1',
    title: 'Turf / Venue Booking',
    copy: 'Cancellation windows are defined by the venue owner. A typical structure is as follows:',
    bullets: [
      '24+ hours before the booking: full refund',
      '12–24 hours before the booking: partial refund',
      'Less than 12 hours before the booking: no refund',
      'No-show: no refund',
    ],
  },
  {
    number: '3.2',
    title: 'Tournament Cancellation',
    bullets: [
      'If a user cancels before the deadline, a partial or full refund may apply depending on the organizer.',
      'If a user cancels after the deadline, no refund applies.',
      'If an organizer cancels an event, users receive a full refund or a reschedule option.',
    ],
  },
  {
    number: '3.3',
    title: 'Platform Fees',
    bullets: ['Convenience fees or platform fees may be non-refundable.'],
  },
  {
    number: '3.4',
    title: 'Failed Transactions',
    bullets: [
      'If a payment fails but the amount is deducted, the refund is processed within 5–7 working days.',
    ],
  },
];

export default function CancellationPolicyPage() {
  return (
    <>
      <PublicHeader />
      <main className="bg-canvas">
        <section className="border-b border-line bg-white">
          <div className="page-shell space-y-5 py-16">
            <SectionHeading
              eyebrow="Sportshunt policy"
              title="Cancellation & Refund Policy"
              copy="This policy covers cancellations for turf bookings, tournaments, platform fees, and failed transactions processed through Sportshunt."
            />
          </div>
        </section>

        <section className="page-shell space-y-6">
          {CANCELLATION_SECTIONS.map((section) => (
            <SurfaceCard key={section.number} className="space-y-4 rounded-3xl p-6 sm:p-7">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                  {section.number}
                </p>
                <h2 className="display font-display text-3xl text-ink">{section.title}</h2>
                {section.copy ? <p className="text-sm leading-7 text-muted">{section.copy}</p> : null}
              </div>
              <ul className="space-y-3 text-sm leading-7 text-muted">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          ))}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
