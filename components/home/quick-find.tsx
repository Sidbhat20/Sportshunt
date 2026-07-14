'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDots, Crosshair, MapPin, SoccerBall } from '@phosphor-icons/react';
import { useApp } from '@/components/app-provider';
import { getLocationArea } from '@/lib/turf-booking';

export function QuickFind() {
  const router = useRouter();
  const { state } = useApp();
  const approvedTurfs = state.turfs.filter((turf) => turf.approved);
  const sports = useMemo(
    () => Array.from(new Set(approvedTurfs.map((turf) => turf.sport))).sort(),
    [approvedTurfs],
  );
  const locations = useMemo(
    () => Array.from(new Set(approvedTurfs.map((turf) => getLocationArea(turf.location)))).sort(),
    [approvedTurfs],
  );
  const [sport, setSport] = useState(sports[0] ?? 'Football');
  const [location, setLocation] = useState(locations[0] ?? 'Koramangala 5th Block');
  const [when, setWhen] = useState('today');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ sport, location, when });
    router.push(`/turfs?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-2 rounded-[1.4rem] border-2 border-ink bg-white p-2 shadow-[6px_6px_0_0_#15803d] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_auto]"
    >
      <label className="group rounded-xl px-3 py-2 transition-colors focus-within:bg-accentSofter hover:bg-canvasAlt">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
          <MapPin size={15} weight="bold" className="text-accent" /> Location
        </span>
        <select
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="mt-1 !rounded-none !border-0 !bg-transparent !p-0 !text-sm !font-semibold !shadow-none !ring-0"
          aria-label="Choose area"
        >
          {locations.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>

      <label className="group rounded-xl px-3 py-2 transition-colors focus-within:bg-accentSofter hover:bg-canvasAlt">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
          <SoccerBall size={15} weight="bold" className="text-accent" /> Sport
        </span>
        <select
          value={sport}
          onChange={(event) => setSport(event.target.value)}
          className="mt-1 !rounded-none !border-0 !bg-transparent !p-0 !text-sm !font-semibold !shadow-none !ring-0"
          aria-label="Choose sport"
        >
          {sports.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>

      <label className="group rounded-xl px-3 py-2 transition-colors focus-within:bg-accentSofter hover:bg-canvasAlt">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
          <CalendarDots size={15} weight="bold" className="text-accent" /> When
        </span>
        <select
          value={when}
          onChange={(event) => setWhen(event.target.value)}
          className="mt-1 !rounded-none !border-0 !bg-transparent !p-0 !text-sm !font-semibold !shadow-none !ring-0"
          aria-label="Choose date"
        >
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="weekend">This weekend</option>
        </select>
      </label>

      <button className="accent-btn min-h-14 w-full !rounded-xl px-5 lg:w-auto" type="submit">
        <Crosshair size={18} weight="bold" /> Find
      </button>
    </form>
  );
}
