'use client';

import { RoleGuard } from '@/components/guards';
import { DashboardShell, SidebarSection } from '@/components/layouts/dashboard-shell';
import { APP_ROUTES } from '@/lib/routes';

const sections: SidebarSection[] = [
  {
    items: [
      { href: APP_ROUTES.venueDashboard, label: 'Dashboard', icon: '◆' },
      { href: '/venue/turfs', label: 'Turfs', icon: '◧' },
      { href: '/venue/bookings', label: 'Bookings', icon: '◷' },
      { href: '/venue/settings', label: 'Settings', icon: '◌' },
    ],
  },
];

export function VenueLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['venue_owner']}>
      <DashboardShell
        brand="Venue Owner"
        brandSub="Venue"
        brandHref={APP_ROUTES.venueDashboard}
        sections={sections}
      >
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
