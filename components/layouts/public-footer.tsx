import Link from 'next/link';
import { BrandLockup } from '@/components/brand';
import { Reveal } from '@/components/motion/primitives';
import { APP_ROUTES } from '@/lib/routes';

const EXPLORE_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/games', label: 'Find Games' },
  { href: '/turfs', label: 'Turfs & Courts' },
  { href: '/tournaments', label: 'Tournaments' },
];

const POLICY_LINKS = [
  { href: APP_ROUTES.termsAndConditions, label: 'Terms & Conditions' },
  { href: APP_ROUTES.privacyPolicy, label: 'Privacy Policy' },
  { href: APP_ROUTES.cancellationPolicy, label: 'Cancellation Policy' },
];

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t-2 border-ink bg-canvasAlt">
      <Reveal
        className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8 lg:py-14"
        y={16}
        amount={0.1}
      >
        <div className="space-y-5 lg:pr-6">
          <BrandLockup href="/" accent="green" size="md" subtitle="Get · Set · Hunt" />
          <p className="max-w-md text-sm leading-7 text-muted">
            Sportshunt is the player-first home for turf bookings, tournaments, community play,
            and referee-assisted match scoring.
          </p>
          <div className="space-y-1 text-sm text-muted">
            <p>
              Phone:{' '}
              <a href="tel:+919148751879" className="font-semibold text-ink hover:text-accent">
                +91 9148751879
              </a>
            </p>
            <p>
              Email:{' '}
              <a
                href="mailto:contact@sportshunt@gmail.com"
                className="font-semibold text-ink hover:text-accent"
              >
                contact@sportshunt@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent">Explore</p>
          <div className="flex flex-col gap-2 text-sm text-muted">
            {EXPLORE_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent">Policies</p>
          <div className="flex flex-col gap-2 text-sm text-muted">
            {POLICY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            Restricted access
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted">
            <Link href={APP_ROUTES.partnerLogin} className="hover:text-accent">
              Partner / Admin Login
            </Link>
            <Link href="/login?role=referee" className="hover:text-accent">
              Referee Login
            </Link>
            <Link href="/login?role=player" className="hover:text-accent">
              Player Login
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 Sportshunt. All rights reserved.</p>
          <p>Made for Bangalore's local sports community.</p>
        </div>
      </div>
    </footer>
  );
}
