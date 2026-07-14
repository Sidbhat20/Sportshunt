import type { Metadata } from 'next';
import { PublicHeader } from '@/components/layouts/public-header';
import { PublicFooter } from '@/components/layouts/public-footer';
import { SectionHeading, SurfaceCard } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sportshunt',
  description: 'Read the Sportshunt privacy policy and understand how user data is collected, used, and protected.',
};

const PRIVACY_SECTIONS = [
  {
    number: '2.1',
    title: 'Data We Collect',
    bullets: [
      'Name, email, and phone number',
      'Location data for bookings and discovery',
      'Payment metadata, but not card details',
      'Usage behavior to improve the platform experience',
    ],
  },
  {
    number: '2.2',
    title: 'How We Use Data',
    bullets: [
      'To enable bookings and tournament participation',
      'To improve the platform experience',
      'To send updates and notifications',
      'To prevent fraud and misuse',
    ],
  },
  {
    number: '2.3',
    title: 'Data Sharing',
    bullets: [
      'We may share data with venue owners for bookings.',
      'We may share data with organizers for tournaments.',
      'We may share data with payment gateways for transaction processing.',
      'We do not sell your data.',
    ],
  },
  {
    number: '2.4',
    title: 'Data Security',
    bullets: [
      'Industry-standard encryption',
      'Secure authentication systems',
      'Limited internal access',
    ],
  },
  {
    number: '2.5',
    title: 'User Rights',
    bullets: [
      'Request data deletion',
      'Update personal information',
      'Opt out of communications',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PublicHeader />
      <main className="bg-canvas">
        <section className="border-b border-line bg-white">
          <div className="page-shell space-y-5 py-16">
            <SectionHeading
              eyebrow="Sportshunt policy"
              title="Privacy Policy"
              copy="This policy explains what information Sportshunt collects, how it is used, and how we protect it while enabling bookings, tournaments, and community play."
            />
          </div>
        </section>

        <section className="page-shell space-y-6">
          {PRIVACY_SECTIONS.map((section) => (
            <SurfaceCard key={section.number} className="space-y-4 rounded-3xl p-6 sm:p-7">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                  {section.number}
                </p>
                <h2 className="display font-display text-3xl text-ink">{section.title}</h2>
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
