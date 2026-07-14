import type { Turf, TurfSlot } from '@/types';

const SPORT_IMAGES: Record<string, string[]> = {
  Football: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=82',
  ],
  Futsal: [
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=82',
  ],
  Badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1611251135345-18c56206b863?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?auto=format&fit=crop&w=900&q=80',
  ],
  Basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=900&q=82',
  ],
  Tennis: [
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=80',
  ],
  Cricket: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=900&q=82',
  ],
  'Box Cricket': [
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=82',
  ],
  Pickleball: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=900&q=82',
  ],
  'Table Tennis': [
    'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=900&q=82',
  ],
  Volleyball: [
    'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80',
  ],
};

function imageFor(sport: string, seed: number): string {
  const pool = SPORT_IMAGES[sport] ?? SPORT_IMAGES.Football;
  return pool[seed % pool.length];
}

const STANDARD_SLOTS: Array<{ id: string; label: string }> = [
  { id: 's_t_06', label: 'Today · 6:00 AM – 7:00 AM' },
  { id: 's_t_07', label: 'Today · 7:00 AM – 8:00 AM' },
  { id: 's_t_08', label: 'Today · 8:00 AM – 9:00 AM' },
  { id: 's_t_09', label: 'Today · 9:00 AM – 10:00 AM' },
  { id: 's_t_16', label: 'Today · 4:00 PM – 5:00 PM' },
  { id: 's_t_17', label: 'Today · 5:00 PM – 6:00 PM' },
  { id: 's_t_18', label: 'Today · 6:00 PM – 7:00 PM' },
  { id: 's_t_19', label: 'Today · 7:00 PM – 8:00 PM' },
  { id: 's_t_20', label: 'Today · 8:00 PM – 9:00 PM' },
  { id: 's_t_21', label: 'Today · 9:00 PM – 10:00 PM' },
  { id: 's_n_06', label: 'Tomorrow · 6:00 AM – 7:00 AM' },
  { id: 's_n_07', label: 'Tomorrow · 7:00 AM – 8:00 AM' },
  { id: 's_n_08', label: 'Tomorrow · 8:00 AM – 9:00 AM' },
  { id: 's_n_17', label: 'Tomorrow · 5:00 PM – 6:00 PM' },
  { id: 's_n_18', label: 'Tomorrow · 6:00 PM – 7:00 PM' },
  { id: 's_n_19', label: 'Tomorrow · 7:00 PM – 8:00 PM' },
  { id: 's_n_20', label: 'Tomorrow · 8:00 PM – 9:00 PM' },
];

function buildSlots(turfId: string, seed: number): TurfSlot[] {
  return STANDARD_SLOTS.map((slot, index) => ({
    id: `${turfId}_${slot.id}`,
    label: slot.label,
    available: !((seed + index) % 5 === 0),
  }));
}

type SeedEntry = {
  shortId: string;
  name: string;
  sport: string;
  location: string;
  price: number;
};

