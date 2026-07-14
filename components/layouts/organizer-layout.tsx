'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { RoleGuard } from '@/components/guards';
import { DashboardShell, SidebarSection } from '@/components/layouts/dashboard-shell';
import { APP_ROUTES } from '@/lib/routes';

export function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['organizer']}>
      <OrganizerChrome>{children}</OrganizerChrome>
    </RoleGuard>
  );
}

function OrganizerChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { myOrganizations, currentOrganization, currentOrganizationId, setCurrentOrganization } =
    useApp();

  const sections: SidebarSection[] = [
    {
      items: [
        { href: APP_ROUTES.organizerDashboard, label: 'Dashboard', icon: '◆' },
        { href: '/organizer/organizations', label: 'Organizations', icon: '◉' },
      ],
    },
    {
      title: currentOrganization?.name ?? 'Organization',
      items: [
        { href: '/organizer/tournaments', label: 'Tournaments', icon: '✦' },
        { href: '/organizer/members', label: 'Members', icon: '◌' },
        { href: '/organizer/billing', label: 'Billing', icon: '₹' },
      ],
    },
  ];

  const switcher = myOrganizations.length ? (
    <select
      value={currentOrganizationId ?? myOrganizations[0]?.id}
      onChange={(event) => {
        setCurrentOrganization(event.target.value);
        router.refresh();
      }}
      className="max-w-[10rem] truncate rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-soft sm:max-w-[14rem]"
    >
      {myOrganizations.map((organization) => (
        <option key={organization.id} value={organization.id}>
          {organization.name}
        </option>
      ))}
    </select>
  ) : null;

  return (
    <DashboardShell
      brand="Organizer"
      brandSub="Organizer"
      brandHref={APP_ROUTES.organizerDashboard}
      sections={sections}
      topbarExtras={switcher}
    >
      {children}
    </DashboardShell>
  );
}
