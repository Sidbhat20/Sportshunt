import { Turf, TurfSlot } from '@/types';

export type PriceFilter = 'all' | 'under-500' | '500-1500' | '1500-plus';

export type GroupedTurfSlot = TurfSlot & {
  dayKey: string;
  dayLabel: string;
  timeLabel: string;
};

export type TurfSlotGroup = {
  key: string;
  label: string;
  slots: GroupedTurfSlot[];
};

const SPORT_GALLERY: Record<string, string[]> = {
  Football: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1400&q=80',
  ],
  Futsal: [
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=82',
  ],
  Badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1611251135345-18c56206b863?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?auto=format&fit=crop&w=1400&q=80',
  ],
  Basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1400&q=82',
  ],
  Tennis: [
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1400&q=80',
  ],
  Cricket: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1400&q=82',
  ],
  'Box Cricket': [
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1400&q=82',
  ],
  Pickleball: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=82',
  ],
  'Table Tennis': [
    'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1400&q=82',
  ],
  Volleyball: [
    'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1400&q=80',
  ],
  Throwball: [
    'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=1400&q=80',
  ],
  Squash: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=80',
  ],
  Padel: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1400&q=80',
  ],
  Hockey: [
    'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1400&q=82',
  ],
  Kabaddi: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1400&q=80',
  ],
};

function hashValue(input: string) {
  return input.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getSportGallery(sport: string): string[] {
  return SPORT_GALLERY[sport] ?? SPORT_GALLERY.default;
}

export function getSportImage(sport: string, seed: string = sport): string {
  const gallery = getSportGallery(sport);
  const idx = hashValue(seed) % gallery.length;
  return gallery[idx];
}

export function getLocationArea(location: string) {
  return location.replace(/,\s*Bangalore$/i, '').trim();
}

export function matchesPriceFilter(price: number, filter: PriceFilter) {
  if (filter === 'under-500') return price < 500;
  if (filter === '500-1500') return price >= 500 && price <= 1500;
  if (filter === '1500-plus') return price > 1500;
  return true;
}

export function parseSlotLabel(label: string) {
  const [rawDay, rawTime] = label.split('·').map((part) => part.trim());
  const dayLabel = rawDay || 'Today';
  const timeLabel = rawTime || label;
  const dayKey = dayLabel.toLowerCase().replace(/\s+/g, '-');
  return { dayKey, dayLabel, timeLabel };
}

export function groupSlotsByDay(slots: TurfSlot[]): TurfSlotGroup[] {
  const groups = new Map<string, TurfSlotGroup>();

  slots.forEach((slot) => {
    const parsed = parseSlotLabel(slot.label);
    const existing = groups.get(parsed.dayKey);
    const nextSlot: GroupedTurfSlot = {
      ...slot,
      dayKey: parsed.dayKey,
      dayLabel: parsed.dayLabel,
      timeLabel: parsed.timeLabel,
    };

    if (existing) {
      existing.slots.push(nextSlot);
      return;
    }

    groups.set(parsed.dayKey, {
      key: parsed.dayKey,
      label: parsed.dayLabel,
      slots: [nextSlot],
    });
  });

  return Array.from(groups.values());
}

export function getTurfGallery(turf: Turf) {
  const sportGallery = getSportGallery(turf.sport);
  const turfPhotos = (turf.photos ?? []).filter(Boolean);
  return Array.from(new Set([...turfPhotos, ...sportGallery]));
}

export function getTurfPrimaryPhoto(turf: Turf) {
  if (turf.photos && turf.photos[0]) return turf.photos[0];
  return getSportImage(turf.sport, turf.id);
}

export function getTurfMeta(turf: Turf) {
  const seed = hashValue(turf.id);
  const sportLower = turf.sport.toLowerCase();
  const isOutdoor = ['football', 'futsal', 'cricket', 'box cricket', 'hockey'].includes(sportLower);
  const count = isOutdoor ? 1 + (seed % 3) : 4 + (seed % 5);
  const courtLabel = isOutdoor ? 'turfs' : 'courts';

  const baseAmenities = ['Parking', 'Washroom', 'Lighting'];
  const extraAmenities = isOutdoor
    ? ['Drinking water', 'Changing room', 'Bib rental', 'Ball rental']
    : ['Equipment rental', 'Seating area', 'Drinking water', 'Locker space'];

  return {
    fullLocation: turf.location,
    sportsAvailable: [turf.sport],
    count,
    countLabel: `${count} ${courtLabel}`,
    amenities: [...baseAmenities, ...extraAmenities.slice(0, 2 + (seed % 2))],
    description: `${turf.name} is a Bangalore venue for ${turf.sport.toLowerCase()} sessions with fast booking, transparent pricing, and flexible hourly slots.`,
  };
}