const SEED_ENTRIES: SeedEntry[] = [
  // ── Football turfs ─────────────────────────────────────────────────────
  { shortId: 'fb01', name: 'The Field', sport: 'Football', location: 'Koramangala 5th Block, Bangalore', price: 2800 },
  { shortId: 'fb02', name: 'Turf Town Indiranagar', sport: 'Football', location: 'Indiranagar 100 Feet Road, Bangalore', price: 3000 },
  { shortId: 'fb03', name: 'Pitch Nation Whitefield', sport: 'Football', location: 'Whitefield ITPL Main Road, Bangalore', price: 2200 },
  { shortId: 'fb04', name: 'Goal Republic HSR', sport: 'Football', location: 'HSR Layout Sector 1, Bangalore', price: 2400 },
  { shortId: 'fb05', name: 'Arena FC', sport: 'Football', location: 'Marathahalli Bridge, Bangalore', price: 2000 },
  { shortId: 'fb06', name: 'Kick Off Arena', sport: 'Football', location: 'Bannerghatta Road, JP Nagar, Bangalore', price: 1800 },
  { shortId: 'fb07', name: 'AstroTurf BLR', sport: 'Football', location: 'Bellandur Gate, Outer Ring Road, Bangalore', price: 2600 },
  { shortId: 'fb08', name: 'Playscape Sarjapur', sport: 'Football', location: 'Sarjapur Road, Bangalore', price: 2400 },
  { shortId: 'fb09', name: 'Hebbal Greens FC', sport: 'Football', location: 'Hebbal Kempapura, Bangalore', price: 2300 },
  { shortId: 'fb10', name: 'Five-A-Side Yelahanka', sport: 'Football', location: 'Yelahanka New Town, Bangalore', price: 1900 },
  { shortId: 'fb11', name: 'Jayanagar Football Park', sport: 'Football', location: 'Jayanagar 9th Block, Bangalore', price: 2100 },
  { shortId: 'fb12', name: 'BTM Turf Arena', sport: 'Football', location: 'BTM Layout 2nd Stage, Bangalore', price: 2200 },
  { shortId: 'fb13', name: 'Electronic City FC', sport: 'Football', location: 'Electronic City Phase 2, Bangalore', price: 2000 },
  { shortId: 'fb14', name: 'Malleswaram Goals', sport: 'Football', location: 'Malleswaram 8th Cross, Bangalore', price: 2200 },
  { shortId: 'fb15', name: 'Banashankari Goals Hub', sport: 'Football', location: 'Banashankari 3rd Stage, Bangalore', price: 2000 },
  { shortId: 'fb16', name: 'RT Nagar Turf', sport: 'Football', location: 'RT Nagar Main Road, Bangalore', price: 2100 },
  { shortId: 'fb17', name: 'Kasturi Nagar Turf', sport: 'Football', location: 'Kasturi Nagar, Bangalore', price: 2300 },
  { shortId: 'fb18', name: 'Rajajinagar Football Zone', sport: 'Football', location: 'Rajajinagar 5th Block, Bangalore', price: 2200 },

  // ── Futsal (indoor football) ───────────────────────────────────────────
  { shortId: 'ft01', name: 'Indoor FC Koramangala', sport: 'Futsal', location: 'Koramangala 6th Block, Bangalore', price: 1800 },
  { shortId: 'ft02', name: 'Domes Indoor Arena', sport: 'Futsal', location: 'HSR Layout Sector 7, Bangalore', price: 2000 },

  // ── Badminton courts ───────────────────────────────────────────────────
  { shortId: 'bd01', name: 'Smash Club', sport: 'Badminton', location: 'Koramangala 7th Block, Bangalore', price: 450 },
  { shortId: 'bd02', name: 'Rally Courts', sport: 'Badminton', location: 'Indiranagar CMH Road, Bangalore', price: 500 },
  { shortId: 'bd03', name: 'Shuttle Zone', sport: 'Badminton', location: 'Whitefield Hope Farm Junction, Bangalore', price: 380 },
  { shortId: 'bd04', name: 'Pro Shuttle Academy', sport: 'Badminton', location: 'JP Nagar 6th Phase, Bangalore', price: 420 },
  { shortId: 'bd05', name: 'Feather Court', sport: 'Badminton', location: 'Jayanagar 4th Block, Bangalore', price: 400 },
  { shortId: 'bd06', name: 'Ace Smash Arena', sport: 'Badminton', location: 'Hebbal Flyover, Bangalore', price: 350 },
  { shortId: 'bd07', name: 'Net Play Courts', sport: 'Badminton', location: 'Electronic City Phase 1, Bangalore', price: 320 },
  { shortId: 'bd08', name: 'Championship Badminton', sport: 'Badminton', location: 'Malleswaram 15th Cross, Bangalore', price: 480 },
  { shortId: 'bd09', name: 'Sarjapur Smash House', sport: 'Badminton', location: 'Sarjapur Main Road, Bangalore', price: 420 },
  { shortId: 'bd10', name: 'BTM Badminton Centre', sport: 'Badminton', location: 'BTM Layout 1st Stage, Bangalore', price: 380 },
  { shortId: 'bd11', name: 'Yelahanka Shuttle Club', sport: 'Badminton', location: 'Yelahanka Phase 1, Bangalore', price: 360 },
  { shortId: 'bd12', name: 'Bellandur Drive Smash', sport: 'Badminton', location: 'Bellandur, Outer Ring Road, Bangalore', price: 440 },
  { shortId: 'bd13', name: 'Banashankari Badminton', sport: 'Badminton', location: 'Banashankari 2nd Stage, Bangalore', price: 400 },
  { shortId: 'bd14', name: 'Marathahalli Smash Pro', sport: 'Badminton', location: 'Marathahalli ORR, Bangalore', price: 420 },
  { shortId: 'bd15', name: 'HSR Sector 6 Courts', sport: 'Badminton', location: 'HSR Layout Sector 6, Bangalore', price: 460 },
  { shortId: 'bd16', name: 'Bannerghatta Shuttle Hub', sport: 'Badminton', location: 'Bannerghatta Main Road, Bangalore', price: 380 },
  { shortId: 'bd17', name: 'RR Nagar Badminton', sport: 'Badminton', location: 'Rajarajeshwari Nagar, Bangalore', price: 360 },
  { shortId: 'bd18', name: 'Hennur Smash Academy', sport: 'Badminton', location: 'Hennur Main Road, Bangalore', price: 380 },
  { shortId: 'bd19', name: 'Kalyan Nagar Courts', sport: 'Badminton', location: 'Kalyan Nagar HRBR Layout, Bangalore', price: 420 },
  { shortId: 'bd20', name: 'Vijayanagar Badminton', sport: 'Badminton', location: 'Vijayanagar West, Bangalore', price: 360 },

  // ── Basketball courts ──────────────────────────────────────────────────
  { shortId: 'bk01', name: 'Hoops Arena Koramangala', sport: 'Basketball', location: 'Koramangala 4th Block, Bangalore', price: 700 },
  { shortId: 'bk02', name: 'Dunk House Indiranagar', sport: 'Basketball', location: 'Indiranagar 12th Main, Bangalore', price: 750 },
  { shortId: 'bk03', name: 'Whitefield Hoops Club', sport: 'Basketball', location: 'Whitefield AECS Layout, Bangalore', price: 650 },
  { shortId: 'bk04', name: 'JP Nagar Basketball', sport: 'Basketball', location: 'JP Nagar 4th Phase, Bangalore', price: 600 },
  { shortId: 'bk05', name: 'Sarjapur Slam Centre', sport: 'Basketball', location: 'Sarjapur Road, Bangalore', price: 700 },
  { shortId: 'bk06', name: 'Hebbal Hoops', sport: 'Basketball', location: 'Hebbal Outer Ring Road, Bangalore', price: 600 },

  // ── Tennis courts ──────────────────────────────────────────────────────
  { shortId: 'tn01', name: 'Ace Tennis Indiranagar', sport: 'Tennis', location: 'Indiranagar Defence Colony, Bangalore', price: 900 },
  { shortId: 'tn02', name: 'Match Point HSR', sport: 'Tennis', location: 'HSR Layout Sector 2, Bangalore', price: 850 },
  { shortId: 'tn03', name: 'Sarjapur Tennis Club', sport: 'Tennis', location: 'Sarjapur Road, Bangalore', price: 800 },
  { shortId: 'tn04', name: 'Yelahanka Tennis Park', sport: 'Tennis', location: 'Yelahanka Sathya Sai Layout, Bangalore', price: 750 },
  { shortId: 'tn05', name: 'Whitefield Tennis Academy', sport: 'Tennis', location: 'Whitefield Brookefield, Bangalore', price: 900 },
  { shortId: 'tn06', name: 'Jayanagar Tennis Court', sport: 'Tennis', location: 'Jayanagar 5th Block, Bangalore', price: 800 },

  // ── Cricket / Box Cricket ──────────────────────────────────────────────
  { shortId: 'ck01', name: 'Box Cricket Arena Koramangala', sport: 'Box Cricket', location: 'Koramangala 8th Block, Bangalore', price: 1800 },
  { shortId: 'ck02', name: 'HSR Box Cricket', sport: 'Box Cricket', location: 'HSR Layout Sector 3, Bangalore', price: 1600 },
  { shortId: 'ck03', name: 'Whitefield Cricket Nets', sport: 'Cricket', location: 'Whitefield Varthur Road, Bangalore', price: 1400 },
  { shortId: 'ck04', name: 'Sarjapur Cricket Hub', sport: 'Cricket', location: 'Sarjapur Attibele Road, Bangalore', price: 1500 },
  { shortId: 'ck05', name: 'Yelahanka Cricket Park', sport: 'Cricket', location: 'Yelahanka Doddaballapur Road, Bangalore', price: 1500 },
  { shortId: 'ck06', name: 'JP Nagar Box Cricket', sport: 'Box Cricket', location: 'JP Nagar 7th Phase, Bangalore', price: 1700 },
  { shortId: 'ck07', name: 'Hebbal Cricket Ground', sport: 'Cricket', location: 'Hebbal Lake Road, Bangalore', price: 1600 },
  { shortId: 'ck08', name: 'Marathahalli Box Cricket', sport: 'Box Cricket', location: 'Marathahalli AECS Layout, Bangalore', price: 1500 },

  // ── Pickleball ─────────────────────────────────────────────────────────
  { shortId: 'pk01', name: 'Pickle Pop Koramangala', sport: 'Pickleball', location: 'Koramangala 1st Block, Bangalore', price: 700 },
  { shortId: 'pk02', name: 'Smash Pickle HSR', sport: 'Pickleball', location: 'HSR Layout Sector 4, Bangalore', price: 750 },
  { shortId: 'pk03', name: 'Sarjapur Pickle Club', sport: 'Pickleball', location: 'Sarjapur Road, Bangalore', price: 650 },
  { shortId: 'pk04', name: 'Whitefield Pickleball', sport: 'Pickleball', location: 'Whitefield Kadugodi, Bangalore', price: 700 },

  // ── Table Tennis ───────────────────────────────────────────────────────
  { shortId: 'tt01', name: 'TT Cube Indiranagar', sport: 'Table Tennis', location: 'Indiranagar HAL 2nd Stage, Bangalore', price: 300 },
  { shortId: 'tt02', name: 'Paddle Pro JP Nagar', sport: 'Table Tennis', location: 'JP Nagar 2nd Phase, Bangalore', price: 280 },
  { shortId: 'tt03', name: 'TT Arena HSR', sport: 'Table Tennis', location: 'HSR Layout Sector 1, Bangalore', price: 320 },

  // ── Volleyball ─────────────────────────────────────────────────────────
  { shortId: 'vl01', name: 'Sand Volley Koramangala', sport: 'Volleyball', location: 'Koramangala 3rd Block, Bangalore', price: 600 },
  { shortId: 'vl02', name: 'Hebbal Volleyball Park', sport: 'Volleyball', location: 'Hebbal Kempapura, Bangalore', price: 550 },
];

export const bangaloreTurfs: Turf[] = SEED_ENTRIES.map((entry, index) => {
  const id = `turf_blr_${entry.shortId}`;
  return {
    id,
    ownerId: 'owner_platform',
    name: entry.name,
    sport: entry.sport,
    location: entry.location,
    price: entry.price,
    photos: [imageFor(entry.sport, index)],
    approved: true,
    moderationStatus: 'approved',
    slots: buildSlots(id, index),
  };
});
