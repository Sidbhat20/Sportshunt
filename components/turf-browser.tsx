'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  ArrowRight,
  CalendarDots,
  CheckCircle,
  Clock,
  FunnelSimple,
  MagnifyingGlass,
  MapPin,
  Star,
} from '@phosphor-icons/react';
import { useApp } from '@/components/app-provider';
import { EmptyState, StatusPill } from '@/components/ui';
import { RevealImage } from '@/components/motion/primitives';
import {
  getLocationArea,
  getTurfMeta,
  getTurfPrimaryPhoto,
  groupSlotsByDay,
  matchesPriceFilter,
  PriceFilter,
} from '@/lib/turf-booking';
import { formatMoney } from '@/lib/utils';

const PRICE_OPTIONS: Array<{ value: PriceFilter; label: string }> = [
  { value: 'all', label: 'Any price' },
  { value: 'under-500', label: 'Under ₹500' },
  { value: '500-1500', label: '₹500 – ₹1,500' },
  { value: '1500-plus', label: 'Above ₹1,500' },
];

function hashValue(input: string) {
  return input.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function venueRating(id: string) {
  return (4.3 + (hashValue(id) % 6) / 10).toFixed(1);
}

function reviewCount(id: string) {
  return 28 + (hashValue(id) % 173);
}

function nextOpenLabel(slots: Array<{ id: string; label: string; available: boolean }>, when: string) {
  const groups = groupSlotsByDay(slots);
  const preferred = when === 'tomorrow' ? groups[1] : groups[0];
  const open = preferred?.slots.find((slot) => slot.available) ?? groups.flatMap((group) => group.slots).find((slot) => slot.available);
  return open ? `${open.dayLabel}, ${open.timeLabel.split('–')[0].trim()}` : 'Check availability';
}

export function TurfBrowser({ ctaLabel = 'View slots' }: { ctaLabel?: string }) {
  const { state } = useApp();
  const searchParams = useSearchParams();
  const turfs = state.turfs.filter((turf) => turf.approved);
  const sports = useMemo(() => Array.from(new Set(turfs.map((turf) => turf.sport))).sort(), [turfs]);
  const locations = useMemo(
    () => Array.from(new Set(turfs.map((turf) => getLocationArea(turf.location)))).sort(),
    [turfs],
  );

  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState(searchParams.get('sport') ?? 'all');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') ?? 'all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sort, setSort] = useState('recommended');
  const when = searchParams.get('when') ?? 'today';

  useEffect(() => {
    setSportFilter(searchParams.get('sport') ?? 'all');
    setLocationFilter(searchParams.get('location') ?? 'all');
  }, [searchParams]);

  const filteredTurfs = useMemo(() => {
    const result = turfs.filter((turf) => {
      const area = getLocationArea(turf.location);
      const haystack = `${turf.name} ${turf.sport} ${turf.location}`.toLowerCase();
      return (
        (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
        (sportFilter === 'all' || turf.sport === sportFilter) &&
        (locationFilter === 'all' || area === locationFilter) &&
        matchesPriceFilter(turf.price, priceFilter)
      );
    });

    return [...result].sort((left, right) => {
      if (sort === 'price-low') return left.price - right.price;
      if (sort === 'availability') {
        return right.slots.filter((slot) => slot.available).length - left.slots.filter((slot) => slot.available).length;
      }
      if (sort === 'rating') return Number(venueRating(right.id)) - Number(venueRating(left.id));
      return Number(venueRating(right.id)) - Number(venueRating(left.id)) || left.price - right.price;
    });
  }, [locationFilter, priceFilter, query, sort, sportFilter, turfs]);

  const [gridRef] = useAutoAnimate<HTMLDivElement>();
  const activeFilters = [sportFilter !== 'all', locationFilter !== 'all', priceFilter !== 'all', Boolean(query)].filter(Boolean).length;

  function clearFilters() {
    setQuery('');
    setSportFilter('all');
    setLocationFilter('all');
    setPriceFilter('all');
  }

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-line bg-white p-3 shadow-soft sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.75fr_0.85fr_0.75fr]">
          <label className="relative">
            <span className="sr-only">Search venues</span>
            <MagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" size={18} weight="bold" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search venue or area"
              className="!pl-11"
            />
          </label>
          <label>
            <span className="sr-only">Location</span>
            <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
              <option value="all">All Bangalore areas</option>
              {locations.map((location) => <option key={location}>{location}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Price</span>
            <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value as PriceFilter)}>
              {PRICE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort venues</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="availability">Most availability</option>
              <option value="rating">Highest rated</option>
              <option value="price-low">Lowest price</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setSportFilter('all')} className={sportFilter === 'all' ? 'primary-btn !px-4 !py-2' : 'secondary-btn !px-4 !py-2'}>
            All sports
          </button>
          {sports.map((sport) => (
            <button key={sport} onClick={() => setSportFilter(sport)} className={sportFilter === sport ? 'primary-btn !px-4 !py-2' : 'secondary-btn !px-4 !py-2'}>
              {sport}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-muted">
          <FunnelSimple size={17} weight="bold" className="text-accent" />
          <span><strong className="text-ink">{filteredTurfs.length}</strong> venues found</span>
          {activeFilters ? <StatusPill tone="accent">{activeFilters} filters</StatusPill> : null}
        </p>
        {activeFilters ? <button onClick={clearFilters} className="ghost-btn">Clear filters</button> : null}
      </div>

      {filteredTurfs.length ? (
        <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTurfs.map((turf) => {
            const openSlots = turf.slots.filter((slot) => slot.available).length;
            const meta = getTurfMeta(turf);
            return (
              <article key={turf.id} className="group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-card">
                <Link href={`/turf/${turf.id}`} className="block">
                  <div className="relative h-56 overflow-hidden">
                    <RevealImage
                      src={getTurfPrimaryPhoto(turf)}
                      alt={`${turf.name} ${turf.sport} venue in ${turf.location}`}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover saturate-[1.08] contrast-[1.04] transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/10" />
                    <div className="absolute left-4 top-4 flex gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent shadow-soft">
                        <CheckCircle size={14} weight="fill" /> Verified
                      </span>
                      <span className="rounded-full bg-ink/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">{turf.sport}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">{turf.name}</h2>
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-white/85">
                          <MapPin size={13} weight="fill" /> {getLocationArea(turf.location)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/95 px-3 py-2 text-right text-ink shadow-soft">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">From</p>
                        <p className="font-bold">{formatMoney(turf.price)}</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-1.5 font-semibold text-ink">
                      <Star size={16} weight="fill" className="text-amber-500" />
                      {venueRating(turf.id)} <span className="font-normal text-muted">({reviewCount(turf.id)})</span>
                    </div>
                    <span className="text-xs font-medium text-muted">{meta.countLabel}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-canvasAlt p-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted"><Clock size={14} /> Next open</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{nextOpenLabel(turf.slots, when)}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted"><CalendarDots size={14} /> Availability</p>
                      <p className="mt-1 text-sm font-semibold text-accent">{openSlots} slots open</p>
                    </div>
                  </div>

                  <Link href={`/turf/${turf.id}`} className="accent-btn mt-4 w-full !rounded-xl">
                    {ctaLabel} <ArrowRight size={17} weight="bold" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No venues match" body="Try a different sport, area, price, or search term." action={<button onClick={clearFilters} className="secondary-btn">Reset filters</button>} />
      )}
    </div>
  );
}
