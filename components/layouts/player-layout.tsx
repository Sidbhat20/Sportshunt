'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, CalendarCheck, House, SoccerBall, Trophy } from '@phosphor-icons/react';
import { RoleGuard } from '@/components/guards';
import { useApp } from '@/components/app-provider';
import { BrandLockup } from '@/components/brand';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/player/home', label: 'Home', icon: House },
  { href: '/player/booking', label: 'Book', icon: CalendarCheck },
  { href: '/player/games', label: 'Games', icon: SoccerBall },
  { href: '/player/tournaments', label: 'Events', icon: Trophy },
];

export function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['user']}>
      <PlayerChrome>{children}</PlayerChrome>
    </RoleGuard>
  );
}

function PlayerChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, unreadNotifications } = useApp();

  return (
    <div className="min-h-screen bg-canvas pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <BrandLockup href="/player/home" accent="green" size="sm" />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-accent text-white shadow-soft'
                      : 'text-muted hover:bg-white hover:text-ink',
                  )}
                >
                  <Icon size={17} weight={active ? 'fill' : 'bold'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-soft"
              aria-label="Notifications"
            >
              <Bell size={18} weight="bold" aria-hidden />
              {unreadNotifications ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
                  {unreadNotifications}
                </span>
              ) : null}
            </Link>
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-soft">
                {/* Always show avatar initial */}
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accentSoft text-xs font-semibold text-accentDeep">
                  {(session?.name ?? '?').slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[100px] truncate">{session?.name}</span>
                <span className="text-muted">▾</span>
              </summary>
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-line bg-white p-3 shadow-card">
                <div className="border-b border-line px-3 pb-3">
                  <p className="font-medium text-ink">{session?.name}</p>
                  <p className="mt-1 text-xs text-muted">{session?.email}</p>
                </div>
                <div className="mt-3 grid gap-1">
                  <Link
                    href="/player/home"
                    className="rounded-xl px-3 py-2 text-sm text-ink hover:bg-canvas"
                  >
                    My account
                  </Link>
                  <Link
                    href="/apply/organizer"
                    className="rounded-xl px-3 py-2 text-sm text-ink hover:bg-canvas"
                  >
                    Apply as organizer
                  </Link>
                  <Link
                    href="/apply/venue-owner"
                    className="rounded-xl px-3 py-2 text-sm text-ink hover:bg-canvas"
                  >
                    List your venue
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-canvas"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="dash-shell">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden">
        <ul className="grid grid-cols-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold',
                    active ? 'text-accent' : 'text-muted',
                  )}
                >
                  <Icon size={21} weight={active ? 'fill' : 'bold'} aria-hidden />
                  <span className="leading-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
