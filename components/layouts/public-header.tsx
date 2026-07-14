'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarCheck, List, SignOut, SoccerBall, Trophy, X } from '@phosphor-icons/react';
import { useApp } from '@/components/app-provider';
import { BrandLockup } from '@/components/brand';
import { EASE_OUT, SPRING } from '@/components/motion/primitives';
import { APP_ROUTES, homeForRole } from '@/lib/routes';

const NAV_ITEMS = [
  { href: '/games', label: 'Find Games', icon: SoccerBall },
  { href: '/turfs', label: 'Book Turfs', icon: CalendarCheck },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
];

export function PublicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push(APP_ROUTES.home);
    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-md">
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <BrandLockup href={APP_ROUTES.home} accent="green" size="sm" className="min-w-fit" />

          <nav className="hidden items-center justify-center gap-1 md:flex" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${active ? 'text-accent' : 'text-ink/70 hover:text-accent'}`}
                >
                  <Icon size={17} weight={active ? 'fill' : 'bold'} className="text-accent" />
                  {item.label}
                  {active ? (
                    <motion.span layoutId="public-nav-active" className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-accent" transition={SPRING} />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-2">
            {session ? (
              <>
                <Link href={homeForRole(session.role)} className="accent-btn hidden md:inline-flex">My space</Link>
                <button onClick={handleLogout} className="ghost-btn hidden md:inline-flex">Logout</button>
              </>
            ) : (
              <Link href={`${APP_ROUTES.login}?role=player`} className="accent-btn hidden md:inline-flex">Login</Link>
            )}
            <button onClick={() => setMenuOpen(true)} aria-label="Open navigation" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white text-ink shadow-soft transition hover:border-accent md:hidden">
              <List size={24} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div className="fixed inset-0 z-50 flex flex-col bg-canvas md:hidden" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
            <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-6">
              <BrandLockup href={APP_ROUTES.home} accent="green" size="sm" />
              <button onClick={() => setMenuOpen(false)} aria-label="Close navigation" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white text-ink">
                <X size={22} weight="bold" />
              </button>
            </div>

            <motion.nav className="flex flex-col gap-1 p-4 sm:px-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.href} variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE_OUT } } }}>
                    <Link href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-4 rounded-2xl px-4 py-4 text-base font-semibold text-ink transition hover:bg-accentSoft hover:text-accent">
                      <Icon size={25} weight="bold" className="text-accent" /> {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            <div className="mt-auto space-y-3 border-t border-line p-4 sm:px-6">
              {session ? (
                <>
                  <Link href={homeForRole(session.role)} onClick={() => setMenuOpen(false)} className="accent-btn w-full justify-center">My space</Link>
                  <button onClick={handleLogout} className="secondary-btn w-full justify-center"><SignOut size={18} weight="bold" /> Logout</button>
                </>
              ) : (
                <Link href={`${APP_ROUTES.login}?role=player`} onClick={() => setMenuOpen(false)} className="accent-btn w-full justify-center">Login / Signup</Link>
              )}
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-mutedSoft">GET · SET · HUNT</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
