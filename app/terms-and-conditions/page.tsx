import type { Metadata } from 'next';
import { PublicHeader } from '@/components/layouts/public-header';
import { PublicFooter } from '@/components/layouts/public-footer';
import { SectionHeading, SurfaceCard } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Sportshunt',
  description: 'Review the Sportshunt terms and conditions for bookings, tournaments, payments, community play, and platform usage.',
};

const TERMS_SECTIONS = [
  {
    number: '1.1',
    title: 'Platform Overview',
    copy: 'Sportshunt is a digital platform that enables the following services:',
    bullets: [
      'Booking of sports venues such as turfs and courts',
      'Participation in sports tournaments',
      'Community-based play through the Hunters feature',
      'Referee-assisted match scoring',
      'We act as an intermediary between users, venue owners, and organizers.',
    ],
  },
  {
    number: '1.2',
    title: 'User Roles',
    copy: 'Users may register and access Sportshunt under the following roles:',
    bullets: [
      'Player (default)',
      'Venue Owner',
      'Organizer',
      'Referee',
      'Super Admin (internal)',
      'Each role has restricted access and permissions. Unauthorized access attempts may result in suspension.',
    ],
  },
  {
    number: '1.3',
    title: 'Account Responsibility',
    bullets: [
      'You are responsible for maintaining the confidentiality of your account.',
      'Any activity under your account is your responsibility.',
      'False identity or impersonation may lead to an immediate ban.',
    ],
  },
  {
    number: '1.4',
    title: 'Booking Terms (Turfs & Courts)',
    bullets: [
      'All bookings are subject to availability.',
      'Prices are set by venue owners, not by Sportshunt.',
      'Users must arrive on time. Delays may lead to cancellation without refund.',
      'Misuse of a venue may result in penalties or a permanent ban.',
    ],
  },
  {
    number: '1.5',
    title: 'Tournament Participation',
    bullets: [
      'Entry fees are set by organizers.',
      'Once registered, participants must follow tournament rules.',
      'Participants must follow match schedules.',
      'Referee decisions are final authority during matches.',
      'Sportshunt is not responsible for disputes between players and organizers, but may intervene if necessary.',
    ],
  },
  {
    number: '1.6',
    title: 'Payments',
    bullets: [
      'Payments are processed via third-party gateways.',
      'Sportshunt does not store sensitive financial data.',
      'Any transaction failure must be reported within 24 hours.',
    ],
  },
  {
    number: '1.7',
    title: 'Referee System',
    copy: 'Referees are responsible for the following:',
    bullets: [
      'Accurate scoring',
      'Fair match conduct',
      'Scores submitted are considered official records.',
      'Manipulation or misuse may lead to permanent removal.',
    ],
  },
  {
    number: '1.8',
    title: 'Community (Hunters)',
    bullets: [
      'Users can create or join play sessions.',
      'Sportshunt does not guarantee attendance.',
      'Sportshunt does not guarantee skill level.',
      'Sportshunt does not guarantee safety of participants.',
      'Use the feature at your own discretion.',
    ],
  },
  {
    number: '1.9',
    title: 'Prohibited Activities',
    copy: 'You may not use Sportshunt to:',
    bullets: [
      'Use bots or automation',
      'Manipulate bookings or scores',
      'Harass or abuse other users',
      'Violate any applicable laws',
    ],
  },
  {
    number: '1.10',
    title: 'Termination',
    bullets: [
      'We reserve the right to suspend or delete accounts.',
      'We reserve the right to remove content.',
      'We reserve the right to restrict access without prior notice.',
    ],
  },
  {
    number: '4',
    title: 'Liability Disclaimer',
    bullets: [
      'Sportshunt is not liable for injuries during play.',
      'Sportshunt is not liable for venue conditions.',
      'Sportshunt is not liable for organizer mismanagement.',
      'Sportshunt is not liable for user disputes.',
      'You participate at your own risk.',
    ],
  },
  {
    number: '5',
    title: 'Changes to Policy',
    bullets: [
      'We may update policies at any time.',
      'Continued use of Sportshunt means acceptance of the latest version of these policies.',
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <>
      <PublicHeader />
      <main className="bg-canvas">
        <section className="border-b border-line bg-white">
          <div className="page-shell space-y-5 py-16">
            <SectionHeading
              eyebrow="Sportshunt policy"
              title="Terms & Conditions"
              copy="SPORTSHUNT – TERMS, PRIVACY & CANCELLATION POLICY. These terms govern how users, venue owners, organizers, referees, and administrators use the platform."
            />
          </div>
        </section>

        <section className="page-shell space-y-6">
          {TERMS_SECTIONS.map((section) => (
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
