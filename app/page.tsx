'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useApp } from '@/components/app-provider';
import { PublicHeader } from '@/components/layouts/public-header';
import { PublicFooter } from '@/components/layouts/public-footer';
import { SectionHeading, StatusPill } from '@/components/ui';
import {
  CountUp,
  EASE_OUT,
  FlipValue,
  Reveal,
  RevealImage,
  Stagger,
  StaggerItem,
} from '@/components/motion/primitives';
import { useViewTransitionNav } from '@/components/motion/view-transition';
import { getSportImage } from '@/lib/turf-booking';
import { formatDate, formatMoney } from '@/lib/utils';
import { homeForRole } from '@/lib/roles';
import { SportsHeroIllustration } from '@/components/home/sports-hero-illustration';
import { PlayPath } from '@/components/home/play-path';
import { QuickFind } from '@/components/home/quick-find';

const TICKER_ITEMS = [
  'Get.Set.Hunt',
  'Book the turf',
  'Fill the squad',
  'Run the bracket',
  'Lift the trophy',
  'Hyperlocal play',
  'Player-first',
];


export default function HomePage() {
  const { state, session } = useApp();
  const liveTurfs = state.turfs.filter((turf) => turf.approved).slice(0, 3);
  const openGames = state.games.filter((game) => game.status === 'open').slice(0, 3);
  const liveTournaments = state.tournaments
    .filter((item) => item.approvalStatus === 'approved' && item.publicStatus === 'live')
    .slice(0, 3);
  const liveMatches = useMemo(
    () =>
      state.tournaments
        .filter(
          (tournament) =>
            tournament.approvalStatus === 'approved' && tournament.publicStatus === 'live',
        )
        .flatMap((tournament) =>
          tournament.matches
            .filter(
              (match) =>
                match.status === 'live' && match.participantAName && match.participantBName,
            )
            .map((match) => ({
              id: match.id,
              tournamentId: tournament.id,
              tournamentName: tournament.name,
              sport: tournament.sport,
              venue: tournament.venue,
              court: match.refereeAssignment?.court,
              createdAt: match.refereeAssignment?.createdAt,
              participantAName: match.participantAName ?? 'TBD',
              participantBName: match.participantBName ?? 'TBD',
              roundLabel: match.roundLabel,
              setSummary: match.scorecard?.summary,
              score:
                typeof match.scoreA === 'number' && typeof match.scoreB === 'number'
                  ? `${match.scoreA} - ${match.scoreB}`
                  : '0 - 0',
            })),
        ),
    [state.tournaments],
  );

  const scheduledMatches = useMemo(
    () =>
      state.tournaments
        .filter(
          (tournament) =>
            tournament.approvalStatus === 'approved' && tournament.publicStatus === 'live',
        )
        .flatMap((tournament) =>
          tournament.matches
            .filter(
              (match) =>
                match.status === 'scheduled' &&
                match.refereeAssignment &&
                match.participantAName &&
                match.participantBName,
            )
            .map((match) => ({
              id: match.id,
              tournamentId: tournament.id,
              tournamentName: tournament.name,
              sport: tournament.sport,
              venue: tournament.venue,
              court: match.refereeAssignment?.court,
              createdAt: match.refereeAssignment?.createdAt,
              participantAName: match.participantAName ?? 'TBD',
              participantBName: match.participantBName ?? 'TBD',
              roundLabel: match.roundLabel,
            })),
        )
        .sort(
          (left, right) =>
            new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime(),
        )
        .slice(0, 3),
    [state.tournaments],
  );

  const recentCompletedMatches = useMemo(
    () =>
      state.tournaments
        .filter(
          (tournament) =>
            tournament.approvalStatus === 'approved' && tournament.publicStatus === 'live',
        )
        .flatMap((tournament) =>
          tournament.matches
            .filter(
              (match) =>
                ['completed', 'verified'].includes(match.status) &&
                match.participantAName &&
                match.participantBName,
            )
            .map((match) => ({
              id: match.id,
              tournamentName: tournament.name,
              participantAName: match.participantAName ?? 'TBD',
              participantBName: match.participantBName ?? 'TBD',
              roundLabel: match.roundLabel,
              score:
                typeof match.scoreA === 'number' && typeof match.scoreB === 'number'
                  ? `${match.scoreA} - ${match.scoreB}`
                  : 'Final',
              setSummary: match.scorecard?.summary,
            })),
        )
        .slice(0, 4),
    [state.tournaments],
  );

  const [liveMatchIndex, setLiveMatchIndex] = useState(0);

  useEffect(() => {
    if (liveMatches.length <= 1) return;
    const timer = window.setInterval(() => {
      setLiveMatchIndex((current) => (current + 1) % liveMatches.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [liveMatches.length]);

  const featuredLiveMatch = liveMatches[liveMatchIndex] ?? null;

  const stats = {
    sports: new Set([
      ...state.turfs.filter((item) => item.approved).map((item) => item.sport),
      ...state.games.filter((item) => item.status === 'open').map((item) => item.sport),
      ...liveTournaments.map((item) => item.sport),
    ]).size,
    tournaments: liveTournaments.length,
    turfs: state.turfs.filter((t) => t.approved).length,
    games: state.games.filter((g) => g.status === 'open').length,
  };

  const navigate = useViewTransitionNav();
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const glowYa = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 130]);
  const glowYb = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -90]);

  return (
    <>
      <PublicHeader />
      <main id="main-content" className="relative overflow-hidden bg-canvas">
        {/* HERO — asymmetric, oversized, sports-poster energy */}
        <section ref={heroRef} className="relative overflow-hidden border-b border-line">
          <div className="pitch-grid absolute inset-0" />
          <div className="stripe-diag absolute right-0 top-0 h-full w-1/2 opacity-40" />

          {/* Big floating sport ball glow — subtle scroll parallax */}
          <motion.div
            style={{ y: glowYa }}
            className="pointer-events-none absolute -right-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-accent/8 blur-3xl"
          />
          <motion.div
            style={{ y: glowYb }}
            className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-lime/15 blur-3xl"
          />

          {/* Corner field markings */}
          <div className="corner-mark left-6 top-6 border-l-[3px] border-t-[3px]" />
          <div className="corner-mark right-6 top-6 border-r-[3px] border-t-[3px]" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              {/* LEFT — oversized headline */}
              <Stagger className="space-y-7" stagger={0.1} delayChildren={0.1} amount={0}>
                <StaggerItem className="inline-flex items-center gap-3 rounded-full border-2 border-ink bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-ink shadow-soft">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                  </span>
                  Get · Set · Hunt
                </StaggerItem>

                <StaggerItem>
                  <h1 className="display font-display text-[2.65rem] leading-[0.9] text-ink sm:text-[4.2rem] lg:text-[6.25rem]">
                    Your city.
                    <br />
                    Your{' '}
                    <span className="relative inline-block text-accent">
                      game.
                      <motion.svg
                        aria-hidden
                        viewBox="0 0 220 14"
                        className="absolute -bottom-2 left-0 w-full text-accent"
                        fill="none"
                      >
                        <motion.path
                          d="M2 8 Q 50 1 110 7 T 218 5"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.5 }}
                        />
                      </motion.svg>
                    </span>
                    <br />
                    <span className="text-ink">Go hunt.</span>
                  </h1>
                </StaggerItem>

                <StaggerItem>
                  <p className="max-w-xl text-base leading-7 text-muted sm:text-lg">
                    Find a game, book a turf, or enter a tournament near you. Sportshunt puts your
                    local sports scene in one fast, player-first place.
                  </p>
                </StaggerItem>

                <StaggerItem className="max-w-3xl pt-2">
                  <QuickFind />
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
                    <Link href="/games" className="text-accent transition hover:text-accentDeep">
                      Join an open game →
                    </Link>
                    <Link
                      href={session ? homeForRole(session.role) : '/login?role=player'}
                      className="text-muted transition hover:text-ink"
                    >
                      {session ? 'Open my dashboard' : 'Player login'}
                    </Link>
                  </div>
                </StaggerItem>
              </Stagger>

              {/* RIGHT — custom animated 2D sports poster */}
              <Reveal className="relative" y={28} delay={0.2} amount={0}>
                <SportsHeroIllustration
                  games={stats.games}
                  turfs={stats.turfs}
                  tournaments={stats.tournaments}
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* TICKER — full-bleed marquee, scoreboard energy */}
        <div className="ticker">
          <div className="marquee-track animate-marquee">
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker-item">
                <span aria-hidden className="text-lime">
                  ★
                </span>
                {item}
                <span aria-hidden className="text-accent">
                  ●
                </span>
              </span>
            ))}
          </div>
        </div>

        <PlayPath />

        {/* TURFS */}
        <section className="relative">
          <div className="page-shell space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="01 · Turfs"
                title="Book the field. Own the night."
                copy="Real-time slots, transparent pricing, one-tap booking — across every premium venue in the network."
              />
              <Link href="/turfs" className="ghost-btn">
                View all turfs <span aria-hidden>→</span>
              </Link>
            </div>

            {liveTurfs.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-line bg-chalk p-12 text-center text-muted">
                No approved turfs yet — they'll appear here as venues come online.
              </div>
            ) : (
              <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {liveTurfs.map((turf) => (
                  <StaggerItem key={turf.id}>
                  <Link
                    href={`/turf/${turf.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      const link = event.currentTarget;
                      navigate(`/turf/${turf.id}`, () => {
                        const image = link.querySelector('img');
                        if (image) image.style.viewTransitionName = 'turf-hero';
                      });
                    }}
                    className="group relative block h-full overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-bold transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:translate-x-[-2px] hover:shadow-[10px_10px_0_0_#0a1410]"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <RevealImage
                        src={turf.photos[0]}
                        alt={`${turf.name} ${turf.sport} venue in ${turf.location}`}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover saturate-[1.08] contrast-[1.04] transition-transform duration-700 group-hover:scale-110"
                        onError={(event) => {
                          event.currentTarget.src = getSportImage(turf.sport, turf.id);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <StatusPill tone="lime">{turf.sport}</StatusPill>
                      </div>
                      <div className="absolute right-3 top-3">
                        <span className="inline-flex items-center gap-1 rounded-full border-2 border-white bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-lime">
                          {formatMoney(turf.price)}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="display font-display text-2xl text-white drop-shadow-lg">
                          {turf.name}
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                          {turf.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t-2 border-ink p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        <span className="text-accent">
                          {turf.slots.filter((s) => s.available).length}
                        </span>{' '}
                        slots open
                      </p>
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent transition-all group-hover:translate-x-1">
                        Book →
                      </span>
                    </div>
                  </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </section>

        {/* OPEN GAMES — split layout with side accent panel */}
        <section className="relative bg-canvasAlt/60 py-16">
          <div className="absolute inset-0 stripe-diag opacity-50" />
          <div className="relative page-shell !py-0 space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="02 · Hunters"
                title="Find a game. Meet your squad."
                copy="Casual, competitive, or chill — join nearby players or start a Hunt of your own."
              />
              <Link href="/games" className="ghost-btn">
                Browse open games <span aria-hidden>→</span>
              </Link>
            </div>

            {openGames.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-line bg-white p-12 text-center text-muted">
                No active hunts right now — start one and fill the squad.
              </div>
            ) : (
              <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {openGames.map((game) => {
                  const fillPct = Math.min(100, (game.players.length / game.maxPlayers) * 100);
                  return (
                    <StaggerItem
                      key={game.id}
                      whileHover={{ y: -4 }}
                      className="group h-full rounded-2xl border border-line bg-white p-6 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-accent hover:shadow-card"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                            {game.sport}
                          </p>
                          <h3 className="display mt-1 font-display text-2xl text-ink">
                            {game.turfName}
                          </h3>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                            {game.slotLabel}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="scoreboard text-3xl text-ink">
                            {game.players.length}
                            <span className="text-mutedSoft">/{game.maxPlayers}</span>
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                            Hunters
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="flex h-2.5 overflow-hidden rounded-full bg-canvasAlt">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-accent via-accent to-lime"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${fillPct}%` }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                          <span>{Math.round(fillPct)}% filled</span>
                          <span className="text-accent">
                            {game.maxPlayers - game.players.length} spots left
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                        <p className="text-xs text-muted">
                          Hosted by{' '}
                          <span className="font-semibold text-ink">{game.createdByName}</span>
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                          {game.autoFill ? 'Auto-fill' : 'Manual'}
                        </span>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </div>
        </section>

        {featuredLiveMatch ? (
          <section className="relative border-y border-line bg-white/70 py-10 backdrop-blur-sm">
            <div className="page-shell !py-0">
              <Reveal className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" y={28}>
                <div className="rounded-3xl border-2 border-ink bg-white p-6 shadow-boldGreen transition-all duration-300">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
                        Live match spotlight
                      </p>
                      <h2 className="mt-2 font-display text-3xl text-ink">
                        {featuredLiveMatch.participantAName} vs {featuredLiveMatch.participantBName}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusPill tone="live">Live</StatusPill>
                        <StatusPill tone="accent">{featuredLiveMatch.roundLabel}</StatusPill>
                        {featuredLiveMatch.court ? (
                          <StatusPill tone="lime">{featuredLiveMatch.court}</StatusPill>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-muted">
                        {featuredLiveMatch.tournamentName} • {featuredLiveMatch.sport} •{' '}
                        {featuredLiveMatch.venue}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {featuredLiveMatch.setSummary
                          ? `Sets: ${featuredLiveMatch.setSummary}`
                          : featuredLiveMatch.court
                            ? `Court: ${featuredLiveMatch.court}`
                            : 'Live now'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-canvas px-5 py-4 text-center">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                        Live score
                      </p>
                      <p className="scoreboard mt-2 text-4xl text-accent">
                        <FlipValue value={featuredLiveMatch.score} />
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        {liveMatches.length > 1
                          ? 'Rotates every 2 seconds across all live matches.'
                          : 'Currently the only live match.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                        Next up
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-ink">Upcoming live courts</h3>
                    </div>
                    <StatusPill tone="accent">{scheduledMatches.length}</StatusPill>
                  </div>

                  <div className="mt-4 space-y-3">
                    {scheduledMatches.length ? (
                      scheduledMatches.map((match) => (
                        <div key={match.id} className="rounded-2xl bg-canvas p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-ink">
                              {match.participantAName} vs {match.participantBName}
                            </p>
                            {match.court ? <StatusPill tone="lime">{match.court}</StatusPill> : null}
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            {match.tournamentName} • {match.roundLabel}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {match.court ? `Court: ${match.court}` : 'Awaiting court allocation'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl bg-canvas p-4 text-sm text-muted">
                        No scheduled referee matches waiting in the queue yet.
                      </p>
                    )}
                  </div>

                  <div className="mt-5 border-t border-line pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                        Previous scores
                      </p>
                      <StatusPill tone="success">{recentCompletedMatches.length}</StatusPill>
                    </div>
                    <div className="mt-3 space-y-3">
                      {recentCompletedMatches.length ? (
                        recentCompletedMatches.map((match) => (
                          <div key={match.id} className="rounded-2xl bg-canvas p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium text-ink">
                                {match.participantAName} vs {match.participantBName}
                              </p>
                              <p className="scoreboard text-xl text-accent">{match.score}</p>
                            </div>
                            <p className="mt-1 text-xs text-muted">
                              {match.tournamentName} • {match.roundLabel}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {match.setSummary ? `Sets: ${match.setSummary}` : 'Set summary unavailable'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-2xl bg-canvas p-4 text-sm text-muted">
                          No finished match scores yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        {/* TOURNAMENTS — bold poster cards */}
        <section className="relative py-16">
          <div className="page-shell !py-0 space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="03 · Tournaments"
                title="The bracket. The bigger stage."
                copy="Real registrations, real fixtures, real-time leaderboards — the full operating system for tournaments of any scale."
              />
              <Link href="/tournaments" className="ghost-btn">
                Explore tournaments <span aria-hidden>→</span>
              </Link>
            </div>

            {liveTournaments.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-line bg-chalk p-12 text-center text-muted">
                No live tournaments published yet — organizers, your stage awaits.
              </div>
            ) : (
              <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {liveTournaments.map((tournament) => (
                  <StaggerItem
                    key={tournament.id}
                    whileHover={{ y: -4, x: -2 }}
                    className="group relative h-full overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-boldGreen transition-[box-shadow] duration-300 hover:shadow-[10px_10px_0_0_#15803d]"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <RevealImage
                        src={tournament.poster || getSportImage(tournament.sport, tournament.id)}
                        alt={`${tournament.name} ${tournament.sport} tournament`}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover saturate-[1.08] contrast-[1.04] transition-transform duration-700 group-hover:scale-110"
                        onError={(event) => {
                          event.currentTarget.src = getSportImage(tournament.sport, tournament.id);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <StatusPill tone="lime">{tournament.sport}</StatusPill>
                        <StatusPill tone="success">{tournament.status}</StatusPill>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="display font-display text-2xl text-white drop-shadow-lg">
                          {tournament.name}
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x-2 divide-y-2 divide-ink/10 border-t-2 border-ink">
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                          Starts
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {formatDate(tournament.startDate)}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                          Venue
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-ink">
                          {tournament.venue}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                          Events
                        </p>
                        <p className="scoreboard mt-1 text-2xl text-accent">
                          <CountUp value={tournament.events.length} />
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                          Registered
                        </p>
                        <p className="scoreboard mt-1 text-2xl text-ink">
                          <CountUp value={tournament.registrations.length} />
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </section>

        {/* CTA — bold full-width green panel */}
        <section className="relative">
          <div className="page-shell">
            <Reveal
              className="relative overflow-hidden rounded-3xl border-2 border-ink bg-ink p-10 text-white shadow-bold sm:p-14"
              y={32}
            >
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-lime/25 blur-3xl" />
              <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-b from-accent via-lime to-accent" />

              <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div className="space-y-5">
                  <p className="inline-flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-lime">
                    <span aria-hidden>★</span>
                    Player-first experience
                  </p>
                  <h2 className="display font-display text-[2rem] leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                    Step in.
                    <br />
                    <span className="text-lime">Get · Set · Hunt.</span>
                  </h2>
                  <p className="max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                    Book tonight's turf, jump into an open game, or register for the next local
                    tournament. Sportshunt keeps the player journey fast, clean, and friction-free.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                  <Link href="/login?role=player" className="lime-btn w-full sm:w-auto">
                    Player Login
                  </Link>
                  <Link
                    href="/tournaments"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white bg-transparent px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-ink sm:w-auto"
                  >
                    Explore Tournaments
                  </Link>
                  <Link
                    href="/turfs"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70 transition-all hover:text-lime sm:w-auto"
                  >
                    Browse Venues →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <PublicFooter />
      </main>
    </>
  );
}
