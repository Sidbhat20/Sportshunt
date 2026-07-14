'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useApp } from '@/components/app-provider';
import { BrandLockup } from '@/components/brand';
import { SPRING, SPRING_SOFT } from '@/components/motion/primitives';
import { cn } from '@/lib/utils';

export type SidebarItem = {
  href: string;
  label: string;
  icon: string;
  match?: 'exact' | 'prefix';
};

export type SidebarSection = {
  title?: string;
  items: SidebarItem[];
};

function SidebarNav({
  sections,
  pathname,
  onNavigate,
  idPrefix,
}: {
  sections: SidebarSection[];
  pathname: string;
  onNavigate?: () => void;
  idPrefix: string;
}) {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <div
          key={section.title ?? `section-${sectionIndex}`}
          className={cn('mb-4', sectionIndex === 0 && 'mt-1')}
        >
          {section.title ? (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {section.title}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active =
                item.match === 'exact'
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      active ? 'text-accentDeep' : 'text-muted hover:bg-canvas hover:text-ink',
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId={`${idPrefix}-sidebar-active`}
                        className="absolute inset-0 rounded-xl bg-accentSoft"
                        transition={SPRING_SOFT}
                      />
                    ) : null}
                    <span
                      className={cn('relative z-10 text-base', active ? 'text-accent' : 'text-muted')}
                      aria-hidden
                    >
                      {item.icon}
                    </span>
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export function DashboardShell({
  brand,
  brandSub,
  brandHref,
  sections,
  topbarExtras,
  children,
}: {
  brand: string;
  brandSub?: string;
  brandHref: string;
  sections: SidebarSection[];
  topbarExtras?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, unreadNotifications } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push('/');
    setDrawerOpen(false);
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Mobile side drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile side drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-card transition-transform duration-300 lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <BrandLockup href={brandHref} accent="green" size="sm" subtitle={brandSub} />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-ink"
          >
            ✕
          </button>
        </div>
        <p className="px-4 pt-2 text-xs text-muted">{brand}</p>
        <nav className="flex-1 overflow-y-auto p-3">
          <SidebarNav
            sections={sections}
            pathname={pathname}
            onNavigate={() => setDrawerOpen(false)}
            idPrefix="mobile"
          />
        </nav>
        <div className="border-t border-line p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-canvas hover:text-ink"
          >
            <span aria-hidden>↩</span>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white/80 backdrop-blur lg:flex">
          <div className="border-b border-line px-6 py-5">
            <BrandLockup href={brandHref} accent="green" size="sm" subtitle={brandSub} />
            <p className="mt-2 text-xs text-muted">{brand}</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <SidebarNav sections={sections} pathname={pathname} idPrefix="desktop" />
          </nav>

          <div className="border-t border-line p-3">
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-canvas hover:text-ink"
            >
              <span aria-hidden>↩</span>
              Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-soft lg:hidden"
              >
                <span aria-hidden>☰</span>
                <span className="hidden sm:inline">Menu</span>
              </button>
              <div className="lg:hidden">
                <BrandLockup href={brandHref} accent="green" size="sm" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {topbarExtras}
              <Link
                href="/notifications"
                className="relative rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-soft"
                aria-label="Notifications"
              >
                <span aria-hidden>🔔</span>
                {unreadNotifications ? (
                  <motion.span
                    key={unreadNotifications}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={SPRING}
                    className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white"
                  >
                    {unreadNotifications}
                  </motion.span>
                ) : null}
              </Link>
              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-soft">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accentSoft text-xs font-semibold text-accentDeep">
                    {(session?.name ?? '?').slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline max-w-[120px] truncate">{session?.name}</span>
                  <span className="text-muted">▾</span>
                </summary>
                <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-line bg-white p-3 shadow-card">
                  <div className="border-b border-line px-3 pb-3">
                    <p className="font-medium text-ink">{session?.name}</p>
                    <p className="mt-1 text-xs text-muted">{session?.email}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                      {session?.role.replace('_', ' ')}
                    </p>
                  </div>
                  <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-canvas"
                  >
                    Logout
                  </button>
                </div>
              </details>
            </div>
          </header>

          <main className="dash-shell">{children}</main>
        </div>
      </div>
    </div>
  );
}
