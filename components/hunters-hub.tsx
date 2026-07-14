'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { CaretDown, Clock, MapPin, Plus, UsersThree } from '@phosphor-icons/react';
import { PlayerAuthModal } from '@/components/player-auth-modal';
import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';
import { ProgressRing } from '@/components/motion/primitives';
import { useToast } from '@/components/motion/toast';
import { getHunterStatus, getHunterStatusTone, getHunterTimeLabel } from '@/lib/hunters';
import { getLocationArea } from '@/lib/turf-booking';

export function HuntersHub({ dashboard = false }: { dashboard?: boolean }) {
  const { state, session, createGame, joinGame } = useApp();
  const games = state.games.filter((game) => game.status !== 'suspended');
  const sports = Array.from(new Set(state.turfs.filter((turf) => turf.approved).map((turf) => turf.sport))).sort();
  const locations = Array.from(new Set(state.turfs.filter((turf) => turf.approved).map((turf) => turf.location))).sort();
  const [sportFilter, setSportFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [form, setForm] = useState({
    sport: sports[0] ?? 'Football',
    location: locations[0] ?? 'Koramangala, Bangalore',
    scheduledAt: '',
    maxPlayers: 10,
    autoFill: true,
    description: '',
  });
  const toast = useToast();
  const [openAuth, setOpenAuth] = useState(false);
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [pendingCreate, setPendingCreate] = useState(false);

  const sortedGames = useMemo(
    () =>
      [...games]
        .filter((game) => sportFilter === 'all' || game.sport === sportFilter)
        .filter((game) => locationFilter === 'all' || getLocationArea(game.location || game.turfName) === locationFilter)
        .sort((a, b) => {
          const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
          const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
          return aTime - bTime;
        }),
    [games, locationFilter, sportFilter],
  );
  const gameLocations = Array.from(new Set(games.map((game) => getLocationArea(game.location || game.turfName)))).sort();
  const [listRef] = useAutoAnimate<HTMLDivElement>();

  function submitCreate() {
    const result = createGame({
      sport: form.sport,
      location: form.location,
      scheduledAt: form.scheduledAt || undefined,
      maxPlayers: form.maxPlayers,
      autoFill: form.autoFill,
      description: form.description || undefined,
    });
    if (result.ok) {
      toast.success(result.message);
      setPendingCreate(false);
      setForm((current) => ({ ...current, scheduledAt: '', description: '' }));
    } else toast.error(result.message);
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session && !dashboard) {
      setPendingCreate(true);
      setOpenAuth(true);
      return;
    }
    submitCreate();
  }

  function submitJoin(gameId: string) {
    const result = joinGame(gameId);
    if (result.ok) {
      toast.success(result.message);
      setPendingGameId(null);
    } else toast.error(result.message);
  }

  function handleJoin(gameId: string) {
    if (!session && !dashboard) {
      setPendingGameId(gameId);
      setOpenAuth(true);
      return;
    }
    submitJoin(gameId);
  }

  useEffect(() => {
    if (!session || dashboard) return;
    if (pendingGameId) submitJoin(pendingGameId);
    if (pendingCreate) submitCreate();
  }, [dashboard, pendingCreate, pendingGameId, session]);

  return (
    <div className="space-y-6">
      {dashboard ? <PageHeader title="Open games" copy="Join nearby players or start a Hunt when you need a squad." /> : null}

      <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">{sortedGames.length} open games nearby</p>
            <p className="mt-1 text-xs text-muted">Find the right time and squad, then join in one tap.</p>
          </div>
          {!dashboard ? (
            <button type="button" onClick={() => document.getElementById('create-hunt')?.toggleAttribute('open')} className="accent-btn !rounded-xl">
              <Plus size={18} weight="bold" /> Start a Hunt
            </button>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label><span className="sr-only">Filter by sport</span><select value={sportFilter} onChange={(event) => setSportFilter(event.target.value)}><option value="all">All sports</option>{sports.map((sport) => <option key={sport}>{sport}</option>)}</select></label>
          <label><span className="sr-only">Filter by area</span><select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}><option value="all">All areas</option>{gameLocations.map((location) => <option key={location}>{location}</option>)}</select></label>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,_1.15fr)_minmax(320px,_0.85fr)]">
        <div ref={listRef} className="space-y-4 lg:order-1">
          {sortedGames.length ? sortedGames.map((game) => {
            const lifecycle = getHunterStatus(game);
            const full = game.players.length >= game.maxPlayers || game.status === 'filled';
            const spotsNeeded = Math.max(0, game.maxPlayers - game.players.length);
            return (
              <SurfaceCard key={game.id} className="space-y-4" interactive>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><StatusPill tone="accent">{game.sport}</StatusPill><StatusPill tone={getHunterStatusTone(lifecycle)}>{lifecycle}</StatusPill></div>
                    <h3 className="mt-3 text-xl font-semibold text-ink">{game.sport} game</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin size={15} weight="fill" className="text-accent" /> {getLocationArea(game.location || game.turfName)}</p>
                  </div>
                  <div className="text-right"><p className="scoreboard text-3xl text-accent">{spotsNeeded}</p><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">players needed</p></div>
                </div>

                <div className="grid gap-3 rounded-2xl bg-canvasAlt p-4 text-sm sm:grid-cols-3">
                  <div><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted"><Clock size={14} /> Starts</p><p className="mt-1 font-semibold text-ink">{getHunterTimeLabel(game)}</p></div>
                  <div><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted"><UsersThree size={14} /> Squad</p><div className="mt-1 flex items-center gap-2"><ProgressRing value={(game.players.length / Math.max(1, game.maxPlayers)) * 100} size={32} stroke={4} barClassName={full ? 'text-limeDeep' : 'text-accent'} /><span className="font-semibold text-ink">{game.players.length}/{game.maxPlayers}</span></div></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">Hosted by</p><p className="mt-1 truncate font-semibold text-ink">{game.createdByName}</p></div>
                </div>

                {game.description ? <p className="text-sm leading-6 text-muted">{game.description}</p> : null}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <div className="flex -space-x-1.5">{game.players.slice(0, 5).map((player) => <span key={`${game.id}-${player.id}`} title={player.name} className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-accentSoft text-xs font-bold text-accentDeep">{player.name.slice(0, 1).toUpperCase()}</span>)}</div>
                  <button onClick={() => handleJoin(game.id)} disabled={full || lifecycle === 'completed'} className="accent-btn !rounded-xl justify-center disabled:cursor-not-allowed disabled:opacity-60">{full ? 'Game full' : lifecycle === 'completed' ? 'Completed' : 'Join game'}</button>
                </div>
              </SurfaceCard>
            );
          }) : <EmptyState title="No open games match" body="Try another sport or area, or start a new Hunt." />}
        </div>

        <details id="create-hunt" open={dashboard} className="group lg:order-2 lg:open:block">
          <summary className="mb-3 flex cursor-pointer list-none items-center justify-between rounded-2xl border border-line bg-white p-4 font-semibold text-ink shadow-soft lg:hidden"><span className="flex items-center gap-2"><UsersThree size={20} weight="bold" className="text-accent" /> Start a Hunt</span><CaretDown size={18} className="transition-transform group-open:rotate-180" /></summary>
          <SurfaceCard className="space-y-4 lg:sticky lg:top-24">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Create game</p><h2 className="mt-1 text-lg font-semibold text-ink">Need players for your session?</h2><p className="mt-1 text-sm text-muted">Set the basics and nearby players can join.</p></div>
            <form className="space-y-3" onSubmit={handleCreate}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><div><label className="mb-1.5 block text-xs font-semibold text-muted">Sport</label><select value={form.sport} onChange={(event) => setForm((current) => ({ ...current, sport: event.target.value }))}>{sports.map((sport) => <option key={sport}>{sport}</option>)}</select></div><div><label className="mb-1.5 block text-xs font-semibold text-muted">Location</label><select value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}>{locations.map((location) => <option key={location}>{getLocationArea(location)}</option>)}</select></div></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><div><label className="mb-1.5 block text-xs font-semibold text-muted">Date & time</label><input type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm((current) => ({ ...current, scheduledAt: event.target.value }))} /></div><div><label className="mb-1.5 block text-xs font-semibold text-muted">Squad size</label><select value={form.maxPlayers} onChange={(event) => setForm((current) => ({ ...current, maxPlayers: Number(event.target.value) }))}>{[4, 6, 8, 10, 12, 14].map((count) => <option key={count} value={count}>{count} players</option>)}</select></div></div>
              <div><label className="mb-1.5 block text-xs font-semibold text-muted">What kind of game?</label><input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Casual, competitive, beginners welcome" /></div>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-canvasAlt p-4"><span><span className="block text-sm font-semibold text-ink">Automatically accept players</span><span className="mt-1 block text-xs text-muted">Anyone can join until the game is full.</span></span><input type="checkbox" checked={form.autoFill} onChange={(event) => setForm((current) => ({ ...current, autoFill: event.target.checked }))} className="h-5 w-5 accent-accent" /></label>
              <button className="accent-btn w-full !rounded-xl"><Plus size={18} weight="bold" /> Publish Hunt</button>
            </form>
          </SurfaceCard>
        </details>
      </div>

      {!dashboard ? <PlayerAuthModal open={openAuth} onClose={() => { setOpenAuth(false); setPendingGameId(null); setPendingCreate(false); }} title="Login to join or start a game" /> : null}
    </div>
  );
}
