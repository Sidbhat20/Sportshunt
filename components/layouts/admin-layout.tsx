'use client';

import { RoleGuard } from '@/components/guards';
import { DashboardShell, SidebarSection } from '@/components/layouts/dashboard-shell';

const sections: SidebarSection[] = [
  {
    title: 'Platform',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: '◆' },
      { href: '/admin/users', label: 'Users', icon: '◉' },
      { href: '/admin/organizations', label: 'Organizations', icon: '◎' },
    ],
  },
  {
    title: 'Quality',
    items: [
      { href: '/admin/approvals', label: 'Approvals', icon: '✓' },
      { href: '/admin/tournaments', label: 'Tournaments', icon: '✦' },
      { href: '/admin/moderation', label: 'Moderation', icon: '⚑' },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['super_admin']}>
      <DashboardShell
        brand="Super Admin"
        brandSub="Admin"
        brandHref="/admin/dashboard"
        sections={sections}
      >
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
